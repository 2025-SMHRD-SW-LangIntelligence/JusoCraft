package com.firemap.backend.config;

import com.firemap.backend.entity.EmergencyInfoEntity;
import com.firemap.backend.repository.EmergencyInfoRepository;
import com.opencsv.CSVReader;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.io.InputStreamReader;
import java.io.Reader;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

@Component
public class EmergencyInfoDataLoader {

    @Autowired
    EmergencyInfoRepository emergencyInfoRepository;

    @PostConstruct
    public void loadData() {
        try (Reader reader = new InputStreamReader(
                getClass().getResourceAsStream("/gwangju_emergency_info_utf8.csv"),
                StandardCharsets.UTF_8);
             CSVReader csvReader = new CSVReader(reader)) {

            String[] fields;
            csvReader.readNext();

            List<EmergencyInfoEntity> emergencyInfos = new ArrayList<>();

            while ((fields = csvReader.readNext()) != null) {
                if (fields.length < 10) continue;

                EmergencyInfoEntity emergencyInfo = EmergencyInfoEntity.builder()
                        .name(fields[0].trim())
                        .address(fields[1].trim())
                        .hasEmergencyRoom(Integer.parseInt(fields[2].trim()))
                        .isEmergencyRoomOperating(fields[3].trim())
                        .burnCare(fields[4].trim())
                        .endoscope(fields[5].trim())
                        .phone(fields[6].trim())
                        .code(fields[7].trim())
                        .latitude(Double.parseDouble(fields[8].trim()))
                        .longitude(Double.parseDouble(fields[9].trim()))
                        .build();

                emergencyInfos.add(emergencyInfo);
            }

            emergencyInfoRepository.saveAll(emergencyInfos);
            System.out.println("광주 응급실 데이터가 DB에 성공적으로 저장되었습니다. 총 개수: " + emergencyInfos.size());

        } catch (Exception e) {
            System.err.println("광주 응급실 CSV 파일 로드 중 오류 발생:");
            e.printStackTrace();
        }
    }
}
