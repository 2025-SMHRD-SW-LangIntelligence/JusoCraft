import { useEffect, useRef, useState } from "react";
import axios from "axios";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";

function FireMap() {
   const navigate = useNavigate();

   const KAKAO_MAP_KEY = import.meta.env.VITE_KAKAO_MAP_KEY;
   const apiUrl = import.meta.env.VITE_API_URL;

   const mapRef = useRef(null);
   const [map, setMap] = useState(null);
   const [reporterPos, setReporterPos] = useState(null);
   const [firePos, setFirePos] = useState(null);
   const [centerPos, setCenterPos] = useState(null);
   const [accuracyInfo, setAccuracyInfo] = useState("");
   const [token, setToken] = useState("");
   const [reporterAddress, setReporterAddress] = useState("");
   const [fireAddress, setFireAddress] = useState("");
   const [kakaoReady, setKakaoReady] = useState(false);

   useEffect(() => {
      const params = new URLSearchParams(window.location.search);
      const tokenFromUrl = params.get("token") || "";
      setToken(tokenFromUrl);

      if (tokenFromUrl) {
         axios
            .get(`${apiUrl}/fire-report-tokens/validate/${tokenFromUrl}`)
            .then((res) => {
               if (!res.data) {
                  alert("유효하지 않은 신고 URL입니다.");
               }
            })
            .catch(() => {
               alert("신고 URL 검증 중 오류 발생");
            });
      } else {
         alert("신고 URL에 토큰이 없습니다.");
      }
   }, [apiUrl]);

   useEffect(() => {
      const script = document.createElement("script");
      script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_MAP_KEY}&autoload=false&libraries=services`;
      script.async = true;

      script.onload = () => {
         window.kakao.maps.load(() => {
            const container = document.getElementById("map");
            const options = {
               center: new window.kakao.maps.LatLng(37.5665, 126.978),
               level: 1,
            };
            const kakaoMap = new window.kakao.maps.Map(container, options);
            mapRef.current = kakaoMap;
            setMap(kakaoMap);

            window.kakao.maps.event.addListener(
               kakaoMap,
               "center_changed",
               () => {
                  const center = kakaoMap.getCenter();
                  setCenterPos(center);
                  setFirePos(center); // firePos를 지도 중심으로 계속 업데이트
               }
            );

            setKakaoReady(true);
         });
      };

      script.onerror = () => {
         console.error("카카오맵 스크립트 로딩 실패");
      };

      document.head.appendChild(script);
      return () => {
         document.head.removeChild(script);
      };
   }, [KAKAO_MAP_KEY]);

   // 신고자 위치 가져오기, 마커 표시 및 초기 화재 위치 설정
   useEffect(() => {
      if (!map) return;

      navigator.geolocation.getCurrentPosition(
         (position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            const pos = new window.kakao.maps.LatLng(lat, lng);

            map.setCenter(pos);
            setReporterPos(pos);
            setFirePos(pos); // 초기 화재 위치를 신고자 위치와 동일하게 설정

            setAccuracyInfo(
               `위치 정확도: 약 ${Math.round(position.coords.accuracy)}m`
            );

            // 신고자 위치 마커
            new window.kakao.maps.Marker({
               map: map,
               position: pos,
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
         },
         () => {
            alert("위치 정보를 가져올 수 없습니다.");
         }
      );
   }, [map]);

   // 화재 위치 마커 (CustomOverlay) - 빨간색 pulse 마커
   useEffect(() => {
      if (!map || !firePos) return;

      // 기존 오버레이 제거를 위해 ref 사용하면 좋음 (생략 가능)
      const content = '<div class="fire-marker"></div>';
      const overlay = new window.kakao.maps.CustomOverlay({
         position: firePos,
         content: content,
         yAnchor: 0.5,
         zIndex: 10,
      });

      overlay.setMap(map);

      return () => {
         overlay.setMap(null);
      };
   }, [map, firePos]);

   const refreshLocation = () => {
      if (!navigator.geolocation) {
         alert("브라우저가 위치 정보를 지원하지 않습니다.");
         return;
      }

      navigator.geolocation.getCurrentPosition(
         (position) => {
            const pos = new window.kakao.maps.LatLng(
               position.coords.latitude,
               position.coords.longitude
            );
            map.setCenter(pos);
            setReporterPos(pos);
            setFirePos(pos); // 화재 위치도 같이 초기화
            setAccuracyInfo(
               `위치 정확도: 약 ${Math.round(position.coords.accuracy)}m`
            );
         },
         () => {
            alert("위치 정보를 다시 가져올 수 없습니다.");
         }
      );
   };

   // 신고자 위치 역지오코딩
   useEffect(() => {
      if (!reporterPos) return;
      if (!window.kakao || !window.kakao.maps || !window.kakao.maps.services)
         return;

      const geocoder = new window.kakao.maps.services.Geocoder();

      geocoder.coord2Address(
         reporterPos.getLng(),
         reporterPos.getLat(),
         (result, status) => {
            if (status === window.kakao.maps.services.Status.OK) {
               const address =
                  result[0]?.address?.address_name || "주소 정보 없음";
               setAccuracyInfo((prev) => prev + ` / 주소: ${address}`);
               setReporterAddress(address);
            } else {
               setAccuracyInfo((prev) => prev + " / 주소 정보 조회 실패");
               setReporterAddress("");
            }
         }
      );
   }, [reporterPos]);

   // 화재 위치 주소 역지오코딩
   useEffect(() => {
      if (!kakaoReady || !firePos) return;

      const geocoder = new window.kakao.maps.services.Geocoder();

      geocoder.coord2Address(
         firePos.getLng(),
         firePos.getLat(),
         (result, status) => {
            if (status === window.kakao.maps.services.Status.OK) {
               const address =
                  result[0]?.address?.address_name || "주소 정보 없음";
               setFireAddress(address);
            } else {
               setFireAddress("주소 정보 조회 실패");
            }
         }
      );
   }, [firePos, kakaoReady]);

   const handleSubmit = async () => {
      if (!map || !reporterPos || !firePos) {
         alert("지도와 위치 정보를 모두 확인해주세요.");
         return;
      }

      if (!token) {
         alert("유효하지 않은 신고 URL입니다.");
         return;
      }

      const payload = {
         reportedId: token,
         fireLat: firePos.getLat(),
         fireLng: firePos.getLng(),
         fireAddress: fireAddress || "주소 미입력",
         reporterLat: reporterPos.getLat(),
         reporterLng: reporterPos.getLng(),
         reporterAddress: reporterAddress || "주소 미입력",
         status: "REPORTED",
         reportedAt: dayjs().format("YYYY-MM-DD[T]HH:mm:ss"),
         dispatchedAt: null,
         resolvedAt: null,
      };

      try {
         const response = await axios.post(`${apiUrl}/fire-reports`, payload);
         console.log("✅ 서버 응답:", response.data);
         alert("신고 위치가 전송되었습니다!");

         // 전송 성공 후 ChatBotPage로 이동
         navigate("/chatbot");
      } catch (error) {
         console.error(
            "❌ 신고 전송 실패:",
            error.response?.data || error.message
         );
         alert("신고 전송에 실패했습니다.");
      }
   };

   return (
      <>
         <div>
            <h2 className="hidden">📍 화재 신고 위치 선택</h2>

            <div
               id="map"
               style={{
                  width: "100vw",
                  height: "70vh",
                  position: "relative",
                  border: "1px solid #ccc",
               }}
            ></div>

            <div style={{ marginTop: "1rem" }}>
               <p>🧍‍♂️ 신고자 위치 (GPS)</p>
               {reporterPos && (
                  <p style={{ fontSize: "0.9em" }}>
                     위도: {reporterPos.getLat().toFixed(6)} / 경도:
                     {reporterPos.getLng().toFixed(6)}
                  </p>
               )}
               {accuracyInfo && (
                  <p style={{ fontSize: "0.9em", color: "gray" }}>
                     {accuracyInfo}
                  </p>
               )}
               <button
                  onClick={refreshLocation}
                  className="inline-flex items-center justify-center border align-middle select-none font-sans font-medium text-center transition-all ease-in disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed focus:shadow-none text-sm py-2 px-4 shadow-sm bg-transparent relative text-stone-700 hover:text-stone-700 border-stone-500 hover:bg-transparent duration-150 hover:border-stone-600 rounded-lg hover:opacity-60 hover:shadow-none"
               >
                  위치 새로고침
               </button>
            </div>

            <div style={{ marginTop: "1rem" }}>
               <p>🔥 화재 발생 위치 (지도 중심)</p>
               {firePos && (
                  <p style={{ fontSize: "0.9em" }}>
                     위도: {firePos.getLat().toFixed(6)} / 경도:
                     {firePos.getLng().toFixed(6)}
                  </p>
               )}
               {fireAddress && (
                  <p style={{ fontSize: "0.9em", color: "#666" }}>
                     주소: {fireAddress}
                  </p>
               )}
               <p style={{ fontSize: "0.9em", color: "#666" }}>
                  👉 지도를 움직여 화재 위치를 조정하세요.
               </p>
            </div>

            <button
               onClick={handleSubmit}
               style={{ marginTop: "1rem", padding: "0.5rem 1rem" }}
            >
               🚨 위치 전송
            </button>
         </div>
      </>
   );
}

export default FireMap;
