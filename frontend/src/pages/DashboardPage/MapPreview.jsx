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

                // 신고자 마커 이미지 설정
                const reporterMarkerImage = new window.kakao.maps.MarkerImage(
                    "/reporter-marker.svg",
                    new window.kakao.maps.Size(32, 32),
                    { offset: new window.kakao.maps.Point(16, 16) }
                );

                new window.kakao.maps.Marker({
                    map,
                    position: reporterPos,
                    title: "신고자 위치",
                    image: reporterMarkerImage,
                });

                // 화재 위치 마커 이미지 설정
                const fireMarkerImage = new window.kakao.maps.MarkerImage(
                    "/fire-marker.svg",
                    new window.kakao.maps.Size(32, 32),
                    { offset: new window.kakao.maps.Point(16, 16) }
                );

                new window.kakao.maps.Marker({
                    map,
                    position: firePos,
                    title: "화재 위치",
                    image: fireMarkerImage,
                });

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
        <div
            id="map"
            className="w-full h-full rounded-xl border min-h-[500px]"
        />
    );
}
