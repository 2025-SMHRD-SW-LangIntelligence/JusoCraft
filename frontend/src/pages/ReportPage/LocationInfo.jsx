function LocationInfo({ reporterAddress, fireAddress }) {
   return (
      <div className="space-y-2 text-lg">
         <p className="mt-[-7px] text-center text-xs text-gray-400">
            현재 위치가 다르면 새로고침 또는 GPS 설정을 확인하세요.
         </p>

         {/* 신고자 위치 */}
         <div className="flex items-center gap-2">
            <span className="flex items-center text-[15px] font-regular text-[#777]">
               <span className="gap-1.5 flex items-center bg-green-100 text-green-800 text-sm font-medium me-3 px-2 py-1 rounded-2xl">
                  <img
                     src="/reporter-icon.svg"
                     alt="신고자 마커"
                     className="w-5 h-5"
                  />
                  현재 위치
               </span>
               {reporterAddress || "주소 불러오는 중..."}
            </span>
         </div>
         {/* 화재 위치 */}
         <div className="flex items-center gap-2">
            <span className="flex items-center text-gray-700 text-base font-bold text-[#555]">
               <span className="gap-1.5 flex items-center bg-red-100 text-red-800 text-sm font-medium me-3 px-2 py-1 rounded-2xl">
                  <img
                     src="/fire-icon.svg"
                     alt="화재 마커"
                     className="w-5 h-5"
                  />
                  화재 위치
               </span>
               {fireAddress || "주소 불러오는 중..."}
            </span>
         </div>
      </div>
   );
}

export default LocationInfo;

// function LocationInfo({ reporterPos, accuracyInfo, firePos, fireAddress }) {
//    return (
//       <>
//          <p>🧍‍♂️ 신고자 위치 (GPS)</p>
//          {reporterPos && (
//             <p className="text-sm">
//                위도: {reporterPos.getLat().toFixed(6)} / 경도:
//                {reporterPos.getLng().toFixed(6)}
//             </p>
//          )}
//          {accuracyInfo && (
//             <p className="text-sm text-gray-500">{accuracyInfo}</p>
//          )}

//          <div className="mt-4">
//             <p>🔥 화재 발생 위치 (지도 중심)</p>
//             {firePos && (
//                <p className="text-sm">
//                   위도: {firePos.getLat().toFixed(6)} / 경도:
//                   {firePos.getLng().toFixed(6)}
//                </p>
//             )}
//             {fireAddress && (
//                <p className="text-sm text-gray-600">주소: {fireAddress}</p>
//             )}
//             <p className="text-sm text-gray-600">
//                👉 지도를 움직여 화재 위치를 조정하세요.
//             </p>
//          </div>
//       </>
//    );
// }

// export default LocationInfo;
