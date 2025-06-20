package com.firemap.backend.dto;

import com.firemap.backend.enums.FireReportStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CompletedReportDto {
    private Long id;
    private String fireAddress;
    private LocalDateTime reportedAt;
    private FireReportStatus status;
    private LocalDateTime completedAt;


    private String stationName;
}
