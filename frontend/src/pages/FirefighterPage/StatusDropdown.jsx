import { useState } from "react";
import axios from "axios";

const STATUS_OPTIONS = [
   { value: "RECEIVED", label: "접수" },
   { value: "DISPATCHED", label: "출동" },
   { value: "ARRIVED", label: "도착" },
   { value: "INITIAL_SUPPRESSION", label: "초진" },
   { value: "OVERHAUL", label: "잔불정리" },
   { value: "FULLY_SUPPRESSED", label: "완진" },
   { value: "WITHDRAWN", label: "철수" },
   { value: "MONITORING", label: "잔불감시" },
];

function StatusDropdown({ dispatchId }) {
   const [isOpen, setIsOpen] = useState(false);
   const [selected, setSelected] = useState(STATUS_OPTIONS[0]);
   const [showToast, setShowToast] = useState(false);
   const [toastText, setToastText] = useState("");

   const handleSelect = async (statusObj) => {
      setSelected(statusObj);
      setIsOpen(false);

      try {
         await axios.put(
            `${
               import.meta.env.VITE_API_URL
            }/fire-dispatches/${dispatchId}/status`,
            null,
            { params: { status: statusObj.value } }
         );
         setToastText("상태가 업데이트되었습니다.");
      } catch (err) {
         setToastText("상태 업데이트 실패");
         console.error(err);
      }

      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
   };

   return (
      <div className="absolute top-2 left-2 z-50 inline-block text-left">
         <button
            onClick={() => setIsOpen(!isOpen)}
            className="shadow-md flex justify-between min-w-[100px] text-gray-700 bg-white border font-medium rounded-3xl text-sm px-5 py-2.5 inline-flex items-center"
         >
            <span>
               상태 보고 : <span className="font-bold">{selected.label}</span>
            </span>
            <svg
               className="w-2.5 h-2.5 ml-2"
               aria-hidden="true"
               xmlns="http://www.w3.org/2000/svg"
               fill="none"
               viewBox="0 0 10 6"
            >
               <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="m1 1 4 4 4-4"
               />
            </svg>
         </button>

         {isOpen && (
            <div className="absolute z-50 mt-2 w-44 bg-white divide-y divide-gray-100 rounded-lg shadow">
               <ul className="py-1 text-sm text-gray-700">
                  {STATUS_OPTIONS.map((option) => (
                     <li key={option.value}>
                        <button
                           onClick={() => handleSelect(option)}
                           className="w-full text-left px-6 py-3 text-lg hover:bg-gray-100"
                        >
                           {option.label}
                        </button>
                     </li>
                  ))}
               </ul>
            </div>
         )}

         {showToast && (
            <div className="fixed top-[100px] left-1/2 transform -translate-x-1/2 z-[999] bg-black text-white text-sm px-5 py-2 rounded-lg shadow-md animate-fade-in-out">
               {toastText}
            </div>
         )}
      </div>
   );
}

export default StatusDropdown;
