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

    @GetMapping
    public List<FireStationDto> getAllStations() {
        List<FireStationEntity> entities = fireStationService.getAllStations();
        return entities.stream()
            .map(entity -> new FireStationDto(
                entity.getId(),
                entity.getCenterName(),
                entity.getAddress(),
                entity.getPhone(),
                entity.getLatitude(),
                entity.getLongitude()
            ))
            .collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<FireStationDto> getStationById(@PathVariable Long id) {
        FireStationEntity entity = fireStationService.getStationById(id);
        if (entity == null) {
            return ResponseEntity.notFound().build();
        }
        FireStationDto dto = new FireStationDto(
            entity.getId(),
            entity.getCenterName(),
            entity.getAddress(),
            entity.getPhone(),
            entity.getLatitude(),
            entity.getLongitude()
        );
        return ResponseEntity.ok(dto);
    }
}