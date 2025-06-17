import { useState } from "react";
import { LiaToggleOffSolid, LiaToggleOnSolid } from "react-icons/lia";

function translateStatus(status) {
   switch (status) {
      case "RECEIVED":
         return "신고 접수";
      case "DISPATCHED":
         return "출동 지시";
      case "ARRIVED":
         return "현장 도착";
      case "INITIAL_SUPPRESSION":
         return "초기 진압";
      case "OVERHAUL":
         return "잔불 정리";
      case "FULLY_SUPPRESSED":
         return "완전 진압";
      case "WITHDRAWN":
         return "철수";
      case "MONITORING":
         return "잔불 감시";
      default:
         return "신고 접수";
   }
}

function getStatusBadgeColor(status) {
   switch (status) {
      case "RECEIVED":
         return "bg-gray-100 text-gray-600";
      case "DISPATCHED":
         return "bg-blue-100 text-blue-600";
      case "ARRIVED":
         return "bg-indigo-100 text-indigo-600";
      case "INITIAL_SUPPRESSION":
         return "bg-orange-100 text-orange-600";
      case "OVERHAUL":
         return "bg-yellow-100 text-yellow-600";
      case "FULLY_SUPPRESSED":
         return "bg-green-100 text-green-600";
      case "WITHDRAWN":
         return "bg-red-100 text-red-600";
      case "MONITORING":
         return "bg-purple-100 text-purple-600";
      default:
         return "bg-gray-100 text-gray-600";
   }
}

export default function ReportTable({ reports, onSelect }) {
   const [showReportDetail, setShowReportDetail] = useState(false);

   return (
      <div className="rounded-2xl border border-gray-200 bg-white">
         <div className="px-6 py-4 flex justify-between items-center">
            <h3 className="text-base font-medium text-gray-800">
               위치 입력 완료 목록
            </h3>
            <button
               onClick={() => setShowReportDetail((prev) => !prev)}
               className="flex items-center gap-2 text-gray-600 hover:text-gray-650"
               aria-label="연락처 및 내용 보기 토글"
               type="button"
            >
               <span className="text-sm select-none">연락처 및 내용 보기</span>
               {showReportDetail ? (
                  <LiaToggleOnSolid size={24} />
               ) : (
                  <LiaToggleOffSolid size={24} />
               )}
            </button>
         </div>

         <div className="p-4 border-t border-gray-100 sm:p-6">
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
               <div className="max-w-full overflow-x-auto">
                  <table className="min-w-full text-sm">
                     <thead className="border-b border-gray-100 bg-neutral-50">
                        <tr>
                           <th className="px-6 py-4 text-center text-xs font-medium text-gray-500">
                              ID
                           </th>

                           {!showReportDetail && (
                              <>
                                 <th className="px-6 py-4 text-center text-xs font-medium text-gray-500">
                                    신고자 주소
                                 </th>
                                 <th className="px-6 py-4 text-center text-xs font-medium text-gray-900 bg-red-100">
                                    화재 주소
                                 </th>
                              </>
                           )}

                           {showReportDetail && (
                              <>
                                 <th className="px-6 py-4 text-center text-xs font-medium text-gray-500">
                                    신고자 연락처
                                 </th>
                                 <th className="px-6 py-4 text-center text-xs font-medium text-gray-500">
                                    신고 내용
                                 </th>
                              </>
                           )}

                           <th className="px-6 py-4 text-center text-xs font-medium text-gray-500">
                              시간
                           </th>
                           <th className="px-6 py-4 text-center text-xs font-medium text-gray-500">
                              상태
                           </th>
                           <th className="px-6 py-4 text-center text-xs font-medium text-gray-500">
                              상세보기
                           </th>
                        </tr>
                     </thead>

                     <tbody className="divide-y divide-gray-100">
                        {reports.map((report) => (
                           <tr key={report.id}>
                              <td className="text-center px-6 py-4 text-gray-700">
                                 {report.id}
                              </td>

                              {!showReportDetail && (
                                 <>
                                    <td className="text-center px-6 py-4 text-gray-700">
                                       {report.reporterAddress}
                                    </td>
                                    <td className="text-center px-6 py-4 bg-red-50 text-red-800">
                                       {report.fireAddress}
                                    </td>
                                 </>
                              )}

                              {showReportDetail && (
                                 <>
                                    <td className="text-center px-6 py-4 text-gray-700">
                                       {report.reporterPhone || "-"}
                                    </td>
                                    <td className="text-center px-6 py-4 text-gray-700 whitespace-pre-wrap max-w-xs">
                                       {report.reportContent || "-"}
                                    </td>
                                 </>
                              )}

                              <td className="text-center px-6 py-4 text-gray-700">
                                 {new Date(report.reportedAt).toLocaleString()}
                              </td>

                              <td className="text-center px-6 py-4">
                                 <span
                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full font-medium text-xs ${getStatusBadgeColor(
                                       report.status
                                    )}`}
                                 >
                                    {translateStatus(report.status)}
                                 </span>
                              </td>

                              <td className="text-center px-6 py-4">
                                 <button
                                    onClick={() => onSelect(report)}
                                    className="text-blue-600 hover:underline"
                                 >
                                    보기
                                 </button>
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            </div>
         </div>
      </div>
   );
}
