import { useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import useFireDispatch from "./hooks/useFireDispatch";
import FireInfoPanel from "./FireInfoPanel";
import { HiOutlineRefresh } from "react-icons/hi";
import { MdSwipeVertical } from "react-icons/md";
import StatusDropdown from "./StatusDropdown";
import { FaPhone } from "react-icons/fa6";

function FirefighterPage() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");
    const fireStationId = searchParams.get("fireStationId");
    const dispatchId = searchParams.get("dispatchId");
    const [routePriority, setRoutePriority] = useState("RECOMMEND"); // 경로 선택 체크박스 추가

    const { report, fireStation, hydrants, mapContainerId, refreshMapData } =
        useFireDispatch(token, fireStationId, routePriority);

    const [showToast, setShowToast] = useState(true);

    const handlePriorityChange = (e) => {
        setRoutePriority(e.target.value);
    };

    useEffect(() => {
        const timer = setTimeout(() => setShowToast(false), 5000);
        return () => clearTimeout(timer);
    }, []);

    if (!token) return <p>❗ token 파라미터가 없습니다.</p>;
    if (!fireStationId) return <p>❗ fireStationId 파라미터가 없습니다.</p>;
    if (report === undefined || fireStation === undefined)
        return <p>데이터 불러오는 중...</p>;
    if (report === null) return <p>❌ 신고 데이터를 불러오지 못했습니다.</p>;
    if (fireStation === null)
        return <p>❌ 소방서 데이터를 불러오지 못했습니다.</p>;
    if (!hydrants.length) return <p>❌ 소화전 데이터를 불러오지 못했습니다.</p>;

    return (
        <div>
            <div id={mapContainerId} className="w-full h-[100vh]"></div>

            <StatusDropdown dispatchId={dispatchId} />

            <button
                onClick={refreshMapData}
                className="absolute top-2 right-2 z-50 bg-white flex gap-2 items-center px-3 py-2 text-gray-600 rounded-3xl text-sm font-bold shadow-md outline-none border"
            >
                <HiOutlineRefresh className="text-xl" />
                새로고침
            </button>

            {showToast && (
                <div className="flex gap-3 fixed top-[60px] text-center left-1/2 w-[90%] transform -translate-x-1/2 bg-blue-600/80 text-white text-md px-4 py-2 rounded-lg shadow-md z-50 animate-fade-in-out">
                    <MdSwipeVertical className="text-white text-xl" />
                    지도에서 출동 경로를 확인하세요.
                </div>
            )}

            <div className="absolute top-[60px] flex right-2 z-10 bg-white p-2 rounded-lg shadow-md gap-2 text-sm">
                <label>
                    <input
                        type="radio"
                        name="priority"
                        value="RECOMMEND"
                        checked={routePriority === "RECOMMEND"}
                        onChange={handlePriorityChange}
                    />
                    추천
                </label>
                <label>
                    <input
                        type="radio"
                        name="priority"
                        value="TIME"
                        checked={routePriority === "TIME"}
                        onChange={handlePriorityChange}
                    />
                    최단 시간
                </label>
                <label>
                    <input
                        type="radio"
                        name="priority"
                        value="DISTANCE"
                        checked={routePriority === "DISTANCE"}
                        onChange={handlePriorityChange}
                    />
                    최단 거리
                </label>
            </div>

            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-white bg-opacity-95 shadow-[0_4px_12px_rgba(0,0,0,0.25)] rounded-tl-3xl rounded-tr-3xl p-5 z-50 flex flex-col gap-3">
                <FireInfoPanel report={report} fireStation={fireStation} />
                <button
                    onClick={refreshMapData}
                    className="justify-center items-center flex gap-3 tracking-wider px-6 py-3 text-white rounded-xl text-xl font-hakgyoansim bg-gradient-to-br from-blue-500 to-green-500"
                >
                    <FaPhone className="text-white text-xl" />
                    신고자 통화 연결
                    {/* <span className="text-sm tracking-tight">
                  {report?.reporterPhone || "번호 없음"}
               </span> */}
                </button>
            </div>
        </div>
    );
}

export default FirefighterPage;
