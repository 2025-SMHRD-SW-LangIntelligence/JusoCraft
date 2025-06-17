package com.firemap.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

import com.firemap.backend.entity.FireReportEntity;
import com.firemap.backend.entity.FireReportTokenEntity;
import com.firemap.backend.enums.FireReportStatus;
import com.firemap.backend.enums.ReportInputStatus;

// @Data
// @AllArgsConstructor
// public class FireReportDto {
//     private Long id;
//     // private Long reportedId;
//     private Long tokenId;
//     private String token;
//     private double reporterLat;
//     private double reporterLng;
//     private double fireLat;
//     private double fireLng;
//     private String reporterAddress;
//     private String fireAddress;
//     private FireReportStatus status;
//     private LocalDateTime reportedAt;
//     private LocalDateTime dispatchedAt;
//     private LocalDateTime resolvedAt;;
// }

// @Data
// @AllArgsConstructor
// public static FireReportDto from(FireReportEntity entity) {
//     FireReportTokenEntity token = entity.getReportToken();
//     return new FireReportDto(
//         private Long id;
//         private Long tokenId;
//         private String token;
//         private double reporterLat;
//         private double reporterLng;
//         private double fireLat;
//         private double fireLng;
//         private String reporterPhone;
//         private String reportContent;
//         private String reporterAddress;
//         private String fireAddress;
//         private LocalDateTime reportedAt;
//         private ReportInputStatus inputStatus;
//     );
// }

@Data
@AllArgsConstructor
@Builder
public class FireReportDto {
    private Long id;
    private Long tokenId;
    private String token;

    private Double reporterLat;
    private Double reporterLng;
    private Double fireLat;
    private Double fireLng;

    private String reporterAddress;
    private String fireAddress;

    private LocalDateTime reportedAt;

    private String reporterPhone;
    private String reportContent;

    private ReportInputStatus inputStatus;

    // Entity → DTO 변환용 팩토리 메서드
    public static FireReportDto from(FireReportEntity report) {
        return FireReportDto.builder()
            .id(report.getId())
            .tokenId(report.getReportToken().getId())
            .token(report.getReportToken().getToken())
            .reporterLat(report.getReporterLat())
            .reporterLng(report.getReporterLng())
            .fireLat(report.getFireLat())
            .fireLng(report.getFireLng())
            .reporterAddress(report.getReporterAddress())
            .fireAddress(report.getFireAddress())
            .reportedAt(report.getReportedAt())
            .reporterPhone(report.getReporterPhone())
            .reportContent(report.getReportContent())
            .inputStatus(report.getInputStatus())
            .build();
    }
}