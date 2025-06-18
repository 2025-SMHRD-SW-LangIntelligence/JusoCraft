package com.firemap.backend.service;

import com.firemap.backend.dto.EmergencyInfoDto;
import com.firemap.backend.entity.EmergencyInfoEntity;
import com.firemap.backend.repository.EmergencyInfoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class EmergencyInfoService {

    private final EmergencyInfoRepository emergencyInfoRepository;

    public EmergencyInfoService(EmergencyInfoRepository emergencyInfoRepository) {
        this.emergencyInfoRepository = emergencyInfoRepository;
    }

    @Transactional
    public EmergencyInfoDto savedEmergencyInfo(EmergencyInfoDto dto) {
        EmergencyInfoEntity entity = EmergencyInfoEntity.builder()
                .name(dto.getName())
                .address(dto.getAddress())
                .hasEmergencyRoom(dto.getHasEmergencyRoom())
                .isEmergencyRoomOperating(dto.getIsEmergencyRoomOperating())
                .burnCare(dto.getBurnCare())
                .endoscope(dto.getEndoscope())
                .phone(dto.getPhone())
                .code(dto.getCode())
                .latitude(dto.getLatitude())
                .longitude(dto.getLongitude())
                .build();

        EmergencyInfoEntity saved = emergencyInfoRepository.save(entity);
        dto.setId(saved.getId());
        return dto;
    }

    public List<EmergencyInfoDto> getAllEmergencyInfo() {
        return emergencyInfoRepository.findAll().stream()
                .map(entity -> new EmergencyInfoDto(
                        entity.getId(),
                        entity.getName(),
                        entity.getAddress(),
                        entity.getHasEmergencyRoom(),
                        entity.getIsEmergencyRoomOperating(),
                        entity.getBurnCare(),
                        entity.getEndoscope(),
                        entity.getPhone(),
                        entity.getCode(),
                        entity.getLatitude(),
                        entity.getLongitude()
                )).collect(Collectors.toList());
    }
}
