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

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

// @Service
// @RequiredArgsConstructor
// public class FireDispatchService {

//     private final FireDispatchRepository fireDispatchRepository;

//     public FireDispatchDto createDispatch(FireDispatchDto dto) {
//         FireDispatchEntity entity = FireDispatchEntity.builder()
//                 .reportToken(dto.getReportToken())
//                 .fireStationId(dto.getFireStationId())
//                 .status(dto.getStatus())
//                 .build();

//         entity = fireDispatchRepository.save(entity);
//         dto.setId(entity.getId());
//         return dto;
//     }

//     public List<FireDispatchDto> getDispatchesByReportToken(String reportToken) {
//         List<FireDispatchEntity> list = fireDispatchRepository.findByReportToken(reportToken);
//         return list.stream().map(entity -> FireDispatchDto.builder()
//                 .id(entity.getId())
//                 .reportToken(entity.getReportToken())
//                 .fireStationId(entity.getFireStationId())
//                 .status(entity.getStatus())
//                 .build()).collect(Collectors.toList());
//     }

//     public FireDispatchDto updateStatus(Long dispatchId, String status) {
//         FireDispatchEntity entity = fireDispatchRepository.findById(dispatchId)
//                 .orElseThrow(() -> new IllegalArgumentException("Dispatch not found"));
//         entity.setStatus(status);
//         fireDispatchRepository.save(entity);
//         return FireDispatchDto.builder()
//                 .id(entity.getId())
//                 .reportToken(entity.getReportToken())
//                 .fireStationId(entity.getFireStationId())
//                 .status(entity.getStatus())
//                 .build();
//     }
// }


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
            .status(dto.getStatus())
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
     * 출동 상태 변경
     */
    public FireDispatchDto updateStatus(Long dispatchId, FireReportStatus status) {
        FireDispatchEntity entity = fireDispatchRepository.findById(dispatchId)
            .orElseThrow(() -> new IllegalArgumentException("출동 정보를 찾을 수 없습니다."));

        entity.setStatus(status);
        fireDispatchRepository.save(entity);

        return FireDispatchDto.builder()
            .id(entity.getId())
            .reportToken(entity.getFireReport().getReportToken().getToken())
            .fireStationId(entity.getFireStation().getId())
            .status(entity.getStatus())
            .build();
    }

}