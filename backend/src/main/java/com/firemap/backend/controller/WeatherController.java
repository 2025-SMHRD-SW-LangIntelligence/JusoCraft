package com.firemap.backend.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.firemap.backend.entity.FireReportEntity;
import com.firemap.backend.enums.ReportInputStatus;
import com.firemap.backend.repository.FireReportRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class WeatherController {

    @Autowired
    private FireReportRepository fireReportRepository;

    @GetMapping("/weather")
    public ResponseEntity<?> getWeather() {
        try {
            LocalDateTime now = LocalDateTime.now();
            int hour = now.getMinute() < 45 ? now.getHour() - 1 : now.getHour();
            hour = Math.max(hour, 0);

            String baseDate = now.format(DateTimeFormatter.ofPattern("yyyyMMdd"));
            String baseTime = String.format("%02d00", hour);

            List<FireReportEntity> fireReports = fireReportRepository.findByInputStatus(ReportInputStatus.REPORTED);
            List<Map<String, Object>> fires = new ArrayList<>();

            for (FireReportEntity fire : fireReports) {
                if (fire.getFireLat() != null && fire.getFireLng() != null) {
                    int[] grid = convertLatLonToGrid(fire.getFireLat(), fire.getFireLng());
                    Map<String, Map<String, String>> weather = fetchHourlyWeather(baseDate, baseTime, grid[0], grid[1]);

                    Map<String, Object> fireMap = new HashMap<>();
                    fireMap.put("lat", fire.getFireLat());
                    fireMap.put("lon", fire.getFireLng());
                    fireMap.put("address", fire.getFireAddress());
                    fireMap.put("status", fire.getStatus() != null ? fire.getStatus().name() : "UNKNOWN");
                    fireMap.put("weather", weather);

                    fires.add(fireMap);
                }
            }

            return ResponseEntity.ok(Map.of("fires", fires));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of(
                    "error", "서버 내부 오류",
                    "message", e.getMessage()
            ));
        }
    }

    private int[] convertLatLonToGrid(double lat, double lon) {
        double RE = 6371.00877, GRID = 5.0, SLAT1 = 30.0, SLAT2 = 60.0, OLON = 126.0, OLAT = 38.0, XO = 43, YO = 136;
        double DEGRAD = Math.PI / 180.0;
        double re = RE / GRID;
        double slat1 = SLAT1 * DEGRAD, slat2 = SLAT2 * DEGRAD, olon = OLON * DEGRAD, olat = OLAT * DEGRAD;

        double sn = Math.log(Math.cos(slat1) / Math.cos(slat2)) /
                    Math.log(Math.tan(Math.PI * 0.25 + slat2 * 0.5) / Math.tan(Math.PI * 0.25 + slat1 * 0.5));
        double sf = Math.pow(Math.tan(Math.PI * 0.25 + slat1 * 0.5), sn) * Math.cos(slat1) / sn;
        double ro = re * sf / Math.pow(Math.tan(Math.PI * 0.25 + olat * 0.5), sn);

        double ra = re * sf / Math.pow(Math.tan(Math.PI * 0.25 + lat * DEGRAD * 0.5), sn);
        double theta = lon * DEGRAD - olon;
        if (theta > Math.PI) theta -= 2.0 * Math.PI;
        if (theta < -Math.PI) theta += 2.0 * Math.PI;
        theta *= sn;

        int nx = (int) (ra * Math.sin(theta) + XO + 0.5);
        int ny = (int) (ro - ra * Math.cos(theta) + YO + 0.5);
        return new int[]{nx, ny};
    }

    // 캐시 가능한 메서드로 분리
    @Cacheable(value = "weatherCache", key = "#baseDate + '_' + #baseTime + '_' + #nx + '_' + #ny")
    public Map<String, Map<String, String>> fetchHourlyWeather(String baseDate, String baseTime, int nx, int ny) throws Exception {
        String apiKey = "ytCyyNGSl1oComuubu0zT%2FVckVg0s4iSAqTsYLLA8rj2Zdh8Zbt8CF4gaIXNQSFigQ0SJ%2FJdvTLBYOonwzg2kw%3D%3D";
        String urlStr = String.format(
            "http://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtFcst?serviceKey=%s&pageNo=1&numOfRows=1000&dataType=JSON&base_date=%s&base_time=%s&nx=%d&ny=%d",
            apiKey, baseDate, baseTime, nx, ny
        );

        URL url = new URL(urlStr);
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        conn.setRequestMethod("GET");
        conn.setRequestProperty("Content-type", "application/json");

        BufferedReader rd = new BufferedReader(new InputStreamReader(
                conn.getResponseCode() >= 200 ? conn.getInputStream() : conn.getErrorStream(),
                StandardCharsets.UTF_8
        ));

        StringBuilder sb = new StringBuilder();
        String line;
        while ((line = rd.readLine()) != null) sb.append(line);
        rd.close();
        conn.disconnect();

        ObjectMapper mapper = new ObjectMapper();
        JsonNode root = mapper.readTree(sb.toString());
        JsonNode items = root.path("response").path("body").path("items").path("item");

        // 시간별 그룹화
        Map<String, Map<String, String>> hourly = new LinkedHashMap<>();
        for (JsonNode item : items) {
            String category = item.path("category").asText(); // T1H, VEC, WSD, PTY 등
            String fcstTime = item.path("fcstTime").asText();
            String value = item.path("fcstValue").asText();

            if (List.of("T1H", "WSD", "VEC", "PTY").contains(category)) {
                hourly.computeIfAbsent(fcstTime, k -> new HashMap<>()).put(category, value);
            }
        }

        return hourly;
    }

    // 위도, 경도로 단일 지점 날씨만 요청하는 API
    @GetMapping("/weather/point")
    public ResponseEntity<?> getWeatherForPoint(
            @RequestParam double lat,
            @RequestParam double lng
    ) {
        try {
            LocalDateTime now = LocalDateTime.now();
            int hour = now.getMinute() < 45 ? now.getHour() - 1 : now.getHour();
            hour = Math.max(hour, 0);

            String baseDate = now.format(DateTimeFormatter.ofPattern("yyyyMMdd"));
            String baseTime = String.format("%02d00", hour);

            int[] grid = convertLatLonToGrid(lat, lng);
            Map<String, Map<String, String>> weather = fetchHourlyWeather(baseDate, baseTime, grid[0], grid[1]);

            return ResponseEntity.ok(Map.of(
                "lat", lat,
                "lng", lng,
                "weather", weather
            ));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                "error", "날씨 정보 요청 중 오류 발생",
                "message", e.getMessage()
            ));
        }
    }

}
