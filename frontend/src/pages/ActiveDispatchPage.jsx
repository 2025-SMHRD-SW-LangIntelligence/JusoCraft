import { useEffect, useState } from "react";
import axios from "axios";
import DashboardLayout from "../layouts/DashboardLayout";
import ActiveDispatchTable from "../components/ActiveDispatchTable";

export default function ActiveDispatchPage() {
    const [dispatches, setDispatches] = useState([]);
    const apiUrl = import.meta.env.VITE_API_URL;


    useEffect(() => {
        const fetchData = () =>
            axios
                .get(`${apiUrl}/fire-dispatches/active`)
                .then((res) => setDispatches(res.data))
                .catch(console.error);

        fetchData();
        const timer = setInterval(fetchData, 60_000);
        return () => clearInterval(timer);
    }, [apiUrl]);

    return (
        <DashboardLayout>
            <h1 className="text-2xl font-bold mb-4">출동 중 소방서 목록</h1>

            {dispatches.length === 0 ? (
                <p>현재 출동 중인 소방서가 없습니다.</p>
            ) : (
                <ActiveDispatchTable data={dispatches} />
            )}
        </DashboardLayout>
    );
}
