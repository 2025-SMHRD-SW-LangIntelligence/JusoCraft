package com.firemap.backend.entity;

import java.time.LocalDateTime;

import com.firemap.backend.enums.FireReportStatus;

import jakarta.persistence.*;
import lombok.*;

/*
 * 소방서 단위 출동 관리
 */
// @Entity
// @Table(name = "fire_dispatches")
// @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
// public class FireDispatchEntity {

//     @Id
//     @GeneratedValue(strategy = GenerationType.IDENTITY)
//     private Long id;

//     // 신고 토큰 (UUID, PK가 아닌 참조값)
//     @Column(nullable = false)
//     private String reportToken;

//     // 출동할 소방서 ID
//     @Column(nullable = false)
//     private Long fireStationId;

//     @Column(nullable = false)
//     private String status;
// }

@Entity
@Table(name = "fire_dispatches")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FireDispatchEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 어떤 신고에 대한 출동인지
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "fire_report_id")
    private FireReportEntity fireReport;

    // 어떤 소방서가 출동하는지
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "fire_station_id")
    private FireStationEntity fireStation;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private FireReportStatus status;

    @Column(name = "dispatched_at")
    private LocalDateTime dispatchedAt;
}