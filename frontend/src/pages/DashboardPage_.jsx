// DashboardPage.jsx
import { useEffect, useState } from "react";
import axios from "axios";

function DashboardPage() {
   const [reports, setReports] = useState([]);
   const [selectedReport, setSelectedReport] = useState(null);
   const [generatedUrl, setGeneratedUrl] = useState("");
   const [fireStations, setFireStations] = useState([]);
   const apiUrl = import.meta.env.VITE_API_URL;

   useEffect(() => {
      const fetchReports = async () => {
         try {
            const response = await axios.get(`${apiUrl}/fire-reports`);
            setReports(response.data);
         } catch (error) {
            console.error("❌ 신고 목록 불러오기 실패", error);
         }
      };

      const fetchFireStations = async () => {
         try {
            const response = await axios.get(`${apiUrl}/fire-stations`);
            setFireStations(response.data);
         } catch (error) {
            console.error("❌ 소방서 정보 불러오기 실패", error);
         }
      };

      fetchReports();
      fetchFireStations();
   }, [apiUrl]);

   const generateReportUrl = async () => {
      try {
         const response = await axios.post(
            `${apiUrl}/fire-report-tokens/create`
         );
         const token = response.data;
         const url = `${window.location.origin}/report?token=${token}`;
         setGeneratedUrl(url);
         console.log(url);
      } catch (error) {
         alert("❌ 신고 URL 생성 실패");
         console.error(error);
      }
   };

   const copyToClipboard = () => {
      if (generatedUrl) {
         navigator.clipboard.writeText(generatedUrl).then(() => {
            alert("URL이 클립보드에 복사되었습니다.");
         });
      }
   };

   const handleDispatch = async (reportToken, fireStationId) => {
      console.log("handleDispatch 호출", reportToken, fireStationId);
      try {
         if (!reportToken || !fireStationId) {
            alert("토큰 또는 소방서 ID가 없습니다.");
            return;
         }

         console.log("출동 요청:", reportToken, fireStationId);

         const response = await axios.post(`${apiUrl}/fire-dispatches`, {
            reportToken,
            fireStationId,
            status: "DISPATCHED",
         });

         const createdDispatch = response.data;

         // 여기서 dispatchId를 포함해서 URL 생성
         const url = `${window.location.origin}/firefighter?token=${reportToken}&fireStationId=${fireStationId}&dispatchId=${createdDispatch.id}`;

         alert(`🚒 소방관 URL 생성됨:\n${url}`);
         console.log("🚀 출동 URL:", url);

         setReports((prev) =>
            prev.map((r) =>
               r.id === selectedReport?.id ? { ...r, status: "dispatched" } : r
            )
         );

         setSelectedReport((prev) =>
            prev ? { ...prev, status: "dispatched" } : prev
         );
      } catch (error) {
         alert("❌ 출동 지시 실패");
         console.error("🚨 출동 지시 에러:", error.response || error);
      }
   };

   function translateStatus(status) {
      switch (status?.toLowerCase()) {
         case "reported":
            return "신고 접수됨";
         case "dispatched":
            return "출동 지시됨";
         case "en_route":
            return "진입 중";
         case "suppressing":
            return "진압 중";
         case "additional_support":
            return "추가 지원 요청됨";
         case "suppression_completed":
            return "진압 완료";
         case "site_recovery":
            return "현장 복구 중";
         case "resolved":
            return "종료";
         default:
            return "신고 접수됨";
      }
   }

   function getSortedStationsByDistance(fireLat, fireLng) {
      const R = 6371;
      return fireStations
         .map((station) => {
            const dLat = (station.latitude - fireLat) * (Math.PI / 180);
            const dLng = (station.longitude - fireLng) * (Math.PI / 180);
            const a =
               Math.sin(dLat / 2) ** 2 +
               Math.cos(fireLat * (Math.PI / 180)) *
                  Math.cos(station.latitude * (Math.PI / 180)) *
                  Math.sin(dLng / 2) ** 2;
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            const distance = R * c;
            return { ...station, distance };
         })
         .sort((a, b) => a.distance - b.distance);
   }

   return (
      <div className="p-4">
         <h2 className="text-2xl font-bold mb-4">📋 화재 신고 대시보드</h2>

         <div className="mb-4">
            <button
               onClick={generateReportUrl}
               className="text-white bg-blue-700 hover:bg-blue-800 font-medium rounded-lg text-sm px-5 py-2.5"
            >
               신고 URL 생성
            </button>

            {generatedUrl && (
               <div className="mt-2">
                  <label className="block mb-1">생성된 URL</label>
                  <input
                     type="text"
                     readOnly
                     value={generatedUrl}
                     className="w-full px-4 py-2 bg-gray-100 rounded-full text-sm border"
                  />
                  <button
                     onClick={copyToClipboard}
                     className="mt-1 px-3 py-2 text-xs text-white bg-blue-700 rounded-lg hover:bg-blue-800"
                  >
                     복사
                  </button>
               </div>
            )}
         </div>

         <table className="min-w-full text-left text-sm font-light">
            <thead className="border-b bg-neutral-50 font-medium dark:border-neutral-500 dark:text-neutral-800">
               <tr>
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">신고자 위도</th>
                  <th className="px-6 py-4">신고자 경도</th>
                  <th className="px-6 py-4">신고자 주소</th>
                  <th className="px-6 py-4">화재 위도</th>
                  <th className="px-6 py-4">화재 경도</th>
                  <th className="px-6 py-4">화재 주소</th>
                  <th className="px-6 py-4">시간</th>
                  <th className="px-6 py-4">상태</th>
                  <th className="px-6 py-4">상세보기</th>
               </tr>
            </thead>
            <tbody>
               {reports.map((report) => (
                  <tr key={report.id} className="border-b">
                     <td className="px-6 py-4">{report.id}</td>
                     <td className="px-6 py-4">
                        {report.reporterLat.toFixed(4)}
                     </td>
                     <td className="px-6 py-4">
                        {report.reporterLng.toFixed(4)}
                     </td>
                     <td className="px-6 py-4">
                        {report.reporterAddress || "-"}
                     </td>
                     <td className="px-6 py-4">{report.fireLat.toFixed(4)}</td>
                     <td className="px-6 py-4">{report.fireLng.toFixed(4)}</td>
                     <td className="px-6 py-4">{report.fireAddress || "-"}</td>
                     <td className="px-6 py-4">
                        {new Date(report.reportedAt).toLocaleString()}
                     </td>
                     <td className="px-6 py-4">
                        {translateStatus(report.status)}
                     </td>
                     <td className="px-6 py-4">
                        <button
                           className="text-blue-600 hover:underline"
                           onClick={() => setSelectedReport(report)}
                        >
                           상세보기
                        </button>
                     </td>
                  </tr>
               ))}
            </tbody>
         </table>

         {selectedReport && (
            <div className="mt-8">
               <h3 className="text-xl font-semibold mb-2">
                  🗺️ 신고 위치 지도 보기 (ID: {selectedReport.id})
               </h3>
               <p>
                  🔑 <strong>토큰 :</strong>
                  <code>{selectedReport?.token ?? "없음"}</code>
               </p>
               <MapPreview
                  reporterLat={selectedReport.reporterLat}
                  reporterLng={selectedReport.reporterLng}
                  fireLat={selectedReport.fireLat}
                  fireLng={selectedReport.fireLng}
               />

               <h4 className="text-lg font-semibold mt-4 mb-2">
                  🚒 가까운 소방서 목록
               </h4>
               <table className="min-w-full text-left text-sm border">
                  <thead>
                     <tr>
                        <th className="px-4 py-2">센터명</th>
                        <th className="px-4 py-2">주소</th>
                        <th className="px-4 py-2">전화번호</th>
                        <th className="px-4 py-2">거리 (km)</th>
                        <th className="px-4 py-2">출동 지시</th>
                     </tr>
                  </thead>
                  <tbody>
                     {getSortedStationsByDistance(
                        selectedReport.fireLat,
                        selectedReport.fireLng
                     )
                        .slice(0, 5)
                        .map((station) => (
                           <tr
                              key={station.id || station.centerName}
                              className="border-t"
                           >
                              <td className="px-4 py-2">
                                 {station.centerName}
                              </td>
                              <td className="px-4 py-2">{station.address}</td>
                              <td className="px-4 py-2">{station.phone}</td>
                              <td className="px-4 py-2">
                                 {station.distance.toFixed(2)}
                              </td>
                              <td className="px-4 py-2">
                                 <button
                                    className="px-3 py-1 text-sm rounded bg-green-500 text-white hover:bg-green-600"
                                    onClick={() => {
                                       console.log("📌 station:", station);
                                       console.log(
                                          "📌 station.id:",
                                          station?.id
                                       );
                                       console.log(
                                          "📌 reportToken:",
                                          selectedReport?.token
                                       );
                                       selectedReport?.token &&
                                          handleDispatch(
                                             selectedReport.token,
                                             station.id
                                          );
                                    }}
                                 >
                                    출동 지시
                                 </button>
                              </td>
                           </tr>
                        ))}
                  </tbody>
               </table>
            </div>
         )}
      </div>
   );
}

