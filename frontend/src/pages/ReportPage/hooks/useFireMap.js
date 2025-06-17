import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";

export default function useFireMap() {
   const KAKAO_MAP_KEY = import.meta.env.VITE_KAKAO_MAP_KEY;
   const apiUrl = import.meta.env.VITE_API_URL;
   const navigate = useNavigate();

   const mapRef = useRef(null);
   const [map, setMap] = useState(null);
   const [reporterPos, setReporterPos] = useState(null);
   const [firePos, setFirePos] = useState(null);
   const [accuracyInfo, setAccuracyInfo] = useState("");
   const [fireAddress, setFireAddress] = useState("");
   const [reporterAddress, setReporterAddress] = useState("");
   const [token, setToken] = useState("");

   useEffect(() => {
      const script = document.createElement("script");
      script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_MAP_KEY}&autoload=false&libraries=services`;
      script.onload = () => {
         window.kakao.maps.load(() => {
            const container = document.getElementById("map");
            const kakaoMap = new window.kakao.maps.Map(container, {
               center: new window.kakao.maps.LatLng(37.5665, 126.978),
               level: 1,
            });
            mapRef.current = kakaoMap;
            setMap(kakaoMap);

            window.kakao.maps.event.addListener(
               kakaoMap,
               "center_changed",
               () => {
                  const center = kakaoMap.getCenter();
                  setFirePos(center);
               }
            );
         });
      };
      document.head.appendChild(script);
      return () => document.head.removeChild(script);
   }, [KAKAO_MAP_KEY]);

   useEffect(() => {
      const params = new URLSearchParams(window.location.search);
      const tokenFromUrl = params.get("token");
      if (!tokenFromUrl) {
         alert("신고 URL에 토큰이 없습니다.");
         return;
      }

      setToken(tokenFromUrl);

      axios
         .get(`${apiUrl}/fire-report-tokens/validate/${tokenFromUrl}`)
         .then((res) => {
            if (!res.data) alert("유효하지 않은 신고 URL입니다.");
         })
         .catch(() => alert("신고 URL 검증 실패"));
   }, [apiUrl]);

   useEffect(() => {
      if (!map) return;
      navigator.geolocation.getCurrentPosition(
         (pos) => {
            const { latitude, longitude, accuracy } = pos.coords;
            const kakaoPos = new window.kakao.maps.LatLng(latitude, longitude);
            map.setCenter(kakaoPos);
            setReporterPos(kakaoPos);
            setFirePos(kakaoPos);
            setAccuracyInfo(`위치 정확도: 약 ${Math.round(accuracy)}m`);

            new window.kakao.maps.Marker({
               map,
               position: kakaoPos,
               title: "신고자 위치",
               //    image: new window.kakao.maps.MarkerImage(
               //       "data:image/svg+xml;base64," +
               //          btoa(
               //             `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12"><circle cx="6" cy="6" r="5" fill="lime" stroke="green" stroke-width="1"/></svg>`
               //          ),
               //       new window.kakao.maps.Size(12, 12),
               //       { offset: new window.kakao.maps.Point(6, 6) }
               //    ),
               image: new window.kakao.maps.MarkerImage(
                  "/reporter-marker.svg", // public 폴더 기준 경로
                  new window.kakao.maps.Size(46, 46),
                  { offset: new window.kakao.maps.Point(23, 46) }
               ),
            });
         },
         () => alert("위치 정보를 가져올 수 없습니다.")
      );
   }, [map]);

   //    useEffect(() => {
   //       if (!map || !firePos) return;

   //       const overlay = new window.kakao.maps.CustomOverlay({
   //          position: firePos,
   //          content: '<div class="fire-marker"></div>',
   //          yAnchor: 0.5,
   //          zIndex: 10,
   //       });
   //       overlay.setMap(map);
   //       return () => overlay.setMap(null);
   //    }, [map, firePos]);
   useEffect(() => {
      if (!map || !firePos) return;

      const fireMarker = new window.kakao.maps.Marker({
         map,
         position: firePos,
         title: "화재 위치",
         image: new window.kakao.maps.MarkerImage(
            "/fire-marker.svg",
            new window.kakao.maps.Size(46, 46),
            { offset: new window.kakao.maps.Point(23, 46) }
         ),
      });

      return () => fireMarker.setMap(null); // 마커 클린업
   }, [map, firePos]);

   useEffect(() => {
      if (!reporterPos || !window.kakao?.maps?.services) return;
      const geocoder = new window.kakao.maps.services.Geocoder();
      geocoder.coord2Address(
         reporterPos.getLng(),
         reporterPos.getLat(),
         (result, status) => {
            const address =
               result[0]?.address?.address_name || "주소 정보 없음";
            setAccuracyInfo((prev) => prev + ` / 주소: ${address}`);
            setReporterAddress(address);
         }
      );
   }, [reporterPos]);

   useEffect(() => {
      if (!firePos || !window.kakao?.maps?.services) return;
      const geocoder = new window.kakao.maps.services.Geocoder();
      geocoder.coord2Address(
         firePos.getLng(),
         firePos.getLat(),
         (result, status) => {
            setFireAddress(
               result[0]?.address?.address_name || "주소 정보 없음"
            );
         }
      );
   }, [firePos]);

   const refreshLocation = () => {
      navigator.geolocation.getCurrentPosition(
         (pos) => {
            const posLatLng = new window.kakao.maps.LatLng(
               pos.coords.latitude,
               pos.coords.longitude
            );
            map.setCenter(posLatLng);
            setReporterPos(posLatLng);
            setFirePos(posLatLng);
            setAccuracyInfo(
               `위치 정확도: 약 ${Math.round(pos.coords.accuracy)}m`
            );
         },
         () => alert("위치 정보를 가져올 수 없습니다.")
      );
   };

   const handleSubmit = async () => {
      const payload = {
         reportedId: token,
         fireLat: firePos.getLat(),
         fireLng: firePos.getLng(),
         fireAddress: fireAddress,
         reporterLat: reporterPos.getLat(),
         reporterLng: reporterPos.getLng(),
         reporterAddress: reporterAddress,
         status: "REPORTED",
         reportedAt: dayjs().format("YYYY-MM-DD[T]HH:mm:ss"),
         dispatchedAt: null,
         resolvedAt: null,
      };

      try {
         await axios.post(`${apiUrl}/fire-reports`, payload);
         alert("신고 위치가 전송되었습니다!");
         navigate("/chatbot");
      } catch (error) {
         alert("신고 전송에 실패했습니다.");
         console.error("신고 전송 실패:", error);
      }
   };

   return {
      reporterPos,
      firePos,
      fireAddress,
      reporterAddress,
      accuracyInfo,
      refreshLocation,
      handleSubmit,
   };
}
