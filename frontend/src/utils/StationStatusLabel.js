const statusKo = {
    RECEIVED: "접수",
    DISPATCHED: "출동",
    ARRIVED: "도착",
    INITIAL_SUPPRESSION: "초진",
    OVERHAUL: "잔불정리",
    FULLY_SUPPRESSED: "완진",
    WITHDRAWN: "철수",
    MONITORING: "잔불감시",
};
const toKr = (s) => statusKo[s] ?? s;

/** ▸ 세부 단계 뱃지 (badge) */
export const badge = (s) => {
    //if (!s) return { text: "대기", color: "bg-gray-100 text-gray-700" };

    if (s === "DISPATCHED" || s === "ARRIVED")
        return { text: toKr(s), color: "bg-red-100 text-red-600" };

    if (s === "INITIAL_SUPPRESSION" || s === "OVERHAUL")
        return { text: toKr(s), color: "bg-orange-100 text-orange-600" };

    return { text: toKr(s), color: "bg-green-100 text-green-600" }; // 완진·철수
};

/** ▸ 출동 / 대기 두 단계만 */
export const simpleBadge = (s) => {
    if (!s || s === "WITHDRAWN")
        return { text: "대기", color: "bg-gray-100 text-gray-700" };
    return { text: "출동", color: "bg-red-100 text-red-600" };
};

/** ▸ 출동 지시 가능 여부 */
export const avail = (bool) => (bool ? "가능" : "불가");