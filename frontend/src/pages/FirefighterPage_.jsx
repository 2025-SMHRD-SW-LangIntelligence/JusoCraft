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

   useEffect(() => {
      if (!token) return;
      setReport(undefined); // 로딩 상태로 설정
      axios
         .get(`${apiUrl}/fire-reports/by-token/${token}`)
         .then((res) => {
            console.log("🔥 신고 데이터:", res.data); // 여기 찍기
            setReport(res.data);
         })
         .catch((err) => {
            console.error("❌ 신고 데이터 불러오기 실패", err);
            setReport(null); // 에러 상태 표시
         });
   }, [token]);

   useEffect(() => {
      if (!fireStationId) return;
      setFireStation(undefined);
      axios
         .get(`${apiUrl}/fire-stations/${fireStationId}`)
         .then((res) => {
            console.log("소방서 데이터 응답:", res.data);
            setFireStation(res.data);
         })
         .catch((err) => {
            console.error("❌ 소방서 정보 불러오기 실패", err);
            setFireStation(null);
         });
   }, [fireStationId]);

   useEffect(() => {
      setHydrants([]);
      axios
         .get(`${apiUrl}/hydrants`)
         .then((res) => setHydrants(res.data))
         .catch((err) => {
            console.error("❌ 소화전 데이터 불러오기 실패", err);
            setHydrants([]);
         });
   }, []);

   useEffect(() => {
      if (!report || !fireStation || hydrants.length === 0) return;

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
            bounds.extend(
               new kakao.maps.LatLng(report.fireLat, report.fireLng)
            );
            bounds.extend(
               new kakao.maps.LatLng(report.reporterLat, report.reporterLng)
            );
            bounds.extend(
               new kakao.maps.LatLng(
                  fireStation.latitude,
                  fireStation.longitude
               )
            );
            mapInstance.setBounds(bounds);

            const createMarker = (lat, lng, title, color, size = 12) => {
               return new kakao.maps.Marker({
                  map: mapInstance,
                  position: new kakao.maps.LatLng(lat, lng),
                  title,
                  image: new kakao.maps.MarkerImage(
                     "data:image/svg+xml;base64," +
                        btoa(`
                   <svg xmlns='http://www.w3.org/2000/svg' width='${size}' height='${size}'>
                      <circle cx='${size / 2}' cy='${size / 2}' r='${
                           size / 2
                        }' fill='${color}' />
                   </svg>
                `),
                     new kakao.maps.Size(size, size),
                     { offset: new kakao.maps.Point(size / 2, size / 2) }
                  ),
               });
            };

            createMarker(
               report.fireLat,
               report.fireLng,
               "🔥 화재 위치",
               "orange",
               16
            );
            createMarker(
               report.reporterLat,
               report.reporterLng,
               "🧍‍♂️ 신고자 위치",
               "lime",
               12
            );
            createMarker(
               fireStation.latitude,
               fireStation.longitude,
               "🚒 소방서 위치",
               "red",
               14
            );

            const nearbyHydrants = hydrants.filter((h) => {
               const dist = getDistance(
                  report.fireLat,
                  report.fireLng,
                  h.lat,
                  h.lng
               );
               return dist <= 500;
            });

            nearbyHydrants.forEach((hydrant) => {
               createMarker(
                  hydrant.lat,
                  hydrant.lng,
                  `소화전\n${hydrant.address || ""}`,
                  "#28f5ff",
                  12
               );
            });

            async function fetchRoute() {
               if (nearbyHydrants.length === 0) {
                  console.warn("반경 500m 이내 소화전이 없습니다.");
                  return;
               }

               // fireStation 위치 유효성 체크
               if (
                  typeof fireStation.latitude !== "number" ||
                  typeof fireStation.longitude !== "number"
               ) {
                  console.error(
                     "❌ 소방서 위치 정보가 유효하지 않습니다:",
                     fireStation
                  );
                  return;
               }

               let closestHydrant = nearbyHydrants[0];
               let minDist = getDistance(
                  fireStation.latitude,
                  fireStation.longitude,
                  closestHydrant.lat,
                  closestHydrant.lng
               );

               nearbyHydrants.forEach((h) => {
                  const dist = getDistance(
                     fireStation.latitude,
                     fireStation.longitude,
                     h.lat,
                     h.lng
                  );
                  if (dist < minDist) {
                     minDist = dist;
                     closestHydrant = h;
                  }
               });

               try {
                  const params = new URLSearchParams({
                     origin: `${fireStation.longitude},${fireStation.latitude}`,
                     destination: `${report.fireLng},${report.fireLat}`,
                     waypoints: `${closestHydrant.lng},${closestHydrant.lat}`,
                     priority: "RECOMMEND",
                  });

                  const url = `https://apis-navi.kakaomobility.com/v1/directions?${params.toString()}`;

                  const res = await axios.get(url, {
                     headers: {
                        Authorization: `KakaoAK ${kakaoRestKey}`,
                     },
                  });

                  if (!res.data.routes?.length) {
                     console.error("경로가 없습니다.");
                     return;
                  }

                  const linePath = [];

                  res.data.routes[0].sections.forEach((section) => {
                     section.roads.forEach((road) => {
                        if (road.distance < 5) return;
                        const vtx = road.vertexes;
                        for (let i = 0; i < vtx.length; i += 2) {
                           const lng = vtx[i];
                           const lat = vtx[i + 1];
                           linePath.push(new kakao.maps.LatLng(lat, lng));
                        }
                     });
                  });

                  if (polyline) polyline.setMap(null);

                  const newPolyline = new kakao.maps.Polyline({
                     path: linePath,
                     strokeWeight: 5,
                     strokeColor: "#FF0000",
                     strokeOpacity: 0.7,
                     strokeStyle: "solid",
                  });

                  newPolyline.setMap(mapInstance);
                  setPolyline(newPolyline);
               } catch (err) {
                  console.error("🚨 경로 탐색 API 호출 실패", err);
               }
            }

            fetchRoute();
         });
      };

      document.head.appendChild(script);

      return () => {
         document.head.removeChild(script);
         if (polyline) polyline.setMap(null);
         setPolyline(null);
         setMap(null);
      };
   }, [report, fireStation, hydrants]);

   // 데이터 로딩 상태 및 에러 처리
   if (report === undefined) return <p>데이터 불러오는 중...</p>;
   if (report === null) return <p>❌ 신고 데이터를 불러오지 못했습니다.</p>;
   if (fireStation === undefined) return <p>데이터 불러오는 중...</p>;
   if (fireStation === null)
      return <p>❌ 소방서 데이터를 불러오지 못했습니다.</p>;
   if (hydrants.length === 0)
      return <p>❌ 소화전 데이터를 불러오지 못했습니다.</p>;

   return (
      <div>
         <h2>🚒 소방관 출동 화면</h2>
         <p>
            신고자 위치:
            {report.reporterLat != null && report.reporterLng != null
               ? `${report.reporterLat.toFixed(
                    6
                 )}, ${report.reporterLng.toFixed(6)}`
               : "정보 없음"}
            <br />
            신고자 주소: {report.reporterAddress || "-"}
         </p>
         <p>
            화재 위치:
            {report.fireLat != null && report.fireLng != null
               ? `${report.fireLat.toFixed(6)}, ${report.fireLng.toFixed(6)}`
               : "정보 없음"}
            <br />
            화재 주소: {report.fireAddress || "-"}
         </p>
         {fireStation && (
            <p>
               소방서 위치:
               {fireStation.latitude != null && fireStation.longitude != null
                  ? `${fireStation.latitude.toFixed(
                       6
                    )}, ${fireStation.longitude.toFixed(6)}`
                  : "정보 없음"}
               <br />
               소방서 주소: {fireStation.address || "-"}
               <br />
               소방서 이름: {fireStation.centerName || "-"}
            </p>
         )}
         <div
            id="firefighter-map"
            style={{ width: "100%", height: "400px", border: "1px solid #ccc" }}
         ></div>
         {/* <p>
            🔥 화재 상태: <strong>{report.status}</strong>
         </p> */}
         <button
            className="bg-blue-500 text-white px-3 py-1 rounded mt-3"
            onClick={() => setStatusSelectVisible(!statusSelectVisible)}
         >
            상황 보고
         </button>

         {statusSelectVisible && (
            <div className="mt-2">
               <select
                  value={selectedStatus}
                  onChange={handleStatusChange}
                  className="border px-2 py-1 rounded"
               >
                  <option value="">-- 상태 선택 --</option>
                  {STATUS_OPTIONS.map((opt) => (
                     <option key={opt.value} value={opt.value}>
                        {opt.label}
                     </option>
                  ))}
               </select>
               <button
                  className="ml-2 bg-green-500 text-white px-3 py-1 rounded"
                  onClick={handleSubmitStatus}
               >
                  제출
               </button>
            </div>
         )}
      </div>
   );
}

export default FirefighterPage;
