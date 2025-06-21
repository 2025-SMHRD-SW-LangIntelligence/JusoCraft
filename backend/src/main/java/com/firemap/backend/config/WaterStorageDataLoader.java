package com.firemap.backend.config;

import com.firemap.backend.entity.WaterStorageEntity;
import com.firemap.backend.repository.WaterStorageRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

@Component
public class WaterStorageDataLoader {

    @Autowired
    private WaterStorageRepository waterStorageRepository;

    @PostConstruct
    public void loadDate() {
        if (waterStorageRepository.count() > 0) {
            System.out.println("광주 저수지/댐 데이터는 이미 존재합니다. 추가 로딩 생략.");
            return;
        }

        BufferedReader br = new BufferedReader(new InputStreamReader(
                getClass().getResourceAsStream("/gwangju_water_storage_utf8.csv"), StandardCharsets.UTF_8));

        String line;
        try {
            br.readLine();
            List<WaterStorageEntity> waterStorages = new ArrayList<>();

            while((line = br.readLine()) != null) {
                String[] fields = line.split(",", -1);

                WaterStorageEntity waterStorage = WaterStorageEntity.builder()
                        .waterUsage(fields[0].trim())
                        .name(fields[1].trim())
                        .width(Double.parseDouble(fields[2].trim()))
                        .length(Double.parseDouble(fields[3].trim()))
                        .capacity(Double.parseDouble(fields[4].trim()))
                        .address(fields[5].trim())
                        .latitude(Double.parseDouble(fields[6].trim()))
                        .longitude(Double.parseDouble(fields[7].trim()))
                        .build();

                waterStorages.add(waterStorage);
            }

            waterStorageRepository.saveAll(waterStorages);
            System.out.println("광주 저수지/댐 데이터가 DB에 성공적으로 저장되었습니다. 총 개수:" + waterStorages.size());

        } catch (IOException e) {
            System.err.println("광주 저수지/댐 데이터 로드 실패: ");
            e.printStackTrace();
            throw new RuntimeException(e);
        }

    }
}
