package com.firemap.backend.config;

import com.firemap.backend.entity.HydrantEntity;
import com.firemap.backend.repository.HydrantRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

@Component
public class HydrantDataLoader {

    @Autowired
    private HydrantRepository hydrantRepository;

    @PostConstruct
    public void loadData() {
        try (BufferedReader br = new BufferedReader(new InputStreamReader(
                getClass().getResourceAsStream("/gwangju_fire_hydrants_utf8.csv"), StandardCharsets.UTF_8))) {

            String line;
            br.readLine(); // 헤더 스킵

            List<HydrantEntity> hydrants = new ArrayList<>();

            while ((line = br.readLine()) != null) {
                String[] fields = line.split(",", -1);

                HydrantEntity hydrant = HydrantEntity.builder()
                        .facilityNumber(fields[0].trim())
                        .sidoName(fields[1].trim())
                        .sigunguName(fields[2].trim())
                        .lat(Double.parseDouble(fields[3].trim()))
                        .lng(Double.parseDouble(fields[4].trim()))
                        .address(fields[5].trim())
                        .detailLocation(fields[6].trim())
                        .pressure(fields.length > 6 && !fields[7].trim().isEmpty() ? Double.valueOf(fields[7].trim()) : null)
                        .build();

                hydrants.add(hydrant);
            } 

            hydrantRepository.saveAll(hydrants);
            System.out.println("✅ 소화전 데이터가 DB에 성공적으로 저장되었습니다. 총 개수: " + hydrants.size());

        } catch (Exception e) {
            System.err.println("❌ 소화전 데이터 로드 실패:");
            e.printStackTrace();
        }
    }
}
