package com.firemap.backend.repository;

import com.firemap.backend.entity.EmergencyInfoEntity;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EmergencyInfoRepository extends JpaRepository<EmergencyInfoEntity, Long> {
    // 1도, 2도 화상용
    List<EmergencyInfoEntity> findByIsEmergencyRoomOperating(String y);

    // 3도, 4도 화상용
    List<EmergencyInfoEntity> findByIsEmergencyRoomOperatingAndBurnCare(String y1, String y2);
}
