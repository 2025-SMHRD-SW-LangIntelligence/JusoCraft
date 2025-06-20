import { toKr } from "../utils/StatusLabel";


export default function ActiveDispatchTable({ data }) {
    return (
        <table className="w-full text-sm border">
            <thead className="bg-gray-100">
            <tr>
                <th className="p-2 border">ID</th>
                <th className="p-2 border">소방서</th>
                <th className="p-2 border">소방서 주소</th>
                <th className="p-2 border">화재 현장 주소</th>
                <th className="p-2 border">상태</th>
                <th className="p-2 border">출동 시각</th>
            </tr>
            </thead>
            <tbody>
            {data.map((d) => (
                <tr key={d.id}>
                    <td className="p-2 border text-center">{d.id}</td>
                    <td className="p-2 border">{d.fireStationName}</td>
                    <td className="p-2 border">{d.fireStationAddress}</td>
                    <th className="p-2 border">{d.fireAddress}</th>
                    <td className="p-2 border">{toKr(d.status)}</td>
                    <td>{d.dispatchedAt.replace('T', ' ')}</td>
                </tr>
            ))}
            </tbody>
        </table>
    );
}
