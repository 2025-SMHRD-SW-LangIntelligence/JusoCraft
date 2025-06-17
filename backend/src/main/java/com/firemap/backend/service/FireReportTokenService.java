package com.firemap.backend.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.firemap.backend.entity.FireReportEntity;
import com.firemap.backend.entity.FireReportTokenEntity;
import com.firemap.backend.enums.ReportInputStatus;
import com.firemap.backend.repository.FireReportRepository;
import com.firemap.backend.repository.FireReportTokenRepository;

import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class FireReportTokenService {

    private final FireReportTokenRepository fireReportTokenRepository;
    private final FireReportRepository fireReportRepository;

    public FireReportTokenService(FireReportTokenRepository fireReportTokenRepository,
                                  FireReportRepository fireReportRepository) {
        this.fireReportTokenRepository = fireReportTokenRepository;
        this.fireReportRepository = fireReportRepository;
    }

    // 관제센터에서 URL 생성 시 호출
    public String createReportWithToken(String phone, String content) {
        System.out.println(phone); // 저장할 전화번호
        System.out.println(content); // 저장할 메모

        FireReportTokenEntity token = FireReportTokenEntity.builder()
            .token(UUID.randomUUID().toString())
            .build();
        fireReportTokenRepository.save(token);

        FireReportEntity report = FireReportEntity.builder()
            .reportToken(token)
            .reporterPhone(phone)
            .reportContent(content)
            .inputStatus(ReportInputStatus.PENDING)
            .build();
        fireReportRepository.save(report);

        return token.getToken();
    }

    public boolean isValidToken(String token) {
        try {
            boolean result = fireReportTokenRepository.findByToken(token).isPresent();
            System.out.println("✅ 토큰 유효성 검사 결과: " + result);
            return result;
        } catch (Exception e) {
            System.out.println("❌ 토큰 검증 중 예외 발생: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    public FireReportTokenEntity createToken() {
        String token = UUID.randomUUID().toString();
        FireReportTokenEntity fireReportToken = FireReportTokenEntity.builder()
            .token(token)
            .build();
        return fireReportTokenRepository.save(fireReportToken);
    }

    public List<FireReportTokenEntity> getAllTokens() {
        return fireReportTokenRepository.findAll();
    }
}