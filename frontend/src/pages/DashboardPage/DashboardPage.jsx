import { useEffect, useState } from "react";
import axios from "axios";
import ReportTable from "./ReportTable";
import ReportDetail from "./ReportDetail";
import StatsCards from "../../components/StatsCards";
import GenerateUrl from "../../components/GenerateUrl";
import UrlTable from "./UrlTable";
import DashboardMap from "./DashboardMap";
import ModalWrapper from "../../components/ModalWrapper";

function DashboardPage() {
    const [reports, setReports] = useState([]);
    const [selectedReport, setSelectedReport] = useState(null);
    const [fireStations, setFireStations] = useState([]);
    const [urls, setUrls] = useState([]); // URL 리스트 상태
    const apiUrl = import.meta.env.VITE_API_URL;
    const [dispatchUrl, setDispatchUrl] = useState(null); // 모달에 표시할 출동 URL
    const [dispatchInfo, setDispatchInfo] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [reportsRes, stationsRes] = await Promise.all([
                    axios.get(`${apiUrl}/fire-reports`),
                    axios.get(`${apiUrl}/fire-stations`),
                ]);
                setReports(reportsRes.data);
                setFireStations(stationsRes.data);
            } catch (error) {
                console.error("❌ 데이터 불러오기 실패:", error);
            }
        };

        fetchData();
    }, [apiUrl]);

    useEffect(() => {
        if (reports.length === 0) return;

        const fetchUrls = async () => {
            try {
                const { data: tokens } = await axios.get(
                    `${apiUrl}/fire-report-tokens/all`
                );

                const urlList = tokens.map((token) => {
                    const matchedReport = reports.find(
                        (r) => r.token === token
                    );

                    return {
                        token,
                        reportId: matchedReport ? matchedReport.id : null,
                        url: `${window.location.origin}/report?token=${token}`,
                    };
                });

                setUrls(urlList);
            } catch (err) {
                console.error("❌ URL 불러오기 실패", err);
            }
        };

        fetchUrls();
    }, [apiUrl, reports]);

    const handleDispatch = async (reportToken, fireStationId) => {
        try {
            const res = await axios.post(`${apiUrl}/fire-dispatches`, {
                reportToken,
                fireStationId,
                status: "RECEIVED",
            });

            const dispatchId = res.data.id;
            const url = `${window.location.origin}/firefighter?token=${reportToken}&fireStationId=${fireStationId}&dispatchId=${dispatchId}`;

            // 출동 URL과 소방서 ID를 함께 저장
            setDispatchInfo({ url, fireStationId });

            console.log("🧩 fireStations 목록:");
            fireStations.forEach((s) => {
                console.log(`- ID: ${s.id}, 이름: ${s.centerName}`);
            });

            // URL 테이블 업데이트
            setUrls((prev) => [
                ...prev,
                {
                    reportId: selectedReport?.id,
                    fireStationId,
                    url,
                },
            ]);

            // 신고 상태 업데이트
            setReports((prev) =>
                prev.map((r) =>
                    r.id === selectedReport?.id
                        ? { ...r, status: "RECEIVED" }
                        : r
                )
            );
            setSelectedReport((prev) =>
                prev ? { ...prev, status: "RECEIVED" } : prev
            );
        } catch (error) {
            alert("❌ 출동 지시 실패");
            console.error(error);
        }
    };

    return (
        <div className="flex flex-col gap-8">
            <StatsCards />
            <GenerateUrl
                onUrlGenerated={(newUrlEntry) => {
                    setUrls((prev) => [newUrlEntry, ...prev]);
                }}
            />

            <div className="flex flex-col xl:flex-row gap-6">
                <div className="w-full xl:w-2/3 flex flex-col gap-6">
                    {/* 신고 테이블 */}
                    <ReportTable
                        reports={
                            reports
                                .filter((r) => r.inputStatus === "REPORTED") // 위치 입력 완료된 건
                                .filter(
                                    (r) => !["WITHDRAWN"].includes(r.status)
                                ) // 완료 상태 제외
                        }
                        onSelect={(report) => setSelectedReport(report)}
                    />

                    {/* URL 테이블 */}
                    <UrlTable urls={urls} reports={reports} />
                </div>

                {/* 지역 지도 */}
                <div className="w-full xl:w-1/3">
                    <DashboardMap />
                </div>
            </div>

            {selectedReport && (
                <ModalWrapper
                    title={
                        <div className="flex items-center">
                            신고 상세 보기
                            <div className="flex gap-4 text-sm text-gray-500 ml-3">
                                <p className="font-medium">
                                    <strong className="text-gray-700 font-medium">
                                        ID
                                    </strong>
                                    :{selectedReport.id}
                                </p>
                                <p className="font-medium">
                                    <strong className="text-gray-700 font-medium">
                                        URL
                                    </strong>
                                    :
                                    {selectedReport.token ? (
                                        <a
                                            href={`http://localhost:5173/report?token=${selectedReport.token}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 hover:underline ml-1"
                                        >
                                            {selectedReport.token}
                                        </a>
                                    ) : (
                                        <span className="ml-1">없음</span>
                                    )}
                                </p>
                            </div>
                        </div>
                    }
                    onClose={() => setSelectedReport(null)}
                    size="xl"
                >
                    <ReportDetail
                        report={selectedReport}
                        fireStations={fireStations}
                        onDispatch={handleDispatch}
                    />
                </ModalWrapper>
            )}

            {dispatchInfo && (
                <ModalWrapper
                    title="출동 URL 생성 완료"
                    onClose={() => setDispatchInfo(null)}
                    size="md"
                >
                    <div className="flex flex-col gap-4">
                        <p>
                            출동 소방서:{" "}
                            <strong>
                                {fireStations.find(
                                    (s) =>
                                        String(s.id) ===
                                        String(dispatchInfo.fireStationId)
                                )?.centerName ?? "알 수 없음"}
                            </strong>
                        </p>
                        <a
                            href={dispatchInfo.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 font-pretandard break-all hover:underline"
                        >
                            {dispatchInfo.url}
                        </a>
                        <button
                            onClick={() => {
                                navigator.clipboard.writeText(dispatchInfo.url);
                                setDispatchInfo(null);
                            }}
                            className="self-end bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                        >
                            출동 URL 전송
                        </button>
                    </div>
                </ModalWrapper>
            )}
        </div>
    );
}

export default DashboardPage;
