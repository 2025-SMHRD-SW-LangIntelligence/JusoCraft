// import { useState } from "react";
// import axios from "axios";
// import Toast from "../../components/Toast";

// const STATUS_OPTIONS = [
//    { value: "RECEIVED", label: "접수" },
//    { value: "DISPATCHED", label: "출동" },
//    { value: "ARRIVED", label: "도착" },
//    { value: "INITIAL_SUPPRESSION", label: "초진" },
//    { value: "OVERHAUL", label: "잔불정리" },
//    { value: "FULLY_SUPPRESSED", label: "완진" },
//    { value: "WITHDRAWN", label: "철수" },
//    { value: "MONITORING", label: "잔불감시" },
// ];

// function FireStatusControl({ dispatchId, reporterPhoneNumber }) {
//    const [selectedStatus, setSelectedStatus] = useState("RECEIVED"); // 기본값 "접수"
//    const [toastMsg, setToastMsg] = useState("");

//    const handleStatusChange = async (e) => {
//       const newStatus = e.target.value;
//       setSelectedStatus(newStatus);

//       try {
//          await axios.put(
//             `${
//                import.meta.env.VITE_API_URL
//             }/fire-dispatches/${dispatchId}/status`,
//             null,
//             { params: { status: newStatus } }
//          );
//          setToastMsg("상태가 업데이트되었습니다.");
//       } catch (err) {
//          setToastMsg("상태 업데이트 실패");
//          console.error(err);
//       }
//    };

//    return (
//       <div className="mt-3 flex sm:flex-row items-center gap-4 relative">
//          <div className="w-full">
//             <label
//                for="firestate"
//                class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
//             >
//                상태 보고
//             </label>
//             <select
//                id="firestate"
//                value={selectedStatus}
//                onChange={handleStatusChange}
//                className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
//             >
//                {STATUS_OPTIONS.map((opt) => (
//                   <option key={opt.value} value={opt.value}>
//                      {opt.label}
//                   </option>
//                ))}
//             </select>
//          </div>

//          {reporterPhoneNumber && (
//             <a
//                href={`tel:${reporterPhoneNumber}`}
//                className="text-blue-600 underline text-sm"
//             >
//                ☎ {reporterPhoneNumber}
//             </a>
//          )}

//          {toastMsg && (
//             <Toast message={toastMsg} onClose={() => setToastMsg("")} />
//          )}
//       </div>
//    );
// }

// export default FireStatusControl;
