package com.firemap.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.firemap.backend.entity.FireReportEntity;
import com.firemap.backend.entity.FireReportTokenEntity;
import com.firemap.backend.enums.ReportInputStatus;

import java.util.List;
import java.util.Optional;

// public interface FireReportRepository extends JpaRepository<FireReportEntity, Long> {
//     Optional<FireReportEntity> findByReportToken(FireReportTokenEntity reportToken);
// }

// public interface FireReportRepository extends JpaRepository<FireReportEntity, Long> {
//     Optional<FireReportEntity> findByReportToken(FireReportTokenEntity reportToken);

//     // 토큰 문자열로 FireReportEntity 조회 (새로 추가)
//     @Query("SELECT fr FROM FireReportEntity fr JOIN FETCH fr.reportToken rt WHERE rt.token = :token")
//     Optional<FireReportEntity> findByReportToken_Token(String token);

//     // 토큰 엔티티까지 한번에 fetch
//     @Query("SELECT fr FROM FireReportEntity fr JOIN FETCH fr.reportToken")
//     List<FireReportEntity> findAllWithToken();
// }

public interface FireReportRepository extends JpaRepository<FireReportEntity, Long> {

    Optional<FireReportEntity> findByReportToken(FireReportTokenEntity reportToken);

    @Query("SELECT fr FROM FireReportEntity fr JOIN FETCH fr.reportToken rt WHERE rt.token = :token")
    Optional<FireReportEntity> findByReportToken_Token(String token);

    @Query("SELECT fr FROM FireReportEntity fr JOIN FETCH fr.reportToken")
    List<FireReportEntity> findAllWithToken();

    List<FireReportEntity> findByInputStatus(ReportInputStatus inputStatus);
}