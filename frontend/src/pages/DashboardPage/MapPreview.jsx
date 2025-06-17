import { useEffect } from "react";

export default function MapPreview({
   reporterLat,
   reporterLng,
   fireLat,
   fireLng,
}) {
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

            // 지도 범위 조정
            const bounds = new window.kakao.maps.LatLngBounds();
            bounds.extend(reporterPos);
            bounds.extend(firePos);
            map.setBounds(bounds);
         });
      };

      document.head.appendChild(script);

      return () => {
         document.head.removeChild(script);
      };
   }, [reporterLat, reporterLng, fireLat, fireLng]);

   return (
      <div id="map" className="w-full h-full rounded-xl border min-h-[500px]" />
   );
}
