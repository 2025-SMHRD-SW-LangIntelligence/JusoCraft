package com.firemap.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Builder
@Table(name = "emergency_infos")
public class EmergencyInfoEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false)
    private String address;

    @Column(nullable = false, name = "has_emergency_room")
    private int hasEmergencyRoom; // 가능 1, 불가능 0

    @Column(nullable = false, name = "is_emergency_room_operating", length = 1)
    private String isEmergencyRoomOperating;

    @Column(nullable = false, name = "burn_care", length = 1)
    private String burnCare;

    @Column(nullable = false, length = 1)
    private String endoscope;

    @Column(nullable = false, length = 20)
    private String phone;

    @Column(nullable = false, length = 20)
    private String code;

    @Column(nullable = false)
    private double latitude;

    @Column(nullable = false)
    private double longitude;
}
