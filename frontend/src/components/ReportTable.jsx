import { toKr } from "../utils/statusLabel";   // utils 폴더 파일명과 대소문자 맞추기

const fmt = (iso) =>
    iso ? new Date(iso).toLocaleString("sv-SE", { timeZone: "Asia/Seoul" }) : "-";

export default function ReportTable({ data }) {
    return (
        <table className="w-full text-sm border">
            <thead className="bg-gray-100">
            <tr>
                <th className="p-2 border">신고 ID</th>
                <th className="p-2 border">신고 내용</th>
                <th className="p-2 border">신고자 주소</th>
                <th className="p-2 border">화재 주소</th>
                <th className="p-2 border">신고 시각</th>
                <th className="p-2 border">상태</th>
            </tr>
            </thead>

            <tbody>
            {data.map((r) => (
                <tr key={r.id}>
                    <td className="p-2 border text-center">{r.id}</td>
                    <td className="p-2 border">{r.reportContent}</td>
                    <td className="p-2 border">{r.reporterAddress ?? "-"}</td>
                    <td className="p-2 border">{r.fireAddress ?? "-"}</td>
                    <td className="p-2 border">{fmt(r.reportedAt)}</td>
                    <td className="p-2 border">{toKr(r.status)}</td>
                </tr>
            ))}
            </tbody>
        </table>
    );
}