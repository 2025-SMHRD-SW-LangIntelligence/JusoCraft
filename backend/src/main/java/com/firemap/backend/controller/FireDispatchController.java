package com.firemap.backend.controller;

import com.firemap.backend.dto.FireDispatchDto;
import com.firemap.backend.enums.FireReportStatus;
import com.firemap.backend.service.FireDispatchService;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/fire-dispatches")
@RequiredArgsConstructor
public class FireDispatchController {

    private final FireDispatchService fireDispatchService;

    /**
     * 출동지시 생성
     */
    @PostMapping
    public ResponseEntity<FireDispatchDto> createDispatch(@RequestBody FireDispatchDto dto) {
        try {
            FireDispatchDto created = fireDispatchService.createDispatch(dto);
            return ResponseEntity.ok(created);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    /**
     * 특정 화재신고(reportToken)에 대한 출동지시 목록 조회
     */
    @GetMapping("/report/{reportToken}")
    public ResponseEntity<List<FireDispatchDto>> getDispatchesByReport(@PathVariable String reportToken) {
        try {
            List<FireDispatchDto> list = fireDispatchService.getDispatchesByReportToken(reportToken);
            return ResponseEntity.ok(list);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(List.of());
        }
    }

    /**
     * 출동 상태 업데이트 + 신고 상태도 함께 변경
     */
    @PutMapping("/{dispatchId}/status")
    public ResponseEntity<FireDispatchDto> updateStatus(@PathVariable Long dispatchId,
                                                        @RequestParam String status) {
        try {
            FireReportStatus enumStatus = FireReportStatus.valueOf(status.toUpperCase());
            FireDispatchDto updated = fireDispatchService.updateStatus(dispatchId, enumStatus);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
