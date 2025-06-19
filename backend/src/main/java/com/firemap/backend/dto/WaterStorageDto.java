package com.firemap.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class WaterStorageDto {
    private Long id;
    private String waterUsage;
    private String name;
    private double width;
    private double length;
    private double capacity;
    private String address;
    private double latitude;
    private double longitude;
}
