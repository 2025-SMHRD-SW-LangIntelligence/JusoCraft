package com.firemap.backend.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

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

    // 상태 카운트
    public Map<String, Long> getFireReportStats() {
        LocalDate today = LocalDate.now();
        LocalDateTime startOfDay = today.atStartOfDay();
        LocalDateTime endOfDay = today.plusDays(1).atStartOfDay();

        long todayReports = reportRepository.countByReportedAtBetween(startOfDay, endOfDay);
        long received = reportRepository.countByStatus(FireReportStatus.RECEIVED);
        long dispatched = reportRepository.countByStatus(FireReportStatus.DISPATCHED);
        long completed = reportRepository.countByStatus(FireReportStatus.FULLY_SUPPRESSED);

        Map<String, Long> result = new HashMap<>();
        result.put("todayReports", todayReports);
        result.put("received", received);
        result.put("dispatched", dispatched);
        result.put("completed", completed);

        return result;
    }

    public List<CompletedReportDto> getCompletedReports() {

        List<FireReportStatus> completedStatuses = List.of(
                FireReportStatus.FULLY_SUPPRESSED,
                FireReportStatus.WITHDRAWN,
                FireReportStatus.MONITORING
        );

        List<FireReportEntity> reports =
                reportRepository.findByStatusIn(completedStatuses);

        List<CompletedReportDto> result = new ArrayList<>();

        for (FireReportEntity report : reports) {

            /* 여러 소방서가 한 화재 현장을 방문할 경우를 가정하여 우선은 이렇게.. */
            String mainStation = "—";
            if (!report.getDispatches().isEmpty()) {
                FireStationEntity firstStation =
                        report.getDispatches().get(0).getFireStation();
                mainStation = firstStation.getCenterName();
            }

            /* 가장 이른 completedAt */
            LocalDateTime earliest = null;
            for (FireDispatchEntity d : report.getDispatches()) {
                LocalDateTime c = d.getCompletedAt();     // null 가능
                if (c == null) continue;

                if (earliest == null || c.isBefore(earliest)) {
                    earliest = c;
                }
            }

            CompletedReportDto dto = CompletedReportDto.builder()
                    .id(report.getId())
                    .fireAddress(report.getFireAddress())
                    .reportedAt(report.getReportedAt())
                    .completedAt(earliest)          // null 이면 아직 미기록
                    .status(report.getStatus())
                    .stationName(mainStation)
                    .build();

            result.add(dto);
        }

        return result;
    }


}