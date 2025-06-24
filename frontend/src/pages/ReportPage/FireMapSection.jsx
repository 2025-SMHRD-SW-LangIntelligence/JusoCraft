import { useState, useEffect } from "react";
import useFireMap from "./hooks/useFireMap";
import LocationInfo from "./LocationInfo";
import { HiOutlineRefresh } from "react-icons/hi";
import { MdSwipeVertical } from "react-icons/md";
import ModalWrapper from "../../components/ModalWrapper";

function FireMapSection() {
    const [showToast, setShowToast] = useState(true);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [isRedirecting, setIsRedirecting] = useState(false);

    const {
        reporterPos,
        firePos,
        fireAddress,
        accuracyInfo,
        refreshLocation,
        handleSubmit: originalHandleSubmit,
        reporterAddress,
    } = useFireMap();

    const handleSubmit = async () => {
        const result = await originalHandleSubmit();
        if (result) setShowSuccessModal(true);
    };

    const goToChatbot = () => {
        setShowSuccessModal(false);
        //   window.location.href = "/chatbot";
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            setShowToast(false);
        }, 5000);
        return () => clearTimeout(timer);
    }, []);

    const handleRedirect = () => {
        setIsRedirecting(true);
        setTimeout(() => {
            window.location.href = "/chatbot";
        }, 1500); // 1.5초 후 이동
    };

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
                <div className="flex gap-3 fixed top-[60px] text-center left-1/2 w-[90%] transform -translate-x-1/2 bg-blue-600/80 text-white text-md px-4 py-2 rounded-lg shadow-md z-50 animate-fade-in-out">
                    <MdSwipeVertical className="text-white text-xl" />
                    지도를 이동해 화재 위치를 지정하세요.
                </div>
            )}

            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-white bg-opacity-90 shadow-[0_4px_12px_rgba(0,0,0,0.25)] rounded-t-3xl p-5 z-50 flex flex-col gap-3">
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

            {showSuccessModal && (
                <ModalWrapper
                    title="신고 위치 전송 완료"
                    onClose={goToChatbot}
                    size="sm"
                >
                    <div className="text-center">
                        <p className="text-gray-700 mb-4">
                            신고 위치가 성공적으로 관제센터에 전송되었습니다.
                        </p>
                        {isRedirecting ? (
                            <button
                                disabled
                                type="button"
                                className="inline-flex items-center px-5 py-2.5 text-sm font-medium text-white bg-blue-500 rounded-lg focus:ring-4 focus:ring-blue-300"
                            >
                                <svg
                                    aria-hidden="true"
                                    role="status"
                                    class="inline w-4 h-4 me-3 text-white animate-spin"
                                    viewBox="0 0 100 101"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                                        fill="#E5E7EB"
                                    />
                                    <path
                                        d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                                        fill="currentColor"
                                    />
                                </svg>
                                챗봇 화면으로 이동 중입니다...
                            </button>
                        ) : (
                            <button
                                onClick={handleRedirect}
                                className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                            >
                                확인
                            </button>
                        )}
                    </div>
                </ModalWrapper>
            )}
        </div>
    );
}

export default FireMapSection;
