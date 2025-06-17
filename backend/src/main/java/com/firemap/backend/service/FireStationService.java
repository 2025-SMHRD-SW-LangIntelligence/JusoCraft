package com.firemap.backend.service;

import com.firemap.backend.entity.FireStationEntity;
import com.firemap.backend.repository.FireStationRepository;
import lombok.RequiredArgsConstructor;

import java.util.List;

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
}
