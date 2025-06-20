import { useEffect, useState } from "react";
import axios from "axios";
import DashboardLayout from "../layouts/DashboardLayout";
import StationTable from "../components/StationTable";

export default function StationPage() {
    const [stations, setStations] = useState([]);
    const [sortKey, setSortKey]   = useState("none");   // none | dispatch | avail
    const apiUrl = import.meta.env.VITE_API_URL;

    useEffect(() => {
        axios
            .get(`${apiUrl}/fire-stations/with-status`)
            .then((res) => setStations(res.data))
            .catch(console.error);
    }, [apiUrl]);

    // 정렬
    const sorted = [...stations].sort((a, b) => {
        if (sortKey === "dispatch") {
            // 출동중(true) 를 위로
            const aBusy = a.status && a.status !== "WITHDRAWN";
            const bBusy = b.status && b.status !== "WITHDRAWN";
            return (bBusy ? 1 : 0) - (aBusy ? 1 : 0);
        }
        if (sortKey === "avail") {
            const aAvail = !a.status || a.status === "WITHDRAWN";
            const bAvail = !b.status || b.status === "WITHDRAWN";
            return (bAvail ? 1 : 0) - (aAvail ? 1 : 0);
        }
        return 0; // 기본
    });

    return (
        <DashboardLayout>
            <h1 className="text-2xl font-bold mb-4">소방서 정보</h1>

            {/* 정렬 버튼 */}
            <div className="mb-2 flex gap-2">
                <button
                    onClick={() => setSortKey("dispatch")}
                    className="px-2 py-1 bg-blue-600 text-white text-sm rounded"
                >
                    출동중 ↑
                </button>
                <button
                    onClick={() => setSortKey("avail")}
                    className="px-2 py-1 bg-green-600 text-white text-sm rounded"
                >
                    출동가능 ↑
                </button>
                <button
                    onClick={() => setSortKey("none")}
                    className="px-2 py-1 bg-gray-300 text-sm rounded"
                >
                    기본
                </button>
            </div>

            {stations.length === 0 ? (
                <p>소방서 정보를 불러오는 중...</p>
            ) : (
                <StationTable data={sorted} simple />
            )}
        </DashboardLayout>
    );
}