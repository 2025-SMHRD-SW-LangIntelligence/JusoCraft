package com.firemap.backend.config;

import com.firemap.backend.entity.FireStationEntity;
import com.firemap.backend.repository.FireStationRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

@Component
public class FireStationDataLoader {

    @Autowired
    private FireStationRepository fireStationRepository;

    @PostConstruct
    public void loadData() {
        if (fireStationRepository.count() > 0) {
            System.out.println("광주 소방서 데이터는 이미 존재합니다. 추가 로딩 생략.");
            return;
        }

        try (BufferedReader br = new BufferedReader(new InputStreamReader(
                getClass().getResourceAsStream("/gwangju_fire_station_utf-8.csv"), StandardCharsets.UTF_8))) {

            String line;
            br.readLine(); // 헤더 스킵

            List<FireStationEntity> stations = new ArrayList<>();

            while ((line = br.readLine()) != null) {
                String[] fields = line.split(",");

                FireStationEntity station = FireStationEntity.builder()
                        .sidoHeadquarter(fields[0].trim())
                        .centerName(fields[1].trim())
                        .address(fields[2].trim())
                        .phone(fields[3].trim())
                        .fax(fields[4].trim())
                        .latitude(Double.parseDouble(fields[5].trim()))
                        .longitude(Double.parseDouble(fields[6].trim()))
                        .build();

                stations.add(station);
            }

            fireStationRepository.saveAll(stations);
            System.out.println("광주 소방서 데이터가 DB에 성공적으로 저장되었습니다. 총 개수: " + stations.size());

        } catch (Exception e) {
            System.err.println("광주 소방서 데이터 로드 실패:");
            e.printStackTrace();
        }
    }
}
