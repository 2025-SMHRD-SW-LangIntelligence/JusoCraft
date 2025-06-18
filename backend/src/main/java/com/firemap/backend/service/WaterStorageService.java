package com.firemap.backend.service;

import com.firemap.backend.dto.WaterStorageDto;
import com.firemap.backend.entity.WaterStorageEntity;
import com.firemap.backend.repository.WaterStorageRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class WaterStorageService {

    private final WaterStorageRepository waterStorageRepository;

    public WaterStorageService(WaterStorageRepository waterStorageRepository) {
        this.waterStorageRepository = waterStorageRepository;
    }

    @Transactional
    public WaterStorageDto saveWaterStorage(WaterStorageDto dto) {
        WaterStorageEntity entity = WaterStorageEntity.builder()
                .waterUsage(dto.getWaterUsage())
                .name(dto.getName())
                .width(dto.getWidth())
                .length(dto.getLength())
                .capacity(dto.getCapacity())
                .address(dto.getAddress())
                .build();

        WaterStorageEntity saved = waterStorageRepository.save(entity);
        dto.setId(saved.getId());
        return dto;
    }

    public List<WaterStorageDto> getAllWaterStorage(){
        return waterStorageRepository.findAll().stream()
                .map(entity -> new WaterStorageDto(
                        entity.getId(),
                        entity.getWaterUsage(),
                        entity.getName(),
                        entity.getWidth(),
                        entity.getLength(),
                        entity.getCapacity(),
                        entity.getAddress()
                )).collect(Collectors.toList());
    }
}
