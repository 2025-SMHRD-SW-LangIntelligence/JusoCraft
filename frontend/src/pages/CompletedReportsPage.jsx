import { useEffect, useState } from "react";
import axios from "axios";
import DashboardLayout from "../layouts/DashboardLayout";
import CompletedTable from "../components/CompletedTable";

export default function CompletedReportsPage() {
    const [reports, setReports] = useState([]);
    const apiUrl = import.meta.env.VITE_API_URL;

    useEffect(() => {
        axios
            .get(`${apiUrl}/fire-reports/completed`)
            .then((res) => setReports(res.data))
            .catch(console.error);
    }, [apiUrl]);

    return (
        <DashboardLayout>
            <h1 className="text-2xl font-bold mb-4">완료된 신고 목록</h1>

            {reports.length === 0 ? (
                <p>완료된 신고가 없습니다.</p>
            ) : (
                <CompletedTable data={reports} />
            )}
        </DashboardLayout>
    );
}
