package com.firemap.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "hydrants")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HydrantEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;  // 자동 생성되는 기본키

    @Column(name = "facility_number") // 시설번호
    private String facilityNumber;

    @Column(name = "sido_name") // 시도명
    private String sidoName;

    @Column(name = "sigungu_name") // 시군구명
    private String sigunguName;

    @Column(name = "lat") // 위도
    private Double lat;

    @Column(name = "lng") // 경도
    private Double lng;

    @Column(name = "address") // 주소 (도로명 또는 지번주소)
    private String address;

    @Column(name = "detailLocation") // 상세주소
    private String detailLocation;

    @Column(name = "pressure") // 출수압력
    private Double pressure;
}