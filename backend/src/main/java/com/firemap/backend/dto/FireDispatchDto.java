package com.firemap.backend.dto;

import com.firemap.backend.enums.FireReportStatus;

import lombok.*;

// @Getter
// @Setter
// @NoArgsConstructor
// @AllArgsConstructor
// @Builder
// public class FireDispatchDto {
//     private Long id;
//     private String reportToken;     // Long fireReportId -> String reportToken 으로 변경
//     private Long fireStationId;
//     private String status;
// }

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FireDispatchDto {
    private Long id;
    private String reportToken; // FireReportToken의 token 문자열
    private Long fireStationId;
    private FireReportStatus status;
}