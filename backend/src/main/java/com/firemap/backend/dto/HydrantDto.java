package com.firemap.backend.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class HydrantDto {
    private Long id;
    private String facilityNumber;
    private String sidoName;
    private String sigunguName;
    private double lat;
    private double lng;
    private String address;
    private Double pressure;
}