import { toKr } from "../utils/statusLabel";

const fmt = (iso) =>
    iso ? new Date(iso).toLocaleString("sv-SE", { timeZone: "Asia/Seoul" }) : "-";

// 출동 지시 불가 상태
const BLOCKED = ["WITHDRAWN", "OVERHAUL", "MONITORING"];   // [추가]

export default function ReportTable({ data, onSelect }) {
    return (
        <table className="w-full text-sm border">
            <thead className="bg-gray-100">
            <tr>
                <th className="p-2 border">신고&nbsp;ID</th>
                <th className="p-2 border">신고 내용</th>
                <th className="p-2 border">신고자 주소</th>
                <th className="p-2 border">화재 주소</th>
                <th className="p-2 border">신고 시각</th>
                <th className="p-2 border">상태</th>
                <th className="p-2 border">출동 지시</th>
            </tr>
            </thead>

            <tbody>
            {data.map((r) => {
                const blocked = BLOCKED.includes(r.status);

                return (
                    <tr
                        key={r.id}
                        onClick={() => onSelect?.(r)}
                        className="cursor-pointer hover:bg-blue-50"
                    >
                        <td className="p-2 border text-center">{r.id}</td>
                        <td className="p-2 border">{r.reportContent}</td>
                        <td className="p-2 border">{r.reporterAddress ?? "-"}</td>
                        <td className="p-2 border">{r.fireAddress ?? "-"}</td>
                        <td className="p-2 border">{fmt(r.reportedAt)}</td>
                        <td className="p-2 border">{toKr(r.status)}</td>

                        <td className="p-2 border text-center">
                            <button
                                className={
                                    blocked
                                        ? "px-3 py-1 bg-gray-300 text-white rounded cursor-not-allowed"
                                        : "px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                                }
                                disabled={blocked}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (!blocked) onSelect?.(r);
                                }}
                            >
                                보기
                            </button>
                        </td>
                    </tr>
                );
            })}
            </tbody>
        </table>
    );
}
