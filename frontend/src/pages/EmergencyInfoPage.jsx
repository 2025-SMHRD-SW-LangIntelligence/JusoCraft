import { useEffect, useState } from "react";
import axios from "axios";
import DashboardLayout from "../layouts/DashboardLayout";
import EmergencyTable from "../components/EmergencyTable";

export default function EmergencyPage() {
    const [hospitals, setHospitals] = useState([]);
    const apiUrl = import.meta.env.VITE_API_URL;

    useEffect(() => {
        axios
            .get(`${apiUrl}/emergency-info`)
            .then((res) => setHospitals(res.data))
            .catch(console.error);
    }, [apiUrl]);

    return (
        <DashboardLayout>
            <h1 className="text-2xl font-bold mb-4">응급실 정보 목록</h1>

            {hospitals.length === 0 ? (
                <p>등록된 응급실 정보가 없습니다.</p>
            ) : (
                <EmergencyTable data={hospitals} />
            )}
        </DashboardLayout>
    );
}
