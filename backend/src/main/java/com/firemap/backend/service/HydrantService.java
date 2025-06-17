package com.firemap.backend.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.firemap.backend.dto.HydrantDto;
import com.firemap.backend.entity.HydrantEntity;
import com.firemap.backend.repository.HydrantRepository;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class HydrantService {

    private final HydrantRepository hydrantRepository;

    public HydrantService(HydrantRepository hydrantRepository) {
        this.hydrantRepository = hydrantRepository;
    }

    @Transactional
    public HydrantDto saveHydrant(HydrantDto dto) {
        HydrantEntity entity = HydrantEntity.builder()
                .facilityNumber(dto.getFacilityNumber())
                .sidoName(dto.getSidoName())
                .sigunguName(dto.getSigunguName())
                .lat(dto.getLat())
                .lng(dto.getLng())
                .address(dto.getAddress())
                .pressure(dto.getPressure())
                .build();

        HydrantEntity saved = hydrantRepository.save(entity);
        dto.setId(saved.getId());  // 저장 후 생성된 ID를 DTO에 세팅
        return dto;
    }

    // DB에서 모든 소화전 데이터를 조회해 DTO 리스트로 반환
    public List<HydrantDto> getAllHydrants() {
        return hydrantRepository.findAll().stream()
                .map(entity -> new HydrantDto(
                        entity.getId(),
                        entity.getFacilityNumber(),
                        entity.getSidoName(),
                        entity.getSigunguName(),
                        entity.getLat(),
                        entity.getLng(),
                        entity.getAddress(),
                        entity.getPressure()
                ))
                .collect(Collectors.toList());
    }
}