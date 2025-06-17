function ChatHeader({ onBack }) {
    return (
        <header className="bg-blue-600 text-white p-4 flex items-center gap-4">
            <button
                onClick={onBack}
                aria-label="뒤로가기"
                className="text-white text-lg font-bold px-2 py-1 rounded hover:bg-blue-700 transition"
            >
                ← 뒤로가기
            </button>
            <h1 className="flex-grow text-center font-bold text-lg">
                챗봇 상담창
            </h1>
            <div className="w-20" /> {/* 오른쪽 공간 확보용 */}
        </header>
    );
}

export default ChatHeader;
