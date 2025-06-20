import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useState } from "react";
import { FiPlus, FiMinus } from "react-icons/fi";
import axios from "axios";

// 상태
function translateStatus(status) {
    if (!status) return "정보 없음";

    switch (status) {
        case "RECEIVED":
            return "신고 접수";
        case "DISPATCHED":
            return "출동 지시";
        case "ARRIVED":
            return "현장 도착";
        case "INITIAL_SUPPRESSION":
            return "초기 진압";
        case "OVERHAUL":
            return "잔불 정리";
        case "FULLY_SUPPRESSED":
            return "완전 진압";
        case "WITHDRAWN":
            return "철수";
        case "MONITORING":
            return "잔불 감시";
        default:
            return "정보 없음";
    }
}

// leaflet 기본 마커 아이콘 제거
delete L.Icon.Default.prototype._getIconUrl;

// 마커 색상
const STATUS_COLOR_MAP = {
    RECEIVED: "gray",
    DISPATCHED: "blue",
    ARRIVED: "indigo",
    INITIAL_SUPPRESSION: "orange",
    OVERHAUL: "yellow",
    FULLY_SUPPRESSED: "green",
    WITHDRAWN: "red",
    MONITORING: "purple",
};

// 마커 아이콘 생성 함수
function getMarkerIcon(status = STATUS_COLOR_MAP) {
    const color = STATUS_COLOR_MAP[status] || "gray";

    return L.divIcon({
        className: "",
        html: `
            <span class="relative block w-4 h-4">
                <span class="absolute right-0 top-0.5 z-10 h-3 w-3 rounded-full" 
                      style="background-color:${color}; display:flex;">
                    <span class="absolute inline-flex w-full h-full rounded-full opacity-75 animate-ping"
                          style="background-color:${color};"></span>
                </span>
            </span>
        `,
        iconSize: [16, 16],
        iconAnchor: [8, 8],
    });
}

// 지도 줌 컨트롤러
function MapController({ zoom }) {
    const map = useMap();
    map.setZoom(zoom);
    return null;
}

export default function DashboardMap() {
    const [zoom, setZoom] = useState(10);
    const [fireReports, setFireReports] = useState([]);

    const handleZoomIn = () => setZoom((z) => Math.min(z + 1, 18));
    const handleZoomOut = () => setZoom((z) => Math.max(z - 1, 1));

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const response = await axios.get(
                    `${import.meta.env.VITE_API_URL}/fire-reports`
                );
                setFireReports(response.data);
            } catch (err) {
                console.error("🔥 신고 데이터 불러오기 실패", err);
            }
        };

        fetchReports();
    }, []);

    // 유효한 화재 위치 기준으로 마커 생성
    const validReports = fireReports.filter(
        (r) => typeof r.fireLat === "number" && typeof r.fireLng === "number"
    );

    const mapCenter =
        validReports.length > 0
            ? [validReports[0].fireLat, validReports[0].fireLng]
            : [35.1595, 126.8526]; // 기본 좌표

    return (
        <div className="rounded-2xl border border-gray-200 bg-white">
            <div className="flex items-center justify-between px-6 py-4">
                <h3 className="text-base font-medium text-gray-800">
                    화재 위치
                </h3>
                <div className="flex gap-1">
                    <button
                        onClick={handleZoomIn}
                        className="rounded-md border border-gray-300 px-1 py-1 hover:bg-gray-100"
                    >
                        <FiPlus className="w-4 h-4 text-gray-700" />
                    </button>
                    <button
                        onClick={handleZoomOut}
                        className="rounded-md border border-gray-300 px-1 py-1 hover:bg-gray-100"
                    >
                        <FiMinus className="w-4 h-4 text-gray-700" />
                    </button>
                </div>
            </div>

            <div className="p-4 border-t border-gray-100 sm:p-6">
                <MapContainer
                    center={mapCenter}
                    zoom={zoom}
                    className="w-full h-[500px] rounded-xl border"
                >
                    <TileLayer
                        attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                    />

                    {validReports.map((report) => (
                        <Marker
                            key={report.id}
                            position={[report.fireLat, report.fireLng]}
                            icon={getMarkerIcon(report.status)}
                        >
                            <Popup>
                                <div className="text-xs">
                                    <span className="font-semibold">
                                        {report.fireAddress}
                                    </span>
                                    <br />
                                    <span className="text-gray-600">
                                        신고자: {report.reporterPhone}
                                    </span>
                                    <br />
                                    <span className="text-gray-600">
                                        상태:
                                        {translateStatus(report.status)}
                                    </span>
                                    <br />
                                    <span className="text-gray-400 text-xs">
                                        신고시각:
                                        {new Date(
                                            report.reportedAt
                                        ).toLocaleTimeString()}
                                    </span>
                                </div>
                            </Popup>
                        </Marker>
                    ))}

                    <MapController zoom={zoom} />
                </MapContainer>
            </div>
        </div>
    );
}
