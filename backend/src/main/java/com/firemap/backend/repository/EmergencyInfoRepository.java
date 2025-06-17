package com.firemap.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EmergencyInfoRepository extends JpaRepository<EmergencyInfoRepository, Long> {
}
