import { MapContainer, TileLayer, Marker, Polyline } from "react-leaflet";
import { useEffect, useState } from "react";
import axios from "axios";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import DashboardLayout from "../layouts/DashboardLayout";

// 🔥 화살표 아이콘 생성 함수
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

// 🔁 풍향 기반 목적지 계산 함수
function computeDestination(lat, lon, vecDegree, distanceKm = 0.5) {
  const R = 6371; // 지구 반지름 (km)
  const correctedBearing =
    ((parseFloat(vecDegree) + 180) % 360) * (Math.PI / 180); // ✅ 풍향 + 180도

  const lat1 = (lat * Math.PI) / 180;
  const lon1 = (lon * Math.PI) / 180;

  const lat2 = Math.asin(
    Math.sin(lat1) * Math.cos(distanceKm / R) +
      Math.cos(lat1) * Math.sin(distanceKm / R) * Math.cos(correctedBearing)
  );
  const lon2 =
    lon1 +
    Math.atan2(
      Math.sin(correctedBearing) * Math.sin(distanceKm / R) * Math.cos(lat1),
      Math.cos(distanceKm / R) - Math.sin(lat1) * Math.sin(lat2)
    );

  return [(lat2 * 180) / Math.PI, (lon2 * 180) / Math.PI];
}

const WeatherMap = () => {
  const [data, setData] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);

  const fetchWeather = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/weather`);
      console.log("API data:", res.data);
      setData(res.data);

      // 기본 선택 시간 = 가장 이른 시간
      const times = Object.keys(res.data.weather);
      if (times.length > 0 && !selectedTime) {
        setSelectedTime(times[0]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchWeather();
    const interval = setInterval(fetchWeather, 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (!data || !selectedTime) return <div>날씨 데이터를 불러오는 중...</div>;

  const { weather, fires } = data;
  const selectedWeather = weather[selectedTime];

  const formattedTime = `${selectedTime.slice(0, 2)}:${selectedTime.slice(
    2,
    4
  )}`;

  return (
    <DashboardLayout>
      <div className="relative w-full h-[80vh]">
        {/* 상단 정보 표시 */}
        <div
          style={{
            position: "absolute",
            top: "10px",
            right: "10px",
            backgroundColor: "rgba(255, 255, 255, 0.9)",
            padding: "12px 16px",
            borderRadius: "8px",
            boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
            zIndex: 1000,
            fontSize: "14px",
            lineHeight: "1.5",
            minWidth: "180px",
          }}
        >
          <div>
            <strong>예보 시각:</strong> {formattedTime}
          </div>
          <div>🌡 기온: {selectedWeather?.T1H}℃</div>
          <div>💨 풍속: {selectedWeather?.WSD} m/s</div>
          <div>🧭 풍향: {selectedWeather?.VEC}°</div>
        </div>

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
          {Object.keys(weather).map((time) => (
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

          {fires.map((fire, idx) => {
            const lat = parseFloat(fire.lat);
            const lon = parseFloat(fire.lon);
            const vec = selectedWeather?.VEC || "0";
            const [destLat, destLon] = computeDestination(lat, lon, vec, 0.5);

            return (
              <>
                <Marker
                  key={`marker-${idx}`}
                  position={[lat, lon]}
                  icon={WindArrow({ direction: vec })}
                />
                <Polyline
                  key={`line-${idx}`}
                  positions={[
                    [lat, lon],
                    [destLat, destLon],
                  ]}
                  color="red"
                  weight={2}
                  dashArray="4"
                />
              </>
            );
          })}
        </MapContainer>
      </div>
    </DashboardLayout>
  );
};

export default WeatherMap;
