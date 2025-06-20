import { toKr } from "../utils/statusLabel";   // ⚠️ 실제 파일명과 대소문자 맞추기

export default function CompletedTable({ data }) {
    const fmt = (iso) => {
        if (!iso) return "-";
        const d = new Date(iso);
        const pad = (n) => String(n).padStart(2, "0");

        return [
                d.getFullYear(),
                pad(d.getMonth() + 1),
                pad(d.getDate()),
            ].join("-") + " " +
            [
                pad(d.getHours()),
                pad(d.getMinutes()),
                pad(d.getSeconds()),
            ].join(":");
    };

    return (
        <table className="w-full text-sm border">
            <thead className="bg-gray-100">
            <tr>
                <th className="p-2 border">ID</th>
                <th className="p-2 border">담당 소방서</th>
                <th className="p-2 border">화재 주소</th>
                <th className="p-2 border">신고 시각</th>
                <th className="p-2 border">진압 시각</th>
                <th className="p-2 border">소요&nbsp;시간</th>
                <th className="p-2 border">상태</th>
            </tr>
            </thead>

            <tbody>
            {data.map((r) => {
                // 소요 시간 계산 (분 단위)
                const minutes =
                    r.completedAt && r.reportedAt
                        ? Math.round(
                            (new Date(r.completedAt) - new Date(r.reportedAt)) / 60000
                        )
                        : null;

                return (
                    <tr key={r.id}>
                        <td className="p-2 border text-center">{r.id}</td>
                        <td className="p-2 border">{r.stationName}</td>
                        <td className="p-2 border">{r.fireAddress ?? "-"}</td>


                        <td className="p-2 border">{fmt(r.reportedAt)}</td>
                        <td className="p-2 border">{fmt(r.completedAt)}</td>


                        <td className="p-2 border">
                            {minutes !== null ? `${minutes}분` : "-"}
                        </td>

                        <td className="p-2 border">{toKr(r.status)}</td>
                    </tr>
                );
            })}
            </tbody>
        </table>
    );
}
