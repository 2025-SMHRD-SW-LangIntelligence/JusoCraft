package com.firemap.backend.dto;

import com.firemap.backend.enums.FireReportStatus;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FireStationDto {
    private Long id;
    private String sidoHeadquarter;;
    private String centerName;
    private String address;
    private String phoneNumber;
    private double latitude;
    private double longitude;

    private FireReportStatus status; // 현재 출동 중인 상황 상태
    private boolean dispatchAvailable; // 출동 지시 가능 여부
}