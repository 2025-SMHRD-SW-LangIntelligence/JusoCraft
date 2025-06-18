package com.firemap.backend.repository;

import com.firemap.backend.entity.WaterStorageEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface WaterStorageRepository extends JpaRepository<WaterStorageEntity, Long> {
}
