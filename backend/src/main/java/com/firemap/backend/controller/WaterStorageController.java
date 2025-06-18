package com.firemap.backend.controller;

import com.firemap.backend.dto.WaterStorageDto;
import com.firemap.backend.service.WaterStorageService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/water-storage")
public class WaterStorageController {

    private final WaterStorageService waterStorageService;

    public WaterStorageController(WaterStorageService waterStorageService) {
        this.waterStorageService = waterStorageService;
    }

    // 저수지/댐 데이터 저장
    @PostMapping
    public WaterStorageDto createWaterStorage(@RequestBody WaterStorageDto dto) {
        return waterStorageService.saveWaterStorage(dto);
    }

    // 모든 저수지/댐 조회 API
    @GetMapping
    public List<WaterStorageDto> getWaterStorage() {
        return waterStorageService.getAllWaterStorage();
    }
}
