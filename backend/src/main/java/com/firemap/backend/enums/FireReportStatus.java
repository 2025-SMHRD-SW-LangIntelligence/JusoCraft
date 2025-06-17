package com.firemap.backend.enums;

import com.fasterxml.jackson.annotation.JsonCreator;

// 접수, 출동, 도착, 초진, 잔불정리, 완진, 철수, 잔불감시

public enum FireReportStatus {
    RECEIVED,         // 접수
    DISPATCHED,       // 출동
    ARRIVED,          // 도착
    INITIAL_SUPPRESSION, // 초진
    OVERHAUL,         // 잔불정리
    FULLY_SUPPRESSED, // 완진
    WITHDRAWN,        // 철수
    MONITORING;        // 잔불감시
    // @JsonCreator
    // public static FireReportStatus from(String value) {
    //     return FireReportStatus.valueOf(value.toUpperCase());
    // }
}