import { useState } from "react";
import axios from "axios";
import { IoIosLink } from "react-icons/io";
import { CgClose } from "react-icons/cg";
import Toast from "./Toast";
import { IoIosCheckmarkCircle } from "react-icons/io";

const dummyRecipients = [
   "010-1234-5678",
   "010-9876-5432",
   "010-5555-6666",
   "010-1111-2222",
];

export default function GenerateUrl({ onUrlGenerated }) {
   const [generatedUrl, setGeneratedUrl] = useState("");
   const [showModal, setShowModal] = useState(false);
   const [isLoading, setIsLoading] = useState(false);
   const [toastVisible, setToastVisible] = useState(false);
   const [showRecipientList, setShowRecipientList] = useState(false);
   const [selectedPhoneNumber, setSelectedPhoneNumber] = useState("");
   const [memoContent, setMemoContent] = useState("");

   const apiUrl = import.meta.env.VITE_API_URL;

   const generateReportUrl = async () => {
      if (!selectedPhoneNumber) return;

      try {
         setIsLoading(true);

         // 연락처 + 메모 같이 전송 (지금은 메모는 예시로 공백)
         const { data: token } = await axios.post(
            `${apiUrl}/fire-report-tokens/report`,
            {
               phone: selectedPhoneNumber,
               content: memoContent,
            }
         );

         const url = `${window.location.origin}/report?token=${token}`;
         setGeneratedUrl(url);

         // 토큰 생성되면 상위에 알리기
         if (onUrlGenerated) {
            onUrlGenerated({
               token,
               url, // reportId는 새로 생성된 신고가 생성되고 나서 따로 받아와야 하므로, 없으면 null로 둠
               reportId: null, // 아직 신고자는 위치를 제출하지 않았음
               phone: selectedPhoneNumber,
            }); // 필요한 정보 맞게 전달
         }
      } catch (error) {
         alert("❌ 신고 URL 생성 실패");
         console.error(error);
      } finally {
         setIsLoading(false);
      }
   };

   const copyToClipboard = () => {
      if (generatedUrl) {
         navigator.clipboard.writeText(generatedUrl).then(() => {
            setToastVisible(true);
         });
      }
   };

   const onSelectPhoneNumber = (phone) => {
      setSelectedPhoneNumber(phone);
      setShowRecipientList(false);
   };

   return (
      <>
         <button
            onClick={() => {
               setShowModal(true);
               setGeneratedUrl("");
               setSelectedPhoneNumber("");
               setShowRecipientList(false);
            }}
            className="fixed top-4 right-10 z-50 flex gap-2 items-center text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-200 font-medium rounded-lg text-sm px-4 py-2 shadow-md"
         >
            <IoIosLink className="text-xl" />
            <span className="text-sm">신고 URL 생성</span>
         </button>

         {showModal && (
            <div className="fixed inset-0 z-[600] flex items-center justify-center bg-black bg-opacity-50 p-4">
               <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
                  {/* Modal Header */}
                  <div className="flex justify-between items-center border-b px-5 py-3">
                     <h3 className="font-semibold text-lg">신고 URL 생성</h3>
                     <button
                        onClick={() => setShowModal(false)}
                        className="ms-auto -mx-1.5 -my-1.5 text-gray-500 hover:text-gray-900 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 hover:bg-gray-100 inline-flex items-center justify-center h-8 w-8"
                     >
                        <CgClose className="w-5 h-5" />
                     </button>
                  </div>

                  {/* Modal Body */}
                  <div className="p-5">
                     <label className="block text-sm font-medium mb-1">
                        수신번호 (전화번호)
                     </label>
                     <input
                        type="text"
                        value={selectedPhoneNumber}
                        placeholder="수신번호를 선택하세요"
                        className="w-full bg-gray-100 border rounded px-3 py-2 mb-2 text-sm"
                     />
                     <button
                        type="button"
                        onClick={() => setShowRecipientList(!showRecipientList)}
                        className="text-blue-600 underline text-sm mb-4"
                     >
                        {showRecipientList ? "수신목록 닫기" : "수신목록 보기"}
                     </button>

                     {showRecipientList && (
                        <div className="max-h-32 overflow-y-auto border bg-gray-50 mb-4">
                           {dummyRecipients.map((phone, i) => (
                              <button
                                 key={phone}
                                 onClick={() => onSelectPhoneNumber(phone)}
                                 className={`w-full text-left px-4 py-2 text-sm hover:bg-blue-100 ${
                                    i === 0
                                       ? "font-semibold text-blue-600"
                                       : "text-gray-700"
                                 }`}
                              >
                                 {phone}
                                 {i === 0 && (
                                    <span className="ml-2 text-xs text-blue-500">
                                       (최근)
                                    </span>
                                 )}
                              </button>
                           ))}
                        </div>
                     )}

                     <label className="block text-sm font-medium mb-1">
                        신고 내용 메모
                     </label>
                     <input
                        type="text"
                        value={memoContent}
                        onChange={(e) => setMemoContent(e.target.value)}
                        placeholder="신고 내용을 입력하세요"
                        className="w-full bg-white border rounded px-3 py-2 mb-2 text-sm"
                     />
                     <input
                        type="text"
                        readOnly
                        value={generatedUrl}
                        placeholder="아직 URL이 생성되지 않았습니다."
                        className="w-full bg-gray-100 border rounded px-3 py-2 mb-4 text-sm"
                     />
                     {generatedUrl && (
                        <div className="flex items-center">
                           <IoIosCheckmarkCircle className="text-xl text-green-600" />
                           <p className="text-green-600 text-xs ml-2">
                              URL 생성 완료
                           </p>
                        </div>
                     )}

                     <div className="flex justify-end gap-2">
                        {!generatedUrl ? (
                           <button
                              onClick={generateReportUrl}
                              disabled={isLoading || !selectedPhoneNumber}
                              className={`px-5 py-2 rounded-lg text-sm font-medium ${
                                 isLoading || !selectedPhoneNumber
                                    ? "bg-gray-400 cursor-not-allowed text-white"
                                    : "bg-blue-700 hover:bg-blue-800 text-white focus:ring-4 focus:outline-none focus:ring-blue-300"
                              }`}
                           >
                              {isLoading ? "생성중..." : "URL 생성"}
                           </button>
                        ) : (
                           <button
                              onClick={() => {
                                 copyToClipboard();
                                 setShowModal(false);
                              }}
                              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm"
                           >
                              확인
                           </button>
                        )}
                     </div>
                  </div>
               </div>
            </div>
         )}

         {toastVisible && (
            <Toast
               message="URL이 생성되었습니다."
               onClose={() => setToastVisible(false)}
            />
         )}
      </>
   );
}
