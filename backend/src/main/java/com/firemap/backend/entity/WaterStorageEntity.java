package com.firemap.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
@Table(name = "water_storages")
public class WaterStorageEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
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
