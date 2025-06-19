package com.firemap.backend.controller;

import com.firemap.backend.dto.FireStationDto;
import com.firemap.backend.entity.FireStationEntity;
import com.firemap.backend.service.FireStationService;
import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/fire-stations")
@RequiredArgsConstructor
public class FireStationController {

    private final FireStationService fireStationService;

    // 기본 소방서 목록 (상태 없음)
    @GetMapping
    public List<FireStationDto> getAllStations() {
        List<FireStationEntity> entities = fireStationService.getAllStations();
        return entities.stream()
            .map(entity -> FireStationDto.builder()
                        .id(entity.getId())
                        .centerName(entity.getCenterName())
                        .address(entity.getAddress())
                        .phoneNumber(entity.getPhone())
                        .latitude(entity.getLatitude())
                        .longitude(entity.getLongitude())
                        .status(null)                 // 상태 정보 없음
                        .dispatchAvailable(true)      // 기본값 true
                        .build())
                .collect(Collectors.toList());
    }

    // ID로 단일 소방서 조회 (상태 없음)
    @GetMapping("/{id}")
    public ResponseEntity<FireStationDto> getStationById(@PathVariable Long id) {
        FireStationEntity entity = fireStationService.getStationById(id);
        if (entity == null) {
            return ResponseEntity.notFound().build();
        }
        FireStationDto dto = FireStationDto.builder()
                .id(entity.getId())
                .centerName(entity.getCenterName())
                .address(entity.getAddress())
                .phoneNumber(entity.getPhone())
                .latitude(entity.getLatitude())
                .longitude(entity.getLongitude())
                .status(null)
                .dispatchAvailable(true)
                .build();
        return ResponseEntity.ok(dto);
    }

    // 출동 상태, 진행 상황 포함 소방서 목록
    @GetMapping("/with-status")
    public List<FireStationDto> getStationsWithStatus() {
        return fireStationService.getAllStationsWithStatus();
    }
}