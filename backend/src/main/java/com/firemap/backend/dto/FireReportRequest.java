package com.firemap.backend.dto;

import lombok.Data;
import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonFormat;

// 프론트용
// @Data
// public class FireReportRequest {
//     private String reportedId; // 토큰 문자열
//     private double reporterLat;
//     private double reporterLng;
//     private double fireLat;
//     private double fireLng;
//     private String reporterAddress;
//     private String fireAddress;
//     private String status;  // "REPORTED" 형식으로 클라이언트에서 보내면 좋음

//     @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
//     private LocalDateTime reportedAt;
//     @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
//     private LocalDateTime dispatchedAt;
//     @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
//     private LocalDateTime resolvedAt;
// }


@Data
public class FireReportRequest {
    private String reportedId; // 토큰
    private double reporterLat;
    private double reporterLng;
    private double fireLat;
    private double fireLng;
    private String reporterAddress;
    private String fireAddress;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime reportedAt;

    private String reporterPhone;
    private String reportContent;
}