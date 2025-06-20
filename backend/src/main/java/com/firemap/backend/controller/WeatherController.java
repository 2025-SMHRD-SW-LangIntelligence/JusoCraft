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
            // 1. 기준 시각 계산 (정시 기준, 1시간 단위)
            LocalDateTime now = LocalDateTime.now();
            int hour = now.getMinute() < 45 ? now.getHour() - 1 : now.getHour();
            hour = Math.max(hour, 0);
            String baseDate = now.format(DateTimeFormatter.ofPattern("yyyyMMdd"));
            String baseTime = String.format("%02d00", hour);

            // 2. 기상청 초단기예보 API 호출
            StringBuilder urlBuilder = new StringBuilder("http://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtFcst");
            urlBuilder.append("?" + URLEncoder.encode("serviceKey", "UTF-8") + "=ytCyyNGSl1oComuubu0zT%2FVckVg0s4iSAqTsYLLA8rj2Zdh8Zbt8CF4gaIXNQSFigQ0SJ%2FJdvTLBYOonwzg2kw%3D%3D");
            urlBuilder.append("&" + URLEncoder.encode("pageNo", "UTF-8") + "=1");
            urlBuilder.append("&" + URLEncoder.encode("numOfRows", "UTF-8") + "=1000");
            urlBuilder.append("&" + URLEncoder.encode("dataType", "UTF-8") + "=JSON");
            urlBuilder.append("&" + URLEncoder.encode("base_date", "UTF-8") + "=" + baseDate);
            urlBuilder.append("&" + URLEncoder.encode("base_time", "UTF-8") + "=" + baseTime);
            urlBuilder.append("&" + URLEncoder.encode("nx", "UTF-8") + "=58");   // 좌표 변경 가능
            urlBuilder.append("&" + URLEncoder.encode("ny", "UTF-8") + "=74");

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

            // 3. JSON 파싱 및 시간대별 날씨 정보 그룹화
            ObjectMapper mapper = new ObjectMapper();
            JsonNode root = mapper.readTree(sb.toString());
            JsonNode items = root.path("response").path("body").path("items").path("item");

            // fcstTime 단위로 그룹핑
            Map<String, Map<String, String>> hourlyWeather = new LinkedHashMap<>();
            for (JsonNode item : items) {
                String category = item.path("category").asText();     // 예: T1H, WSD, VEC
                String fcstTime = item.path("fcstTime").asText();     // 예: 0900, 1000
                String value = item.path("fcstValue").asText();

                if (List.of("T1H", "WSD", "VEC").contains(category)) {
                    hourlyWeather.computeIfAbsent(fcstTime, k -> new HashMap<>())
                                 .put(category, value);
                }
            }

            // 4. 화재 위치 정보 조회 (REPORTED 상태 - 사용자가 위치를 전송했을 때)
            List<Map<String, Object>> fires = new ArrayList<>();
            List<FireReportEntity> fireReports = fireReportRepository.findByInputStatus(ReportInputStatus.REPORTED);

            System.out.println("조회된 화재 건수: " + fireReports.size());

            for (FireReportEntity fire : fireReports) {
                if (fire.getFireLat() != null && fire.getFireLng() != null) {
                    Map<String, Object> fireMap = new HashMap<>();
                    fireMap.put("lat", fire.getFireLat());
                    fireMap.put("lon", fire.getFireLng());
                    fireMap.put("address", fire.getFireAddress());
                    fireMap.put("status", fire.getStatus() != null ? fire.getStatus().name() : "UNKNOWN");  // 👈 이 줄 추가
                    fires.add(fireMap);
                }
            }


            // 5. 응답 구성
            Map<String, Object> response = new HashMap<>();
            response.put("weather", hourlyWeather);  // 시간별 날씨 데이터
            response.put("fires", fires);             // 화재 위치 데이터

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of(
                    "error", "서버 내부 오류 발생",
                    "message", e.getMessage()
            ));
        }
    }
}
