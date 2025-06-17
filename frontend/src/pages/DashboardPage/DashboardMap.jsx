import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useState } from "react";
import { FiPlus, FiMinus } from "react-icons/fi";

delete L.Icon.Default.prototype._getIconUrl;

// 상태별 색상 매핑
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

// 오늘 날짜인지 체크하는 함수
function isToday(isoDateStr) {
   const reportDate = new Date(isoDateStr);
   const today = new Date();
   return (
      reportDate.getFullYear() === today.getFullYear() &&
      reportDate.getMonth() === today.getMonth() &&
      reportDate.getDate() === today.getDate()
   );
}

// 상태에 따른 마커 아이콘 생성 함수
function getMarkerIcon(status) {
   const color = STATUS_COLOR_MAP[status] || "gray";

   return L.divIcon({
      className: "",
      html: `
      <span class="relative block">
        <span class="absolute right-0 top-0.5 z-10 h-3 w-3 rounded-full" 
              style="background-color:${color}; display:flex;">
          <span class="absolute inline-flex w-full h-full rounded-full opacity-75 animate-ping"
                style="background-color:${color};"></span>
        </span>
      </span>
    `,
      iconSize: [20, 20],
      iconAnchor: [10, 10],
   });
}

// (테스트용) 더미 데이터 - 실제는 API에서 받아와야 함
const fireReports = [
   {
      id: 1,
      latitude: 35.1595,
      longitude: 126.8526,
      status: "RECEIVED",
      createdAt: new Date().toISOString(),
      address: "광주광역시 동구",
   },
   {
      id: 2,
      latitude: 35.17,
      longitude: 126.9,
      status: "DISPATCHED",
      createdAt: new Date().toISOString(),
      address: "광주광역시 서구",
   },
   {
      id: 3,
      latitude: 35.15,
      longitude: 126.8,
      status: "FULLY_SUPPRESSED",
      createdAt: "2024-06-10T10:00:00Z", // 오늘 날짜 아님
      address: "광주광역시 남구",
   },
];

function MapController({ zoom }) {
   const map = useMap();
   map.setZoom(zoom);
   return null;
}

export default function DashboardMap() {
   const [zoom, setZoom] = useState(8);

   const handleZoomIn = () => setZoom((z) => Math.min(z + 1, 18));
   const handleZoomOut = () => setZoom((z) => Math.max(z - 1, 1));

   return (
      <div className="rounded-2xl border border-gray-200 bg-white">
         <div className="flex items-center justify-between px-6 py-4">
            <h3 className="text-base font-medium text-gray-800">신고 위치</h3>
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
               center={[35.1595, 126.8526]}
               zoom={zoom}
               className="w-full h-[500px] rounded-xl border"
            >
               <TileLayer
                  attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                  url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
               />

               {/* 오늘 날짜 데이터만 필터링해서 상태별 마커 표시 */}
               {fireReports
                  .filter((report) => isToday(report.createdAt))
                  .map((report) => (
                     <Marker
                        key={report.id}
                        position={[report.latitude, report.longitude]}
                        icon={getMarkerIcon(report.status)}
                     >
                        <Popup>
                           <div className="text-sm">
                              <p className="font-semibold">{report.address}</p>
                              <p className="text-gray-600">
                                 상태: {report.status}
                              </p>
                              <p className="text-gray-400 text-xs">
                                 신고시각:{" "}
                                 {new Date(
                                    report.createdAt
                                 ).toLocaleTimeString()}
                              </p>
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
