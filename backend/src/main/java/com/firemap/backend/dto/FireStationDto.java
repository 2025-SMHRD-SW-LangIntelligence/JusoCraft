package com.firemap.backend.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FireStationDto {
    private Long id;
    private String centerName;
    private String address;
    private String phoneNumber;
    private double latitude;
    private double longitude;
}