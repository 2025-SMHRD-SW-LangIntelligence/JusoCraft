package com.firemap.backend.repository;

import com.firemap.backend.entity.FireStationEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FireStationRepository extends JpaRepository<FireStationEntity, Long> {
}