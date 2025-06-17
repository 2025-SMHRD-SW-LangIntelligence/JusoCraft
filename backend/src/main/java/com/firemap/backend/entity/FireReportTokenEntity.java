package com.firemap.backend.entity;

import jakarta.persistence.*;
import lombok.*;

// 양방향 연관관계 추가
@Entity
@Table(name = "fire_report_tokens")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FireReportTokenEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false, length = 36)
    private String token;

    @OneToOne(mappedBy = "reportToken", fetch = FetchType.LAZY)
    private FireReportEntity fireReport;
}