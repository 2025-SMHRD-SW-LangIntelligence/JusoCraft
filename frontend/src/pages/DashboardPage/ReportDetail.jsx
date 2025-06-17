import MapPreview from "./MapPreview";
import FireStationList from "./FireStationList";

export default function ReportDetail({ report, fireStations, onDispatch }) {
   return (
      <div>
         {/* 지도 + 소방서 목록 양쪽 배치 */}
         <div className="flex flex-col md:flex-row gap-4">
            {/* 왼쪽: 지도 */}
            <div className="w-full md:w-1/2">
               <MapPreview
                  reporterLat={report.reporterLat}
                  reporterLng={report.reporterLng}
                  fireLat={report.fireLat}
                  fireLng={report.fireLng}
               />
            </div>

            {/* 오른쪽: 소방서 목록 */}
            <div className="w-full md:w-1/2 overflow-auto max-h-7xl">
               <FireStationList
                  fireLat={report.fireLat}
                  fireLng={report.fireLng}
                  stations={fireStations}
                  reportToken={report.token}
                  onDispatch={onDispatch}
               />
            </div>
         </div>
      </div>
   );
}
