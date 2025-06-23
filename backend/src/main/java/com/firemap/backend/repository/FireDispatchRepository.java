package com.firemap.backend.repository;

import com.firemap.backend.entity.FireDispatchEntity;
import com.firemap.backend.entity.FireReportEntity;
import com.firemap.backend.entity.FireStationEntity;
import com.firemap.backend.enums.FireReportStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;


@Repository
public interface FireDispatchRepository extends JpaRepository<FireDispatchEntity, Long> {
    List<FireDispatchEntity> findByFireReport_ReportToken_Token(String reportToken);

    // 출동 상태를 추출하기 위해..
    List<FireDispatchEntity> findByStatusIn(List<FireReportStatus> statuses);


    // 소방서 URL을 2번 누를경우 출동신고를 2번 만들어 생기는 버그를 방지하기 위함
    Optional<FireDispatchEntity> findTopByFireReportAndFireStationAndStatusIn(
            FireReportEntity report,
            FireStationEntity station,
            List<FireReportStatus> statuses);
}
