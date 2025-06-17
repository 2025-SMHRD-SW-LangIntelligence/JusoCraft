package com.firemap.backend.repository;

import com.firemap.backend.entity.HydrantEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface HydrantRepository extends JpaRepository<HydrantEntity, Long> {
}