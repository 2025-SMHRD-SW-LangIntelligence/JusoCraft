package com.firemap.backend.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.firemap.backend.enums.FireReportStatus;

import lombok.*;

import java.time.LocalDateTime;

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
    private String fireStationName;
    private String fireStationAddress;
    private String fireAddress;
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime dispatchedAt;
    private FireReportStatus status;
}