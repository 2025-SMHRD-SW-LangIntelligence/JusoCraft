import { roomLabel, ynLabel } from "../utils/emergencyLabel";

export default function EmergencyTable({ data }) {
    // 우선순위 파악
    const PRIORITY_NOT_OPERATING = 100;
    const PRIORITY_NOT_AVAILABLE = 50;
    const PRIORITY_NO_BURNCARE  = 10;   // 화상 치료
    const PRIORITY_NO_ENDOSCOPE = 5;    // 내시경

    const score = (h) => {
        let s = 0;
        if (h.hasEmergencyRoom !== 1)        s += PRIORITY_NOT_OPERATING;
        if (h.isEmergencyRoomOperating !== "Y") s += PRIORITY_NOT_AVAILABLE;
        if (h.burnCare !== "Y")              s += PRIORITY_NO_BURNCARE;
        if (h.endoscope !== "Y")             s += PRIORITY_NO_ENDOSCOPE;
        return s;
    };

    // 우선순위대로 정렬
    const sorted = [...data].sort((a, b) => score(a) - score(b));

    return (
        <table className="w-full text-sm border">
            <thead className="bg-gray-100">
            <tr>
                <th className="p-2 border">기관코드</th>
                <th className="p-2 border">병원명</th>
                <th className="p-2 border">주소</th>
                <th className="p-2 border">응급실 운영</th>
                <th className="p-2 border">실시간 가용</th>
                <th className="p-2 border">중증 화상치료</th>
                <th className="p-2 border">응급 내시경</th>
                <th className="p-2 border">전화</th>
            </tr>
            </thead>
            <tbody>
            {sorted.map((h) => (
                <tr key={h.id}>
                    <td className="p-2 border text-center">{h.code}</td>
                    <td className="p-2 border">{h.name}</td>
                    <td className="p-2 border">{h.address}</td>

                    {/* 숫자(1/0)·Y/N → 한글 표시 */}
                    <td className="p-2 border text-center">{roomLabel(h.hasEmergencyRoom)}</td>
                    <td className="p-2 border text-center">{ynLabel(h.isEmergencyRoomOperating)}</td>
                    <td className="p-2 border text-center">{ynLabel(h.burnCare)}</td>
                    <td className="p-2 border text-center">{ynLabel(h.endoscope)}</td>

                    <td className="p-2 border">{h.phone}</td>
                </tr>
            ))}
            </tbody>
        </table>
    );
}
