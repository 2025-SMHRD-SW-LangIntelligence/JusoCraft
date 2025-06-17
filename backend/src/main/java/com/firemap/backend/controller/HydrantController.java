package com.firemap.backend.controller;

import org.springframework.web.bind.annotation.*;
import com.firemap.backend.dto.HydrantDto;
import com.firemap.backend.service.HydrantService;

import java.util.List;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/hydrants")
public class HydrantController {

    private final HydrantService hydrantService;

    // 생성자로 서비스 주입
    public HydrantController(HydrantService hydrantService) {
        this.hydrantService = hydrantService;
    }

    /**
     * 소화전 데이터 저장 API
     * POST /hydrants
     * @param dto 요청 바디로 전달된 소화전 정보
     * @return 저장된 소화전 정보 (id 포함)
     */
    @PostMapping
    public HydrantDto createHydrant(@RequestBody HydrantDto dto) {
        return hydrantService.saveHydrant(dto);
    }

    /**
     * 모든 소화전 조회 API
     * GET /hydrants
     * @return 소화전 DTO 리스트
     */
    @GetMapping
    public List<HydrantDto> getHydrants() {
        return hydrantService.getAllHydrants();
    }
}
