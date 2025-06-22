import {
    MapContainer,
    TileLayer,
    Marker,
    Tooltip,
    Circle,
    useMap,
} from "react-leaflet";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import DashboardLayout from "../layouts/DashboardLayout";
import React from "react";
import windyArrow from "/windy-arrow-red.svg";
import { FaStop, FaPause, FaPlay } from "react-icons/fa";

function getWindDirectionText(deg) {
    const dirs = [
        "북",
        "북북동",
        "북동",
        "동북동",
        "동",
        "동남동",
        "남동",
        "남남동",
        "남",
        "남남서",
        "남서",
        "서남서",
        "서",
        "서북서",
        "북서",
        "북북서",
    ];
    const idx = Math.round((parseFloat(deg) % 360) / 22.5) % 16;
    return dirs[idx];
}

// 바람 방향에 따라 원이 지도 상 어느 방향으로든 이동
function computeDestination(lat, lon, vecDegree, distanceKm = 1.0) {
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

function createImageIcon(degree, speed) {
    const opacity = Math.min(1, Math.max(0.3, speed / 5));
    return L.divIcon({
        html: `<img
        src="${windyArrow}"
        style="transform: rotate(${
            (parseFloat(degree) + 180) % 360
        }deg); width: 26px; opacity: ${opacity}; pointer-events: none;"
      />`,
        className: "custom-arrow-icon",
        iconSize: [26, 26],
        iconAnchor: [13, 13],
    });
}

function createPingIcon(isRain = false) {
    const bgColor = isRain ? "#3b82f6" : "#ef4444";
    const pulseColor = isRain ? "#3b82f6" : "#ef4444";
    return L.divIcon({
        html: `
      <div class="relative w-3 h-3" style="z-index: 1000;">
        <span class="animate-ping absolute inline-flex h-full w-full rounded-full" style="background-color: ${pulseColor}; opacity: 0.75;"></span>
        <span class="relative inline-flex rounded-full h-3 w-3" style="background-color: ${bgColor};"></span>
      </div>
    `,
        className: "custom-ping-icon",
        iconSize: [12, 12],
        iconAnchor: [6, 6],
    });
}

const ZoomToFire = ({ position }) => {
    const map = useMap();
    useEffect(() => {
        if (position) {
            map.setView(position, 16, { animate: true });
        }
    }, [position]);
    return null;
};

const WindMap = () => {
    const [fires, setFires] = useState([]);
    const [firesWithSteps, setFiresWithSteps] = useState([]);
    const [timeKeys, setTimeKeys] = useState([]);
    const [selectedTime, setSelectedTime] = useState(null);
    const [activeFire, setActiveFire] = useState(null);
    const [loading, setLoading] = useState(true);

    const [isPlaying, setIsPlaying] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const playIntervalRef = useRef(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await axios.get(
                `${import.meta.env.VITE_API_URL}/weather`
            );
            const data = res.data.fires || [];
            setFires(data);

            const sample = data?.[0];
            const rawKeys = Object.keys(sample?.weather || {});
            const sortedKeys = rawKeys.sort((a, b) => Number(a) - Number(b));

            const now = new Date();
            let baseHour = now.getHours();
            if (now.getMinutes() < 45)
                baseHour = baseHour - 1 < 0 ? 23 : baseHour - 1;

            const rotatedKeys = sortedKeys
                .filter((key) => Number(key.slice(0, 2)) >= baseHour)
                .concat(
                    sortedKeys.filter(
                        (key) => Number(key.slice(0, 2)) < baseHour
                    )
                );

            const slicedKeys = rotatedKeys.slice(0, 5);
            setTimeKeys(slicedKeys);
            if (!selectedTime && slicedKeys.length > 0)
                setSelectedTime(slicedKeys[0]);

            // firesWithSteps 만들기
            const enhancedFires = data.map((fire) => {
                const lat = parseFloat(fire.lat);
                const lon = parseFloat(fire.lon);
                const weatherMap = fire.weather || {};
                const stepCircles = [];
                const arrowPointsByTime = [];

                slicedKeys.forEach((timeKey, index) => {
                    const weather = weatherMap[timeKey] || {};
                    const vec = weather.VEC || "0";
                    const speed = parseFloat(weather.WSD || "0");
                    const isRain = weather.PTY && weather.PTY !== "0";
                    // const baseDistanceKm = isRain
                    //     ? 0.05
                    //     : 0.1 + 0.02 * (index + 1);

                    // 풍속 기반 거리 계산식 적용
                    const baseDistanceKm = isRain
                        ? 0.05
                        : Math.min(0.5, speed * 0.02 * (index + 1)); // 예: 3m/s * 0.02 * 3 = 0.18km

                    const center =
                        index === 0
                            ? [lat, lon]
                            : computeDestination(
                                  lat,
                                  lon,
                                  vec,
                                  baseDistanceKm * index
                              );

                    stepCircles.push({
                        step: index + 1,
                        center,
                        radius: baseDistanceKm * 1000,
                        isRain,
                    });

                    const arrowPoints = Array.from({ length: 3 }, (_, i) =>
                        computeDestination(
                            lat,
                            lon,
                            vec,
                            baseDistanceKm * (i + 1) * 0.5
                        )
                    );
                    arrowPointsByTime.push({
                        timeKey,
                        arrowPoints,
                        vec,
                        speed,
                    });
                });

                return {
                    ...fire,
                    lat,
                    lon,
                    stepCircles,
                    arrowPointsByTime,
                };
            });

            setFiresWithSteps(enhancedFires);
        } catch (e) {
            console.error("날씨 데이터 오류:", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 60000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        return () => clearInterval(playIntervalRef.current);
    }, []);

    const startPlayback = () => {
        if (isPlaying || timeKeys.length === 0) return;
        setIsPlaying(true);
        setIsPaused(false);
        playIntervalRef.current = setInterval(() => {
            setSelectedTime((prev) => {
                const idx = timeKeys.indexOf(prev);
                const nextIdx = idx + 1;
                if (nextIdx < timeKeys.length) {
                    return timeKeys[nextIdx];
                } else {
                    return timeKeys[0]; // 반복 재생
                }
            });
        }, 1000);
    };

    const pausePlayback = () => {
        clearInterval(playIntervalRef.current);
        setIsPaused(true);
        setIsPlaying(false);
    };

    const stopPlayback = () => {
        clearInterval(playIntervalRef.current);
        setIsPlaying(false);
        setIsPaused(false);
        setActiveFire(null); // 정보 패널 초기화
        if (timeKeys.length > 0) setSelectedTime(timeKeys[0]);
    };

    const progressPercent =
        selectedTime && timeKeys.length > 0
            ? ((timeKeys.indexOf(selectedTime) + 1) / timeKeys.length) * 100
            : 0;

    return (
        <DashboardLayout>
            <div className="relative w-full h-[80vh]">
                {loading ? (
                    <div className="flex items-center justify-center h-full flex-col animate-pulse text-gray-500">
                        <div className="w-12 h-12 mb-4 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        <div className="text-sm">
                            화재 위치 및 기상 데이터를 불러오는 중...
                        </div>
                    </div>
                ) : (
                    <>
                        {/* 재생 컨트롤 */}
                        <div className="absolute top-4 left-4 z-[1000] flex flex-col gap-2 bg-white/90 p-2 rounded-md shadow-md">
                            <div className="flex gap-2 flex-wrap">
                                <div className="flex gap-1">
                                    <button
                                        onClick={() =>
                                            isPlaying
                                                ? pausePlayback()
                                                : startPlayback()
                                        }
                                        className="px-2 py-1 rounded hover:bg-gray-200"
                                    >
                                        {isPlaying ? (
                                            <FaPause className="text-gray-600 w-4 h-4" />
                                        ) : isPaused ? (
                                            <FaPlay className="text-blue-600 w-4 h-4" />
                                        ) : (
                                            <FaPlay className="text-blue-600 w-4 h-4" />
                                        )}
                                    </button>
                                    <button
                                        onClick={stopPlayback}
                                        className="px-2 py-1 rounded hover:bg-gray-200"
                                    >
                                        <FaStop className="text-red-400 w-4 h-4" />
                                    </button>
                                </div>

                                <div className="flex flex-col gap-1">
                                    <div className="flex gap-1">
                                        {timeKeys.map((time) => (
                                            <button
                                                key={time}
                                                onClick={() => {
                                                    clearInterval(
                                                        playIntervalRef.current
                                                    );
                                                    setIsPlaying(false);
                                                    setIsPaused(false);
                                                    setSelectedTime(time);
                                                }}
                                                className={`px-2 py-1 text-xs rounded ${
                                                    selectedTime === time
                                                        ? "bg-blue-600 text-white"
                                                        : "bg-blue-100 text-blue-800"
                                                }`}
                                            >
                                                {time.slice(0, 2)}시
                                            </button>
                                        ))}
                                    </div>
                                    <div className="w-full h-1 bg-gray-200 rounded">
                                        <div
                                            className="h-full bg-blue-500 rounded transition-all duration-300"
                                            style={{
                                                width: `${progressPercent}%`,
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 정보 패널 */}
                        {activeFire && selectedTime && (
                            <div className="absolute top-4 right-4 bg-white p-4 w-64 shadow-md rounded-lg z-[1000] text-sm">
                                <h3 className="text-base font-semibold mb-1">
                                    화재 상세
                                </h3>
                                <div>{activeFire.address}</div>
                                <ul>
                                    <li className="flex gap-1 items-center">
                                        기온 :
                                        <span>
                                            {activeFire.weather?.[selectedTime]
                                                ?.T1H || "?"}
                                            ℃
                                        </span>
                                    </li>
                                    <li className="flex gap-1 items-center">
                                        풍속 :
                                        <span>
                                            {activeFire.weather?.[selectedTime]
                                                ?.WSD || "?"}
                                            m/s
                                        </span>
                                    </li>
                                    <li className="flex gap-1 items-center">
                                        풍향 :
                                        <span>
                                            {activeFire.weather?.[selectedTime]
                                                ?.VEC || "?"}
                                            ° (
                                            {getWindDirectionText(
                                                activeFire.weather?.[
                                                    selectedTime
                                                ]?.VEC || 0
                                            )}
                                            )
                                        </span>
                                    </li>
                                    <li className="flex gap-1 items-center">
                                        강수 :
                                        <span>
                                            {activeFire.weather?.[selectedTime]
                                                ?.PTY === "0"
                                                ? "없음"
                                                : "비 또는 눈"}
                                        </span>
                                    </li>
                                </ul>

                                <div className="mt-2 text-xs text-gray-500">
                                    기준 시각 : {selectedTime.slice(0, 2)}:
                                    {selectedTime.slice(2)}
                                </div>
                            </div>
                        )}

                        <MapContainer
                            center={[35.1595, 126.8526]}
                            zoom={13}
                            style={{ height: "100%", width: "100%" }}
                        >
                            <TileLayer
                                attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                                url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                            />
                            {firesWithSteps.map((fire, idx) => {
                                const position = [fire.lat, fire.lon];
                                const currentStep =
                                    timeKeys.indexOf(selectedTime) + 1;
                                const currentArrow =
                                    fire.arrowPointsByTime.find(
                                        (a) => a.timeKey === selectedTime
                                    );
                                const isRain = fire.stepCircles[0]?.isRain;

                                return (
                                    <React.Fragment key={idx}>
                                        {/* 화살표 */}
                                        {currentArrow?.arrowPoints.map(
                                            (pos, i) => (
                                                <Marker
                                                    key={`arrow-${i}`}
                                                    position={pos}
                                                    icon={createImageIcon(
                                                        currentArrow.vec,
                                                        currentArrow.speed
                                                    )}
                                                    interactive={false}
                                                />
                                            )
                                        )}

                                        {/* 누적 원 */}
                                        {fire.stepCircles
                                            .filter(
                                                (s) =>
                                                    s.step !== 1 &&
                                                    s.step <= currentStep
                                            )
                                            .map((s, i) => (
                                                <Circle
                                                    key={`circle-${i}`}
                                                    center={s.center}
                                                    radius={s.radius}
                                                    pathOptions={{
                                                        stroke: false,
                                                        fillColor: s.isRain
                                                            ? "#3b82f6"
                                                            : "#ef4444",
                                                        fillOpacity:
                                                            0.8 / s.step, // step 1은 0.3, step 2는 0.15, step 3은 0.1
                                                    }}
                                                />
                                            ))}

                                        {/* 화재 중심 마커 */}
                                        <Marker
                                            position={position}
                                            icon={createPingIcon(isRain)}
                                            eventHandlers={{
                                                click: () =>
                                                    setActiveFire(fire),
                                            }}
                                        >
                                            <Tooltip>{fire.address}</Tooltip>
                                        </Marker>

                                        {activeFire?.lat === fire.lat &&
                                            activeFire?.lon === fire.lon && (
                                                <ZoomToFire
                                                    position={position}
                                                />
                                            )}
                                    </React.Fragment>
                                );
                            })}
                        </MapContainer>
                    </>
                )}
            </div>
        </DashboardLayout>
    );
};

export default WindMap;
