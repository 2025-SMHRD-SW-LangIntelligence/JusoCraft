package com.firemap.backend.service;

import com.firemap.backend.dto.FireDispatchDto;
import com.firemap.backend.entity.FireDispatchEntity;
import com.firemap.backend.entity.FireReportEntity;
import com.firemap.backend.entity.FireStationEntity;
import com.firemap.backend.enums.FireReportStatus;
import com.firemap.backend.repository.FireDispatchRepository;
import com.firemap.backend.repository.FireReportRepository;
import com.firemap.backend.repository.FireStationRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FireDispatchService {

    private final FireDispatchRepository fireDispatchRepository;
    private final FireReportRepository fireReportRepository;
    private final FireStationRepository fireStationRepository;

    /**
     * 출동 정보 생성
     */
    public FireDispatchDto createDispatch(FireDispatchDto dto) {
        FireReportEntity fireReport = fireReportRepository.findByReportToken_Token(dto.getReportToken())
            .orElseThrow(() -> new IllegalArgumentException("신고 정보가 존재하지 않습니다."));

        FireStationEntity fireStation = fireStationRepository.findById(dto.getFireStationId())
            .orElseThrow(() -> new IllegalArgumentException("소방서 정보가 존재하지 않습니다."));

        FireDispatchEntity entity = FireDispatchEntity.builder()
            .fireReport(fireReport)
            .fireStation(fireStation)
            // .status(dto.getStatus())
            .status(FireReportStatus.RECEIVED)
            .dispatchedAt(LocalDateTime.now())
            .build();

        fireDispatchRepository.save(entity);

        return FireDispatchDto.builder()
            .id(entity.getId())
            .reportToken(dto.getReportToken())
            .fireStationId(dto.getFireStationId())
            .status(entity.getStatus())
            .build();
    }

    /**
     * 신고 토큰 기준 출동 리스트 조회
     */
    public List<FireDispatchDto> getDispatchesByReportToken(String reportToken) {
        List<FireDispatchEntity> dispatches = fireDispatchRepository.findByFireReport_ReportToken_Token(reportToken);

        return dispatches.stream().map(entity -> FireDispatchDto.builder()
            .id(entity.getId())
            .reportToken(reportToken)
            .fireStationId(entity.getFireStation().getId())
            .status(entity.getStatus())
            .build()).collect(Collectors.toList());
    }

    /**
     * 출동 상태 변경 + 신고 상태 동기화
     */
    @Transactional
    public FireDispatchDto updateStatus(Long dispatchId, FireReportStatus status) {
        FireDispatchEntity entity = fireDispatchRepository.findById(dispatchId)
            .orElseThrow(() -> new IllegalArgumentException("출동 정보를 찾을 수 없습니다."));

        // 1. 출동 상태 변경
        entity.setStatus(status);

        // 2. 신고 상태도 함께 변경
        FireReportEntity report = entity.getFireReport();
        report.setStatus(status);

        // 완료 상태 시간 기록
        if (status == FireReportStatus.FULLY_SUPPRESSED ||
                status == FireReportStatus.WITHDRAWN ||
        status == FireReportStatus.MONITORING) {
            entity.setCompletedAt(LocalDateTime.now());
        }

        // 3. 저장은 트랜잭션으로 자동 처리됨
        return FireDispatchDto.builder()
                .id(entity.getId())
                .reportToken(entity.getFireReport().getReportToken().getToken())
                .fireStationId(entity.getFireStation().getId())
                .status(entity.getStatus())
                .completedAt(entity.getCompletedAt())
                .build();
    }

    public List<FireDispatchDto> getActiveDispatches() {
        List<FireReportStatus> active = List.of(
                FireReportStatus.RECEIVED,
                FireReportStatus.DISPATCHED,
                FireReportStatus.ARRIVED,
                FireReportStatus.INITIAL_SUPPRESSION,
                FireReportStatus.OVERHAUL
        );
        return fireDispatchRepository.findByStatusIn(active)
                .stream()
                .map(e -> FireDispatchDto.builder()
                        .id(e.getId())
                        .reportToken(e.getFireReport()
                                .getReportToken()
                                .getToken())
                        .fireStationId(e.getFireStation().getId())
                        .fireStationName(e.getFireStation().getCenterName())
                        .fireStationAddress(e.getFireStation().getAddress())
                        .fireAddress(e.getFireReport().getFireAddress())
                        .dispatchedAt(e.getDispatchedAt())
                        .completedAt(e.getCompletedAt())
                        .status(e.getStatus())
                        .build())
                .toList();
    }

}
