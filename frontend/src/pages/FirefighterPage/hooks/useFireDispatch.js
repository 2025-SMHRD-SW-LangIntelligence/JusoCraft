import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";

export default function useFireDispatch(token, fireStationId) {
  const [searchParams] = useSearchParams();
  const dispatchId = searchParams.get("dispatchId");

  const apiUrl = import.meta.env.VITE_API_URL;
  const kakaoMapKey = import.meta.env.VITE_KAKAO_MAP_KEY;
  const kakaoRestKey = import.meta.env.VITE_KAKAO_MAP_REST_KEY;

  const [report, setReport] = useState(undefined);
  const [fireStation, setFireStation] = useState(undefined);
  const [hydrants, setHydrants] = useState([]);
  const [mapContainerId] = useState("firefighter-map");
  const [polylines, setPolylines] = useState([]);

  const [statusSelectVisible, setStatusSelectVisible] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("");

  const toggleStatusSelect = () => setStatusSelectVisible((v) => !v);
  const handleStatusChange = (e) => setSelectedStatus(e.target.value);
  const refreshMapData = () => {
    setReport((prev) => ({ ...prev }));
  };

  const handleSubmitStatus = () => {
    if (!selectedStatus || !dispatchId)
      return alert("상태와 Dispatch ID를 확인하세요.");

    axios
      .put(`${apiUrl}/fire-dispatches/${dispatchId}/status`, null, {
        params: { status: selectedStatus },
      })
      .then((res) => {
        alert("상태 업데이트 완료");
        setReport(res.data);
      })
      .catch(() => alert("상태 업데이트 실패"));
  };

  const getDistance = (lat1, lng1, lat2, lng2) => {
    const toRad = (deg) => (deg * Math.PI) / 180;
    const R = 6371e3;
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const getTrafficColor = (state) => {
    switch (state) {
      case 1:
        return "#24c015";
      case 2:
        return "#FFFF00";
      case 3:
        return "#FFA500";
      case 4:
        return "#FF0000";
      default:
        return "#24c015";
    }
  };

  useEffect(() => {
    if (!token) return;
    axios
      .get(`${apiUrl}/fire-reports/by-token/${token}`)
      .then((res) => setReport(res.data))
      .catch(() => setReport(null));
  }, [token]);

  useEffect(() => {
    if (!fireStationId) return;
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

  useEffect(() => {
    if (!report || !fireStation || !hydrants.length) return;

    const script = document.createElement("script");
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${kakaoMapKey}&autoload=false`;
    script.async = true;
    script.onload = () => {
      window.kakao.maps.load(async () => {
        const fireLatLng = new kakao.maps.LatLng(
          report.fireLat,
          report.fireLng
        );
        const reporterLatLng = new kakao.maps.LatLng(
          report.reporterLat,
          report.reporterLng
        );
        const stationLatLng = new kakao.maps.LatLng(
          fireStation.latitude,
          fireStation.longitude
        );

        const mapInstance = new kakao.maps.Map(
          document.getElementById(mapContainerId),
          {
            center: fireLatLng,
            level: 3,
          }
        );

        const hydrantZIndex = 1;
        const markerZIndex = 2;

        const createImageMarker = (
          lat,
          lng,
          imagePath,
          size = 40,
          zIndex = 1
        ) => {
          return new kakao.maps.Marker({
            map: mapInstance,
            position: new kakao.maps.LatLng(lat, lng),
            image: new kakao.maps.MarkerImage(
              imagePath,
              new kakao.maps.Size(size, size),
              { offset: new kakao.maps.Point(size / 2, size) }
            ),
            zIndex: zIndex,
          });
        };

        createImageMarker(
          report.fireLat,
          report.fireLng,
          "/fire-marker.svg",
          46,
          markerZIndex
        );
        createImageMarker(
          report.reporterLat,
          report.reporterLng,
          "/reporter-marker.svg",
          46,
          markerZIndex
        );
        createImageMarker(
          fireStation.latitude,
          fireStation.longitude,
          "/firefighter-marker.svg",
          44,
          markerZIndex
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

        // nearbyHydrants.forEach((h) =>
        //   createImageMarker(
        //     h.lat,
        //     h.lng,
        //     "/hydrant-marker.svg",
        //     24,
        //     hydrantZIndex
        //   )
        // );

        nearbyHydrants.forEach((h) => {
          const marker = createImageMarker(
            h.lat,
            h.lng,
            "/hydrant-marker.svg",
            24,
            hydrantZIndex
          );

          const infoContent = `
    <div style="padding:5px; font-size:14px; white-space:nowrap;">
      <p><strong>상세위치:</strong> ${h.detailLocation || "정보 없음"}</p>
      <p><strong>출수압력:</strong> ${h.pressure || "정보 없음"} kPa</p>
    </div>
  `;

          const infoWindow = new kakao.maps.InfoWindow({
            content: infoContent,
            zIndex: 3,
          });

          kakao.maps.event.addListener(marker, "mouseover", () => {
            infoWindow.open(mapInstance, marker);
          });

          kakao.maps.event.addListener(marker, "mouseout", () => {
            infoWindow.close();
          });
        });

        //         const infoContent = `
        //   <div style="padding:5px; font-size:14px;">
        //     <strong>📍 상세위치:</strong> ${h.detailLocation || "정보 없음"}<br/>
        //     <strong>💧 출수압력:</strong> ${h.pressure || "정보 없음"} kPa
        //   </div>
        // `;
        //         // const infowindow = new kakao.maps.InfoWindow({
        //         //   content: infoContent,
        //         // });

        //         // 🔁 마우스 오버/아웃 이벤트로 변경
        //         kakao.maps.event.addListener(marker, "mouseover", () => {
        //           infowindow.open(mapInstance, marker);
        //         });

        //         kakao.maps.event.addListener(marker, "mouseout", () => {
        //           infowindow.close();
        //         });
        //       });

        const routeUrl = `https://apis-navi.kakaomobility.com/v1/directions`;

        const params = new URLSearchParams({
          origin: `${fireStation.longitude},${fireStation.latitude}`,
          destination: `${report.fireLng},${report.fireLat}`,
          priority: "RECOMMEND",
          car_type: 5,
        });

        const res = await axios.get(`${routeUrl}?${params.toString()}`, {
          headers: { Authorization: `KakaoAK ${kakaoRestKey}` },
        });

        polylines.forEach((pl) => pl.setMap(null));
        const newPolylines = [];
        const bounds = new kakao.maps.LatLngBounds();
        bounds.extend(fireLatLng);
        bounds.extend(reporterLatLng);
        bounds.extend(stationLatLng);

        res.data.routes?.[0]?.sections?.forEach((sec) => {
          sec.roads.forEach((road) => {
            const vertices = road.vertexes;
            const traffic = road.traffic_state;
            const color = getTrafficColor(traffic);

            const path = [];
            for (let i = 0; i < vertices.length; i += 2) {
              const latLng = new kakao.maps.LatLng(
                vertices[i + 1],
                vertices[i]
              );
              path.push(latLng);
              bounds.extend(latLng);
            }

            if (path.length > 0 && newPolylines.length === 0) {
              path.unshift(stationLatLng);
            }

            if (
              path.length > 0 &&
              sec === res.data.routes[0].sections.at(-1) &&
              road === sec.roads.at(-1)
            ) {
              path.push(fireLatLng);
            }

            const polyline = new kakao.maps.Polyline({
              map: mapInstance,
              path,
              strokeWeight: 5,
              strokeColor: color,
              strokeOpacity: 1,
              strokeStyle: "solid",
            });

            newPolylines.push(polyline);
          });
        });

        mapInstance.setBounds(bounds);
        setPolylines(newPolylines);
      });
    };

    document.head.appendChild(script);
    return () => {
      document.head.removeChild(script);
      polylines.forEach((pl) => pl.setMap(null));
    };
  }, [report, fireStation, hydrants]);

  return {
    report,
    fireStation,
    hydrants,
    mapContainerId,
    statusSelectVisible,
    toggleStatusSelect,
    selectedStatus,
    handleStatusChange,
    handleSubmitStatus,
    refreshMapData,
  };
}
