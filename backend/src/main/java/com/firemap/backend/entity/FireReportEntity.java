package com.firemap.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

import com.firemap.backend.enums.FireReportStatus;
import com.firemap.backend.enums.ReportInputStatus;

import java.util.ArrayList; 
// @Entity
// @Table(name = "fire_reports")
// @Getter
// @Setter
// @NoArgsConstructor
// @AllArgsConstructor
// @Builder
// public class FireReportEntity {

//     @Id
//     @GeneratedValue(strategy = GenerationType.IDENTITY)
//     private Long id;

//     @OneToOne(fetch = FetchType.LAZY)
//     @JoinColumn(name = "report_token_id", nullable = false)
//     private FireReportTokenEntity reportToken;

//     @Column(nullable = false)
//     private double reporterLat;

//     @Column(nullable = false)
//     private double reporterLng;

//     @Column(nullable = false)
//     private double fireLat;

//     @Column(nullable = false)
//     private double fireLng;

//     @Column(name = "reporter_address", columnDefinition = "TEXT", nullable = false)
//     private String reporterAddress; // 신고자 현재 위치 주소

//     @Column(name = "fire_address", columnDefinition = "TEXT", nullable = false)
//     private String fireAddress; // 화재 발생 위치 주소

//     @Enumerated(EnumType.STRING)
//     @Column(nullable = false)
//     private FireReportStatus status;  // 내부 enum 대신 외부 enum 사용

//     @Column(name = "reported_at", nullable = false)
//     private LocalDateTime reportedAt;

//     @Column(name = "dispatched_at")
//     private LocalDateTime dispatchedAt;

//     @Column(name = "resolved_at")
//     private LocalDateTime resolvedAt;
// }


@Entity
@Table(name = "fire_reports")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FireReportEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "report_token_id", nullable = false)
    private FireReportTokenEntity reportToken;

    @Column(nullable = true)
    private Double reporterLat;

    @Column(nullable = true)
    private Double reporterLng;

    @Column(nullable = true)
    private Double fireLat;

    @Column(nullable = true)
    private Double fireLng;

    @Column(name = "reporter_phone", length = 20)
    private String reporterPhone;

    @Column(name = "report_content", columnDefinition = "TEXT")
    private String reportContent;

    @Column(name = "reporter_address", columnDefinition = "TEXT", nullable = true)
    private String reporterAddress;

    @Column(name = "fire_address", columnDefinition = "TEXT", nullable = true)
    private String fireAddress;

    @Column(name = "reported_at", nullable = true)
    private LocalDateTime reportedAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "input_status", nullable = false)
    private ReportInputStatus inputStatus = ReportInputStatus.PENDING;

    // 하나의 신고에 여러개 출동
    @OneToMany(mappedBy = "fireReport", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<FireDispatchEntity> dispatches = new ArrayList<>();
}
