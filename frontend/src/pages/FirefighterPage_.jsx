import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";

// FireReportStatus 값은 enum으로 백엔드와 일치하게
const STATUS_OPTIONS = [
   { value: "RECEIVED", label: "접수" },
   { value: "DISPATCHED", label: "출동" },
   { value: "ARRIVED", label: "도착" },
   { value: "INITIAL_SUPPRESSION", label: "초진" },
   { value: "OVERHAUL", label: "잔불정리" },
   { value: "FULLY_SUPPRESSED", label: "완진" },
   { value: "WITHDRAWN", label: "철수" },
   { value: "MONITORING", label: "잔불감시" },
];

function FirefighterPage() {
   const [searchParams] = useSearchParams();
   const token = searchParams.get("token");
   const fireStationId = searchParams.get("fireStationId");
   // 상태 업데이트
   const dispatchId = searchParams.get("dispatchId"); // URL에서 추출
   const [statusSelectVisible, setStatusSelectVisible] = useState(false);
   const [selectedStatus, setSelectedStatus] = useState("");

   // 렌더링 조건 및 에러 메시지 처리 (최상단에 위치)
   if (!token) return <p>❗ token 파라미터가 없습니다.</p>;
   if (!fireStationId) return <p>❗ fireStationId 파라미터가 없습니다.</p>;

   const apiUrl = import.meta.env.VITE_API_URL;
   const kakaoMapKey = import.meta.env.VITE_KAKAO_MAP_KEY;
   const kakaoRestKey = import.meta.env.VITE_KAKAO_MAP_REST_KEY;

   const [report, setReport] = useState({ status: "DISPATCHED" });
   const [hydrants, setHydrants] = useState([]);
   const [waterStorages, setWaterStorages] = useState([]);
   const [fireStation, setFireStation] = useState(undefined);
   const [map, setMap] = useState(null);
   const [polyline, setPolyline] = useState(null);

   const handleStatusChange = (e) => {
      setSelectedStatus(e.target.value);
   };

   const handleSubmitStatus = () => {
      if (!selectedStatus || !dispatchId) {
         console.warn("필수 값 누락", { selectedStatus, dispatchId });
         alert("상태와 Dispatch ID를 모두 선택하세요.");
         return;
      }

      console.log("상태 업데이트 요청 전송", { selectedStatus, dispatchId });

      axios
          .put(`${apiUrl}/fire-dispatches/${dispatchId}/status`, null, {
             params: { status: selectedStatus },
          })
          .then((res) => {
             console.log("업데이트 성공 응답", res.data);
             setReport(res.data);
             alert("상태가 성공적으로 업데이트되었습니다.");
          })
          .catch((err) => {
             console.error("상태 업데이트 실패", err);
             alert("상태 업데이트 실패!");
          });
   };

   useEffect(() => {
      const id = searchParams.get("dispatchId");
      console.log("URL에서 추출한 dispatchId:", id);
   }, []);

   const getDistance = (lat1, lng1, lat2, lng2) => {
      const toRad = (deg) => (deg * Math.PI) / 180;
      const R = 6371e3;
      const deltaLat = toRad(lat2 - lat1);
      const deltaLng = toRad(lng2 - lng1);
      const a =
          Math.sin(deltaLat / 2) ** 2 +
          Math.cos(toRad(lat1)) *
          Math.cos(toRad(lat2)) *
          Math.sin(deltaLng / 2) ** 2;
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
   };

   /* ---------------- 데이터 로딩 ---------------- */

   useEffect(() => {
      if (!token) return;
      setReport(undefined); // 로딩 상태로 설정
      axios
          .get(`${apiUrl}/fire-reports/by-token/${token}`)
          .then((res) => setReport(res.data))
          .catch(() => setReport(null));
   }, [token]);

   useEffect(() => {
      if (!fireStationId) return;
      setFireStation(undefined);
      axios
          .get(`${apiUrl}/fire-stations/${fireStationId}`)
          .then((res) => setFireStation(res.data))
          .catch(() => setFireStation(null));
   }, [fireStationId]);

   useEffect(() => {
      axios
          .get(`${apiUrl}/hydrants`)
          .then((res) => setHydrants(res.data))
          .catch(() => setHydrants([]));
   }, []);

   useEffect(() => {                                      // 저수지/댐 로딩
      axios
          .get(`${apiUrl}/water-storage`)
          .then((res) => setWaterStorages(res.data))
          .catch(() => setWaterStorages([]));
   }, []);

   /* ---------------- Kakao Map ---------------- */

   useEffect(() => {
      // [수정] waterStorages도 준비돼야 실행
      if (!report || !fireStation || !waterStorages.length) return;

      const script = document.createElement("script");
      script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${kakaoMapKey}&autoload=false`;
      script.async = true;

      script.onload = () => {
         window.kakao.maps.load(async () => {
            const container = document.getElementById("firefighter-map");
            const kakao = window.kakao;

            const mapInstance = new kakao.maps.Map(container, {
               center: new kakao.maps.LatLng(report.fireLat, report.fireLng),
               level: 3,
            });
            setMap(mapInstance);
            mapInstance.addOverlayMapTypeId(kakao.maps.MapTypeId.TRAFFIC);

            const bounds = new kakao.maps.LatLngBounds();
            const extend = (lat, lng) =>
                bounds.extend(new kakao.maps.LatLng(lat, lng));

            const createCircleMarker = (lat, lng, color, size = 12) => {
               extend(lat, lng);
               return new kakao.maps.Marker({
                  map: mapInstance,
                  position: new kakao.maps.LatLng(lat, lng),
                  image: new kakao.maps.MarkerImage(
                      "data:image/svg+xml;base64," +
                      btoa(`
                  <svg xmlns='http://www.w3.org/2000/svg' width='${size}' height='${size}'>
                    <circle cx='${size / 2}' cy='${size / 2}' r='${
                          size / 2
                      }' fill='${color}' />
                  </svg>`),
                      new kakao.maps.Size(size, size),
                      { offset: new kakao.maps.Point(size / 2, size / 2) }
                  ),
               });
            };

            /* 기본 마커 */
            createCircleMarker(report.fireLat, report.fireLng, "orange", 16);
            createCircleMarker(report.reporterLat, report.reporterLng, "lime");
            createCircleMarker(
                fireStation.latitude,
                fireStation.longitude,
                "red",
                14
            );

            /* 소화전 (반경 500 m) */
            const nearbyHydrants = hydrants.filter((h) => {
               const d = getDistance(
                   report.fireLat,
                   report.fireLng,
                   h.lat,
                   h.lng
               );
               return d <= 500;
            });
            nearbyHydrants.forEach((h) =>
                createCircleMarker(h.lat, h.lng, "#28f5ff")
            );

            /* 저수지/댐 – 1km*/
            waterStorages.forEach((ws) => {
               const lat = Number(ws.latitude);
               const lng = Number(ws.longitude);
               if (Number.isNaN(lat) || Number.isNaN(lng)) return;
               createCircleMarker(lat, lng, "#00bfff", 14);
            });

            mapInstance.setBounds(bounds);


         });
      };

      document.head.appendChild(script);
      return () => {
         document.head.removeChild(script);
         if (polyline) polyline.setMap(null);
      };
   }, [report, fireStation, hydrants, waterStorages]);

   /* ------------ 로딩/에러 처리 & JSX ------------- */

   if (report === undefined || fireStation === undefined)
      return <p>데이터 불러오는 중...</p>;
   if (report === null) return <p>❌ 신고 데이터를 불러오지 못했습니다.</p>;
   if (fireStation === null)
      return <p>❌ 소방서 데이터를 불러오지 못했습니다.</p>;
   if (!waterStorages.length)
      return <p>❌ 저수지/댐 데이터를 불러오지 못했습니다.</p>;

   return (
       <div>
          <h2>🚒 소방관 출동 화면</h2>
          {}
          <div
              id="firefighter-map"
              style={{ width: "100%", height: "400px", border: "1px solid #ccc" }}
          ></div>

          {/* 상태 보고 UI ••• */}
       </div>
   );
}

export default FirefighterPage;
