package com.firemap.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import lombok.*;

@Entity
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
public class WaterStorageEntity {

    @Id
    private Long id;

    @Column(nullable = false, length = 30, name = "water_usage")
    private String waterUsage;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false)
    private double width;

    @Column(nullable = false)
    private double length;

    @Column(nullable = false)
    private double capacity;

    @Column(nullable = false)
    private String address;
}
