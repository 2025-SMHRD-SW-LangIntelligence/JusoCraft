import DashboardLayout from "../layouts/DashboardLayout";
import ReportTable from "../components/ReportTable";
import { useEffect, useState } from "react";
import axios from "axios";

export default function AllReportsPage() {
    const [reports, setReports] = useState([]);

    useEffect(() => {
        axios
            .get(`${import.meta.env.VITE_API_URL}/fire-reports`)
            .then((res) => setReports(res.data))
            .catch(console.error);
    }, []);

    return (
        <DashboardLayout>
            <h1 className="text-2xl font-bold mb-4">모든 화재 신고</h1>
            {reports.length === 0 ? (
                <p>등록된 신고가 없습니다.</p>
            ) : (
                <ReportTable data={reports} />
            )}
        </DashboardLayout>
    );
}
