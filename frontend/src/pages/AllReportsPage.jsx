import { useEffect, useState } from "react";
import axios             from "axios";

import DashboardLayout   from "../layouts/DashboardLayout";
import ReportTable       from "../components/ReportTable";
import ReportDetail      from "../pages/DashboardPage/ReportDetail";
import ModalWrapper      from "../components/ModalWrapper";

export default function AllReportsPage() {

    const api = import.meta.env.VITE_API_URL;

    const [reports,  setReports]   = useState([]);
    const [selected, setSelected]  = useState(null);
    const [stations, setStations]  = useState([]);

    /* 🔽 출동 URL 모달용 state – DashboardPage 와 동일 ----------------- */
    const [dispatchInfo, setDispatchInfo] = useState(null);            // [추가]

    /* 전체 신고 + 소방서 ------------------------------------------------ */
    useEffect(() => {
        axios.get(`${api}/fire-reports`).then((r) => setReports(r.data));
        axios.get(`${api}/fire-stations`).then((r) => setStations(r.data));
    }, []);

    /* 출동 지시 (= DashboardPage 로직 그대로 복사) --------------------- */
    const handleDispatch = async (reportToken, fireStationId) => {     // [추가]
        try {
            const { data } = await axios.post(`${api}/fire-dispatches`, {
                reportToken,
                fireStationId,
                status: "RECEIVED",
            });

            const url = `${window.location.origin}/firefighter`
                + `?token=${reportToken}`
                + `&fireStationId=${fireStationId}`
                + `&dispatchId=${data.id}`;

            setDispatchInfo({ url, fireStationId });

            // 화면상의 신고 상태만 즉시 갱신
            setReports(prev =>
                prev.map(r => r.id === selected?.id ? { ...r, status: "RECEIVED" } : r)
            );
            setSelected(prev => prev ? { ...prev, status: "RECEIVED" } : prev);

        } catch (e) {
            alert("❌ 출동 지시 실패");
            console.error(e);
        }
    };
    /* ------------------------------------------------------------------ */

    return (
        <DashboardLayout>
            <h1 className="text-2xl font-bold mb-4">모든 화재 신고</h1>

            {reports.length === 0 ? (
                <p>등록된 신고가 없습니다.</p>
            ) : (
                <ReportTable
                    data={reports}
                    onSelect={setSelected}
                />
            )}

            {/* 상세 모달 --------------------------------------------------- */}
            {selected && (
                <ModalWrapper
                    title={`신고 상세 보기 – ID ${selected.id}`}
                    size="xl"
                    onClose={() => setSelected(null)}
                >
                    <ReportDetail
                        report={selected}
                        fireStations={stations}
                        onDispatch={handleDispatch}          /* [변경] 실제 디스패치 연결 */
                    />
                </ModalWrapper>
            )}

            {/* 출동 URL 완료 모달 ---------------------------------------- */}
            {dispatchInfo && (                                           // [추가]
                <ModalWrapper
                    title="출동 URL 생성 완료"
                    size="md"
                    onClose={() => setDispatchInfo(null)}
                >
                    <div className="flex flex-col gap-4">
                        <p>
                            출동 소방서:&nbsp;
                            <strong>
                                {stations.find(
                                    s => String(s.id) === String(dispatchInfo.fireStationId)
                                )?.centerName ?? "알 수 없음"}
                            </strong>
                        </p>

                        <a
                            href={dispatchInfo.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 break-all hover:underline"
                        >
                            {dispatchInfo.url}
                        </a>

                        <button
                            className="self-end bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                            onClick={() => {
                                navigator.clipboard.writeText(dispatchInfo.url);
                                setDispatchInfo(null);
                            }}
                        >
                            출동 URL 전송
                        </button>
                    </div>
                </ModalWrapper>
            )}
        </DashboardLayout>
    );
}
