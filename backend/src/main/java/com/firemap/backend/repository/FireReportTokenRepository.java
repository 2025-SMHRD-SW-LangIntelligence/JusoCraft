package com.firemap.backend.repository;
import org.springframework.data.jpa.repository.JpaRepository;

import com.firemap.backend.entity.FireReportTokenEntity;

import java.util.Optional;

public interface FireReportTokenRepository extends JpaRepository<FireReportTokenEntity, Long> {
    Optional<FireReportTokenEntity> findByToken(String token);
}
