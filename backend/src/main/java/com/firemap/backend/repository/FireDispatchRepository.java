package com.firemap.backend.repository;

import com.firemap.backend.entity.FireDispatchEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;


@Repository
public interface FireDispatchRepository extends JpaRepository<FireDispatchEntity, Long> {
    List<FireDispatchEntity> findByFireReport_ReportToken_Token(String reportToken);
}
