import { MapContainer, TileLayer, Marker, Polyline } from "react-leaflet";
import { useEffect, useState } from "react";
import axios from "axios";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import DashboardLayout from "../layouts/DashboardLayout";
import React from "react";
import { Tooltip } from "react-leaflet";

// 🔁 목적지 좌표 계산 (풍향 + 180도)
function computeDestination(lat, lon, vecDegree, distanceKm = 0.5) {
  const R = 6371;
  const bearing = ((parseFloat(vecDegree) + 180) % 360) * (Math.PI / 180);
  const lat1 = (lat * Math.PI) / 180;
  const lon1 = (lon * Math.PI) / 180;

  const lat2 = Math.asin(
    Math.sin(lat1) * Math.cos(distanceKm / R) +
      Math.cos(lat1) * Math.sin(distanceKm / R) * Math.cos(bearing)
  );
  const lon2 =
    lon1 +
    Math.atan2(
      Math.sin(bearing) * Math.sin(distanceKm / R) * Math.cos(lat1),
      Math.cos(distanceKm / R) - Math.sin(lat1) * Math.sin(lat2)
    );

  return [(lat2 * 180) / Math.PI, (lon2 * 180) / Math.PI];
}

// 🔥 화살표 아이콘
function WindArrow({ direction }) {
  const rotation = (parseFloat(direction) + 180) % 360;
  return L.divIcon({
    html: `<div style="
      transform: rotate(${rotation}deg);
      width: 160px;
      height: 60px;
      background: url('/fire_move.gif') no-repeat center / contain;
    "></div>`,
    iconSize: [160, 60],
    iconAnchor: [80, 30],
    className: "wind-arrow",
  });
}

const WindMap = () => {
  const [fires, setFires] = useState([]);
  const [selectedTime, setSelectedTime] = useState(null);

  const fetchData = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/weather`);
      console.log("✅ 백엔드 응답:", res.data);
      setFires(res.data.fires || []);

      // 가능한 시간대 추출
      const sampleFire = res.data.fires?.[0];
      if (sampleFire && sampleFire.weather) {
        const timeList = Object.keys(sampleFire.weather);
        if (timeList.length > 0 && !selectedTime) {
          setSelectedTime(timeList[0]);
        }
      }
    } catch (e) {
      console.error("날씨 데이터를 불러오는 중 오류 발생:", e);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60 * 1000); // 1분마다 갱신
    return () => clearInterval(interval);
  }, []);

  const sampleWeather = fires[0]?.weather?.[selectedTime];
  const formattedTime =
    selectedTime && selectedTime.length === 4
      ? `${selectedTime.slice(0, 2)}:${selectedTime.slice(2)}`
      : "-";

  return (
    <DashboardLayout>
      <div className="relative w-full h-[80vh]">
        {/* 시간 선택 버튼 */}
        <div
          style={{
            position: "absolute",
            top: "10px",
            left: "10px",
            zIndex: 1000,
            display: "flex",
            gap: "8px",
            flexWrap: "wrap",
            backgroundColor: "rgba(255,255,255,0.9)",
            padding: "8px 12px",
            borderRadius: "8px",
          }}
        >
          {Object.keys(sampleWeather ? fires[0].weather : {}).map((time) => (
            <button
              key={time}
              onClick={() => setSelectedTime(time)}
              style={{
                padding: "4px 8px",
                backgroundColor: selectedTime === time ? "#1d4ed8" : "#e0e7ff",
                color: selectedTime === time ? "#fff" : "#000",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "12px",
              }}
            >
              {time.slice(0, 2)}시
            </button>
          ))}
        </div>

        {/* 지도 렌더링 */}
        <MapContainer
          center={[35.1595, 126.8526]}
          zoom={13}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          />

          {fires
            .filter(
              (fire) =>
                !["FULLY_SUPPRESSED", "WITHDRAWN", "MONITORING"].includes(
                  fire.status
                )
            )
            .map((fire, idx) => {
              const lat = parseFloat(fire.lat);
              const lon = parseFloat(fire.lon);
              const weatherAtTime = fire.weather?.[selectedTime] || {};
              const vec = weatherAtTime?.VEC || "0";

              const [destLat, destLon] = computeDestination(lat, lon, vec, 0.5);

              return (
                <React.Fragment key={idx}>
                  <Marker
                    position={[lat, lon]}
                    icon={WindArrow({ direction: vec })}
                  >
                    <Tooltip
                      direction="top"
                      offset={[0, -20]}
                      opacity={1}
                      permanent={false}
                    >
                      <div style={{ fontSize: "12px", lineHeight: "1.5" }}>
                        📍<strong>{fire.address}</strong>
                        <br />
                        🌡 {weatherAtTime?.T1H || "?"}℃<br />
                        💨 {weatherAtTime?.WSD || "?"} m/s
                        <br />
                        🧭 {weatherAtTime?.VEC || "?"}°
                      </div>
                    </Tooltip>
                  </Marker>
                  <Polyline
                    positions={[
                      [lat, lon],
                      [destLat, destLon],
                    ]}
                    color="red"
                    weight={2}
                    dashArray="4"
                  />
                </React.Fragment>
              );
            })}
        </MapContainer>
      </div>
    </DashboardLayout>
  );
};

export default WindMap;
