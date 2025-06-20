import { toKr } from "../utils/StatusLabel";

export default function CompletedTable({ data }) {
    return (
        <table className="w-full text-sm border">
            <thead className="bg-gray-100">
            <tr>
                <th className="p-2 border">ID</th>
                <th className="p-2 border">담당 소방서</th>
                <th className="p-2 border">화재 주소</th>
                <th className="p-2 border">신고 시각</th>
                <th className="p-2 border">상태</th>
            </tr>
            </thead>
            <tbody>
            {data.map((r) => (
                <tr key={r.id}>
                    <td className="p-2 border text-center">{r.id}</td>
                    <td className="p-2 border">{r.stationName}</td>
                    <td className="p-2 border">{r.fireAddress}</td>
                    <td>{r.reportedAt.replace('T', ' ')}</td>
                    <td className="p-2 border">{toKr(r.status)}</td>
                </tr>
            ))}
            </tbody>
        </table>
    );
}