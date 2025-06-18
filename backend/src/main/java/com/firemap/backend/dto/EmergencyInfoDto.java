package com.firemap.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EmergencyInfoDto {

    private Long id;
    private String name;
    private String address;
    private int hasEmergencyRoom;
    private String isEmergencyRoomOperating;
    private String burnCare;
    private String endoscope;
    private String phone;
    private String code;
    private double latitude;
    private double longitude;

}
