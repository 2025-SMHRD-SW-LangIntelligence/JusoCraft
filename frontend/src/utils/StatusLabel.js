// 영문 상태코드 → 한글 라벨 매핑
export const statusLabel = {
    RECEIVED: "접수",
    DISPATCHED: "출동",
    ARRIVED: "도착",
    INITIAL_SUPPRESSION: "초진",
    OVERHAUL: "잔불정리",
    FULLY_SUPPRESSED: "완진",
    WITHDRAWN: "철수",
    MONITORING: "잔불감시",
};

export function toKr(code) {
    return statusLabel[code] ?? code;
}
