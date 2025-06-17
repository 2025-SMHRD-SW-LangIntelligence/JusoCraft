function FireInfoPanel({ report, fireStation }) {
   return (
      <div className="space-y-3 text-[15px] text-gray-800">
         {/* 신고자 위치 */}
         <div className="flex items-center gap-2">
            <span className="flex items-center bg-green-100 text-green-800 text-sm font-medium px-2 py-1 rounded-2xl">
               <img
                  src="/reporter-icon.svg"
                  alt="신고자"
                  className="w-5 h-5 mr-1"
               />
               신고자 위치
            </span>
            <span>{report.reporterAddress || "주소 정보 없음"}</span>
         </div>

         {/* 화재 위치 */}
         <div className="flex items-center gap-2">
            <span className="flex items-center bg-red-100 text-red-800 text-sm font-medium px-2 py-1 rounded-2xl">
               <img src="/fire-icon.svg" alt="화재" className="w-5 h-5 mr-1" />
               화재 발생지
            </span>
            <span className="font-semibold text-lg">
               {report.fireAddress || "주소 정보 없음"}
            </span>
         </div>

         {/* 소방서 정보 */}
         <div className="flex items-center gap-2">
            <span className="flex items-center bg-blue-100 text-blue-800 text-sm font-medium px-2 py-1 rounded-2xl">
               <img
                  src="/firefighter-icon.svg"
                  alt="소방서"
                  className="w-5 h-5 mr-1"
               />
               소방서 위치
            </span>
            {/* <div>{fireStation.centerName || "이름 없음"}</div> */}
            <div className="text-sm text-gray-500">
               {fireStation.address || "주소 정보 없음"}
            </div>
         </div>
      </div>
   );
}

export default FireInfoPanel;
