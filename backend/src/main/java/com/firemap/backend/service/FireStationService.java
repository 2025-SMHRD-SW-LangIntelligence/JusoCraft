package com.firemap.backend.service;

import com.firemap.backend.dto.FireStationDto;
import com.firemap.backend.entity.FireDispatchEntity;
import com.firemap.backend.entity.FireStationEntity;
import com.firemap.backend.enums.FireReportStatus;
import com.firemap.backend.repository.FireStationRepository;
import lombok.RequiredArgsConstructor;

import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class FireStationService {

    private final FireStationRepository fireStationRepository;

    public List<FireStationEntity> getAllStations() {
        return fireStationRepository.findAll();
    }

    public FireStationEntity getStationById(Long id) {
        return fireStationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("해당 ID의 소방서를 찾을 수 없습니다."));
    }

    public List<FireStationDto> getAllStationsWithStatus() {
        return fireStationRepository.findAll().stream()
                .map(this::toDtoWithStatus)
                .collect(Collectors.toList());
    }

    private FireStationDto toDtoWithStatus(FireStationEntity entity) {
        return FireStationDto.builder()
                .id(entity.getId())
                .centerName(entity.getCenterName())
                .address(entity.getAddress())
                .phoneNumber(entity.getPhone())
                .latitude(entity.getLatitude())
                .longitude(entity.getLongitude())
                .status(resolveLatestReportStatus(entity.getDispatches()))
                .dispatchAvailable(isDispatchAvailable(entity.getDispatches()))
                .build();
    }

    private FireReportStatus resolveLatestReportStatus(List<FireDispatchEntity> dispatches) {
        Optional<FireDispatchEntity> latestDispatchOpt = dispatches.stream()
                .filter(d -> d.getFireReport() != null && d.getFireReport().getStatus() != null)
                .max(Comparator.comparing(FireDispatchEntity::getDispatchedAt));

        if (latestDispatchOpt.isPresent()) {
            FireDispatchEntity latest = latestDispatchOpt.get();
            FireReportStatus status = latest.getFireReport().getStatus();
            return status;
        }

        return null;
    }

    private boolean isDispatchAvailable(List<FireDispatchEntity> dispatches) {
        Optional<FireDispatchEntity> latestDispatchOpt = dispatches.stream()
                .filter(d -> d.getFireReport() != null)
                .max(Comparator.comparing(FireDispatchEntity::getDispatchedAt));

        if (latestDispatchOpt.isPresent()) {
            FireReportStatus status = latestDispatchOpt.get().getFireReport().getStatus();
            return status == null;
        }

        return true;
    }
}
