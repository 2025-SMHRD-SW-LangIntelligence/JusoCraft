package com.firemap.backend.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.firemap.backend.entity.FireReportEntity;
import com.firemap.backend.enums.ReportInputStatus;
import com.firemap.backend.repository.FireReportRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLEncoder;
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
            // 1. 기준 시각 계산
            LocalDateTime now = LocalDateTime.now();
            int hour = now.getMinute() < 45 ? now.getHour() - 1 : now.getHour();
            hour = Math.max(hour, 0);
            String baseDate = now.format(DateTimeFormatter.ofPattern("yyyyMMdd"));
            String baseTime = String.format("%02d00", hour);

            // 2. 화재 데이터 조회
            List<FireReportEntity> fireReports = fireReportRepository.findByInputStatus(ReportInputStatus.REPORTED);
            List<Map<String, Object>> fires = new ArrayList<>();

            // 3. 화재별 날씨 정보 조회
            for (FireReportEntity fire : fireReports) {
                if (fire.getFireLat() != null && fire.getFireLng() != null) {
                    int[] grid = convertLatLonToGrid(fire.getFireLat(), fire.getFireLng());
                    Map<String, Map<String, String>> weather = fetchHourlyWeather(baseDate, baseTime, grid[0], grid[1]);

                    Map<String, Object> fireMap = new HashMap<>();
                    fireMap.put("lat", fire.getFireLat());
                    fireMap.put("lon", fire.getFireLng());
                    fireMap.put("address", fire.getFireAddress());
                    fireMap.put("status", fire.getStatus() != null ? fire.getStatus().name() : "UNKNOWN");
                    fireMap.put("weather", weather); // ⬅️ 시간대별 날씨 추가

                    fires.add(fireMap);
                }
            }

            Map<String, Object> response = new HashMap<>();
            response.put("fires", fires);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of(
                    "error", "서버 내부 오류 발생",
                    "message", e.getMessage()
            ));
        }
    }

    // 위도/경도를 격자로 변환
    private int[] convertLatLonToGrid(double lat, double lon) {
        double RE = 6371.00877, GRID = 5.0, SLAT1 = 30.0, SLAT2 = 60.0, OLON = 126.0, OLAT = 38.0, XO = 43, YO = 136;
        double DEGRAD = Math.PI / 180.0;
        double re = RE / GRID;
        double slat1 = SLAT1 * DEGRAD, slat2 = SLAT2 * DEGRAD, olon = OLON * DEGRAD, olat = OLAT * DEGRAD;

        double sn = Math.tan(Math.PI * 0.25 + slat2 * 0.5) / Math.tan(Math.PI * 0.25 + slat1 * 0.5);
        sn = Math.log(Math.cos(slat1) / Math.cos(slat2)) / Math.log(sn);
        double sf = Math.tan(Math.PI * 0.25 + slat1 * 0.5);
        sf = Math.pow(sf, sn) * Math.cos(slat1) / sn;
        double ro = Math.tan(Math.PI * 0.25 + olat * 0.5);
        ro = re * sf / Math.pow(ro, sn);
        double ra = Math.tan(Math.PI * 0.25 + lat * DEGRAD * 0.5);
        ra = re * sf / Math.pow(ra, sn);
        double theta = lon * DEGRAD - olon;
        if (theta > Math.PI) theta -= 2.0 * Math.PI;
        if (theta < -Math.PI) theta += 2.0 * Math.PI;
        theta *= sn;

        int nx = (int) (ra * Math.sin(theta) + XO + 0.5);
        int ny = (int) (ro - ra * Math.cos(theta) + YO + 0.5);
        return new int[]{nx, ny};
    }

    // 시간대별 날씨 정보를 가져옴
    private Map<String, Map<String, String>> fetchHourlyWeather(String baseDate, String baseTime, int nx, int ny) throws Exception {
        StringBuilder urlBuilder = new StringBuilder("http://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtFcst");
        urlBuilder.append("?").append("serviceKey=").append("ytCyyNGSl1oComuubu0zT%2FVckVg0s4iSAqTsYLLA8rj2Zdh8Zbt8CF4gaIXNQSFigQ0SJ%2FJdvTLBYOonwzg2kw%3D%3D");
        urlBuilder.append("&pageNo=1&numOfRows=1000&dataType=JSON");
        urlBuilder.append("&base_date=").append(baseDate);
        urlBuilder.append("&base_time=").append(baseTime);
        urlBuilder.append("&nx=").append(nx).append("&ny=").append(ny);

        URL url = new URL(urlBuilder.toString());
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        conn.setRequestMethod("GET");
        conn.setRequestProperty("Content-type", "application/json");

        BufferedReader rd = new BufferedReader(new InputStreamReader(
                conn.getResponseCode() >= 200 && conn.getResponseCode() <= 300
                        ? conn.getInputStream()
                        : conn.getErrorStream(), StandardCharsets.UTF_8));
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
            String category = item.path("category").asText(); // T1H, VEC, WSD
            String fcstTime = item.path("fcstTime").asText();
            String value = item.path("fcstValue").asText();

            if (List.of("T1H", "WSD", "VEC").contains(category)) {
                hourly.computeIfAbsent(fcstTime, k -> new HashMap<>()).put(category, value);
            }
        }

        return hourly;
    }
}
