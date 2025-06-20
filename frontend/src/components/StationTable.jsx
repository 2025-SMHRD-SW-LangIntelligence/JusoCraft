import { badge, simpleBadge } from "../utils/StationStatusLabel.js";

/**
 * @param {Array}  data   - Fire-station DTO 배열
 * @param {Boolean} simple - true 면 “출동 / 대기” 두 단계만 표시
 */
export default function StationTable({ data, simple = false }) {
    const getBadge = simple ? simpleBadge : badge;

    return (
        <table className="w-full text-sm border">
            <thead className="bg-gray-100">
            <tr>
                <th className="p-2 border">본부</th>
                <th className="p-2 border">센터명</th>
                <th className="p-2 border">주소</th>
                <th className="p-2 border">전화</th>
                <th className="p-2 border">현재 상태</th>
                <th className="p-2 border">출동 지시</th>
            </tr>
            </thead>

            <tbody>
            {data.map((s) => {
                const b = getBadge(s.status);           // 🔹 뱃지 계산
                return (
                    <tr key={s.id}>
                        <td className="p-2 border">{s.sidoHeadquarter}</td>
                        <td className="p-2 border">{s.centerName}</td>
                        <td className="p-2 border">{s.address}</td>
                        <td className="p-2 border">{s.phoneNumber}</td>

                        {/* 상태 뱃지 */}
                        <td className="p-2 border">
                <span className={`px-2 py-1 text-xs rounded ${b.color}`}>
                  {b.text}
                </span>
                        </td>

                        {/* 출동 지시 가능 여부 */}
                        <td className="p-2 border text-center">
                                            {(!s.status || s.status === "WITHDRAWN") ? "가능" : "불가"}
                                          </td>
                    </tr>
                );
            })}
            </tbody>
        </table>
    );
}
