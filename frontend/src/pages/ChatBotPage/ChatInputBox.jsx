import { useState } from "react";

function ChatInputBox({ input, setInput, onSend }) {
    const [isComposing, setIsComposing] = useState(false); // ← 추가

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey && !isComposing) { // ← 수정
            e.preventDefault();          // 기본 줄바꿈 방지
            onSend();                    // 메시지 전송
        }
    };

    return (
        <footer className="p-4 border-t flex gap-2">
         <textarea
             rows={1}
             className="flex-grow resize-none border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
             placeholder="메시지를 입력하세요..."
             value={input}
             onChange={(e) => setInput(e.target.value)}
             onCompositionStart={() => setIsComposing(true)}
             onCompositionEnd={() => setIsComposing(false)}
             onKeyDown={handleKeyDown}
         />
            <button
                onClick={onSend}
                className="bg-blue-600 text-white px-4 rounded hover:bg-blue-700 transition"
            >
                전송
            </button>
        </footer>
    );
}

export default ChatInputBox;
