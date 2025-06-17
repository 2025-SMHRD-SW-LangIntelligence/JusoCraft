package com.firemap.backend.controller;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.firemap.backend.dto.ContactAndMemoDto;
import com.firemap.backend.entity.FireReportTokenEntity;
import com.firemap.backend.service.FireReportTokenService;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/fire-report-tokens")
public class FireReportTokenController {

    private final FireReportTokenService tokenService;

    public FireReportTokenController(FireReportTokenService tokenService) {
        this.tokenService = tokenService;
    }

    // [1] 연락처 + 신고내용 받아서 토큰 + 신고 생성
    @PostMapping("/report")
    public ResponseEntity<String> createReportWithToken(@RequestBody ContactAndMemoDto request) {
        System.out.println(request.getPhone());
        System.out.println(request.getContent());

        String token = tokenService.createReportWithToken(request.getPhone(), request.getContent());
        return ResponseEntity.ok(token);
    }

    // [2] 기본 토큰 생성 (단순 토큰만 만들 때)
    @PostMapping("/create")
    public ResponseEntity<String> createToken() {
        FireReportTokenEntity token = tokenService.createToken();
        return ResponseEntity.ok(token.getToken());
    }

    // [3] 토큰 유효성 확인
    @GetMapping("/validate/{token}")
    public ResponseEntity<Boolean> validateToken(@PathVariable String token) {
        boolean valid = tokenService.isValidToken(token);
        return ResponseEntity.ok(valid);
    }

    // [4] 전체 토큰 목록 확인
    @GetMapping("/all")
    public ResponseEntity<List<String>> getAllTokens() {
        List<FireReportTokenEntity> tokens = tokenService.getAllTokens();
        List<String> tokenStrings = tokens.stream()
            .map(FireReportTokenEntity::getToken)
            .collect(Collectors.toList());

        return ResponseEntity.ok(tokenStrings);
    }
}
