package com.firemap.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.firemap.backend.dto.FireReportRequest;
import com.firemap.backend.entity.FireReportEntity;
import com.firemap.backend.dto.FireReportDto;
import com.firemap.backend.service.FireReportService;

import lombok.RequiredArgsConstructor;

import java.util.List;
import java.util.stream.Collectors;

// @CrossOrigin(origins = "*")
// @RestController
// @RequestMapping("/api/fire-reports")
// public class FireReportController {

//     private final FireReportService fireReportService;

//     public FireReportController(FireReportService svc) {
//         this.fireReportService = svc;
//     }

//     // 신고 접수
//     @PostMapping
//     public FireReportDto createReport(@RequestBody FireReportRequest request) {
//         System.out.println("Request status: " + request.getStatus());
//         System.out.println("Request reportedId: " + request.getReportedId());
//         System.out.println("Request reportedAt: " + request.getReportedAt());
//         return fireReportService.saveReport(request);
//     }

//     // 모든 신고 조회
//     @GetMapping
//     public List<FireReportDto> getFireReports() {
//         return fireReportService.getAllFireReports();
//     }

//     // 출동지시
//     @PatchMapping("/{id}/dispatch")
//     public ResponseEntity<String> dispatchFireReport(@PathVariable Long id) {
//         FireReportEntity report = fireReportService.dispatchReport(id);
//         String token = report.getReportToken().getToken();
//         return ResponseEntity.ok(token);
//     }

//     // 토큰으로 신고 조회
//     @GetMapping("/by-token/{token}")
//     public FireReportDto getReportByToken(@PathVariable String token) {
//         return fireReportService.getReportByToken(token);
//     }
// }



@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/fire-reports")
public class FireReportController {

    private final FireReportService fireReportService;

    public FireReportController(FireReportService fireReportService) {
        this.fireReportService = fireReportService;
    }

    // 신고 접수 (신고 생성 및 수정)
    @PostMapping
    public FireReportDto createReport(@RequestBody FireReportRequest request) {
        return fireReportService.saveReport(request);
    }

    // 모든 신고 조회
    @GetMapping
    public List<FireReportDto> getFireReports() {
        return fireReportService.getAllFireReports();
    }

    // 토큰으로 신고 조회
    @GetMapping("/by-token/{token}")
    public FireReportDto getReportByToken(@PathVariable String token) {
        return fireReportService.getReportByToken(token);
    }

    public List<FireReportDto> getReportedOnly() {
    return fireReportService.getReportedReports()
        .stream()
        .map(FireReportDto::from)
        .collect(Collectors.toList());
}
}