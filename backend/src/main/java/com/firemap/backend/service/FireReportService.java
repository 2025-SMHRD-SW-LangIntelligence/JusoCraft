package com.firemap.backend.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;
import com.firemap.backend.entity.*;
import com.firemap.backend.enums.FireReportStatus;
import com.firemap.backend.enums.ReportInputStatus;
import com.firemap.backend.repository.*;

import jakarta.transaction.Transactional;
import com.firemap.backend.dto.*;

@Service
@Transactional
public class FireReportService {

    private final FireReportRepository reportRepository;
    private final FireReportTokenRepository tokenRepository;

    public FireReportService(FireReportRepository reportRepository, FireReportTokenRepository tokenRepository) {
        this.reportRepository = reportRepository;
        this.tokenRepository = tokenRepository;
    }

    // 신고 접수 및 수정
    public FireReportDto saveReport(FireReportRequest request) {
        FireReportTokenEntity token = tokenRepository.findByToken(request.getReportedId())
            .orElseThrow(() -> new IllegalArgumentException("유효하지 않은 토큰입니다."));

        FireReportEntity report = reportRepository.findByReportToken(token).orElse(null);

        if (report == null) {
            report = FireReportEntity.builder()
                .reportToken(token)
                .reporterLat(request.getReporterLat())
                .reporterLng(request.getReporterLng())
                .fireLat(request.getFireLat())
                .fireLng(request.getFireLng())
                .reporterAddress(request.getReporterAddress())
                .fireAddress(request.getFireAddress())
                .reportedAt(request.getReportedAt())
                .reporterPhone(request.getReporterPhone())
                .reportContent(request.getReportContent())
                .inputStatus(ReportInputStatus.REPORTED)
                .status(FireReportStatus.RECEIVED)
                .build();
        } else {
            report.setReporterLat(request.getReporterLat());
            report.setReporterLng(request.getReporterLng());
            report.setFireLat(request.getFireLat());
            report.setFireLng(request.getFireLng());
            report.setReporterAddress(request.getReporterAddress());
            report.setFireAddress(request.getFireAddress());
            report.setReportedAt(request.getReportedAt());
            report.setInputStatus(ReportInputStatus.REPORTED);
        }

        FireReportEntity saved = reportRepository.save(report);
        return FireReportDto.from(saved);  // 변경됨
    }

    // 모든 신고 조회
    public List<FireReportDto> getAllFireReports() {
        return reportRepository.findAll().stream()
            .map(FireReportDto::from)  // 변경됨
            .toList();
    }

    // 토큰으로 신고 조회
    public FireReportDto getReportByToken(String tokenStr) {
        FireReportEntity report = reportRepository.findByReportToken_Token(tokenStr)
            .orElseThrow(() -> new IllegalArgumentException("토큰에 해당하는 신고를 찾을 수 없습니다."));
        return FireReportDto.from(report);  // 변경됨
    }

    // 신고자가 위치 입력 시 호출
    public void updateLocation(String token, FireReportRequest request) {
        FireReportTokenEntity tokenEntity = tokenRepository.findByToken(token)
            .orElseThrow(() -> new IllegalArgumentException("Invalid token"));

        FireReportEntity report = reportRepository.findByReportToken(tokenEntity)
            .orElseThrow(() -> new IllegalStateException("Report not found"));

        report.setReporterLat(request.getReporterLat());
        report.setReporterLng(request.getReporterLng());
        report.setFireLat(request.getFireLat());
        report.setFireLng(request.getFireLng());
        report.setFireAddress(request.getFireAddress());
        report.setReporterAddress(request.getReporterAddress());
        report.setReportedAt(LocalDateTime.now());
        report.setInputStatus(ReportInputStatus.REPORTED);

        reportRepository.save(report);
    }

    // REPORTED 상태인 신고만 조회
    public List<FireReportEntity> getReportedReports() {
        return reportRepository.findByInputStatus(ReportInputStatus.REPORTED);
    }
}