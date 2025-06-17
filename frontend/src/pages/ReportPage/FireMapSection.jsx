import { useState, useEffect } from "react";

import useFireMap from "./hooks/useFireMap";
import LocationInfo from "./LocationInfo";
import { HiOutlineRefresh } from "react-icons/hi";
import { MdSwipeVertical } from "react-icons/md";

function FireMapSection() {
   const {
      reporterPos,
      firePos,
      fireAddress,
      accuracyInfo,
      refreshLocation,
      handleSubmit,
      reporterAddress,
   } = useFireMap();
   const [showToast, setShowToast] = useState(true);

   useEffect(() => {
      const timer = setTimeout(() => {
         setShowToast(false);
      }, 5000);

      return () => clearTimeout(timer);
   }, []);

   return (
      <div>
         <div id="map" className="w-full h-[100vh]"></div>
         <button
            onClick={refreshLocation}
            className="absolute top-2 right-2 z-50 bg-white flex gap-2 items-center px-3 py-2 text-gray-600 rounded-3xl text-sm font-bold shadow-md outline-none border"
         >
            <HiOutlineRefresh className="text-xl" />
            새로고침
         </button>
         {showToast && (
            <div className="flex gap-3 fixed top-[60px] text-center left-1/2 w-[90%] transform -translate-x-1/2 bg-blue-600/80 text-white text-md px-4 py-2 rounded rounded-lg shadow-md z-50 animate-fade-in-out">
               <MdSwipeVertical className="text-white text-xl" />
               지도를 이동해 화재 위치를 지정하세요.
            </div>
         )}
         <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-[100%] max-w-md bg-white bg-opacity-90 shadow-[0_4px_12px_rgba(0,0,0,0.25)] rounded-tl-3xl rounded-tr-3xl p-5 z-50 flex flex-col gap-3">
            <LocationInfo
               reporterPos={reporterPos}
               accuracyInfo={accuracyInfo}
               firePos={firePos}
               fireAddress={fireAddress}
               reporterAddress={reporterAddress}
            />

            <button
               onClick={handleSubmit}
               className="tracking-wider px-6 py-3 text-white rounded-xl text-xl font-hakgyoansim bg-gradient-to-br from-blue-500 to-indigo-600"
            >
               신고 위치 전송하기
            </button>
         </div>
      </div>
   );
}

export default FireMapSection;
