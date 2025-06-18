package com.firemap.backend.repository;

import com.firemap.backend.entity.EmergencyInfoEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EmergencyInfoRepository extends JpaRepository<EmergencyInfoEntity, Long> {
}
