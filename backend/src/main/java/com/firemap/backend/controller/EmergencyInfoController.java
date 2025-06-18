package com.firemap.backend.controller;

import com.firemap.backend.dto.EmergencyInfoDto;
import com.firemap.backend.service.EmergencyInfoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/emergency-info")
public class EmergencyInfoController {

    private final EmergencyInfoService emergencyInfoService;

    public EmergencyInfoController(EmergencyInfoService emergencyInfoService) {
        this.emergencyInfoService = emergencyInfoService;
    }

    // 응급실 데이터 저장
    @PostMapping
    public EmergencyInfoDto createEmergencyInfo(@RequestBody EmergencyInfoDto dto) {
        return emergencyInfoService.savedEmergencyInfo(dto);
    }

    // 모든 응급실 조회 API
    @GetMapping
    public List<EmergencyInfoDto> getEmergencyInfo() {
        return emergencyInfoService.getAllEmergencyInfo();
    }
}