function MapPreview({ reporterLat, reporterLng, fireLat, fireLng }) {
   useEffect(() => {
      const script = document.createElement("script");
      script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${
         import.meta.env.VITE_KAKAO_MAP_KEY
      }&autoload=false`;
      script.async = true;
      script.onload = () => {
         window.kakao.maps.load(() => {
            const container = document.getElementById("map");
            const options = {
               center: new window.kakao.maps.LatLng(
                  (reporterLat + fireLat) / 2,
                  (reporterLng + fireLng) / 2
               ),
               level: 7,
            };
            const map = new window.kakao.maps.Map(container, options);

            const reporterPos = new window.kakao.maps.LatLng(
               reporterLat,
               reporterLng
            );
            const firePos = new window.kakao.maps.LatLng(fireLat, fireLng);

            // 신고자 마커
            new window.kakao.maps.Marker({
               map,
               position: reporterPos,
               title: "신고자 위치",
               image: new window.kakao.maps.MarkerImage(
                  "data:image/svg+xml;base64," +
                     btoa(`
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12">
      <circle cx="6" cy="6" r="5" fill="lime" stroke="green" stroke-width="1" />
    </svg>
            `),
                  new window.kakao.maps.Size(12, 12),
                  { offset: new window.kakao.maps.Point(6, 6) }
               ),
            });

            // 화재 위치 마커
            const fireOverlay = new window.kakao.maps.CustomOverlay({
               position: firePos,
               content: '<div class="fire-marker"></div>',
               yAnchor: 0.5,
               zIndex: 10,
            });
            fireOverlay.setMap(map);

            // 두 위치를 모두 보이도록 지도 범위 조정
            const bounds = new window.kakao.maps.LatLngBounds();
            bounds.extend(reporterPos);
            bounds.extend(firePos);
            map.setBounds(bounds);
         });
      };
      document.head.appendChild(script);

      return () => {
         // 클린업: 스크립트 제거 가능
         document.head.removeChild(script);
      };
   }, [reporterLat, reporterLng, fireLat, fireLng]);

   return (
      <div
         id="map"
         style={{ width: "100%", height: "300px", borderRadius: "10px" }}
         className="mb-4"
      />
   );
}

export default DashboardPage;
