import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function ChatBotPage() {
    const navigate = useNavigate();
    const [messages, setMessages] = useState([
        {
            id: 1,
            sender: "bot",
            text: "안녕하세요. 화재 행동요령 도우미 챗봇입니다. 무엇을 도와드릴까요?",
        },
    ]);
    const [input, setInput] = useState("");
    const messagesEndRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const sendMessage = () => {
        if (!input.trim()) return;
        setMessages((prev) => [
            ...prev,
            { id: Date.now(), sender: "user", text: input },
        ]);
        setInput("");
        // 봇 응답 로직 추가 가능
    };

    const onKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <div className="flex flex-col h-screen max-w-xl mx-auto border rounded shadow-md bg-white">
            <header className="bg-blue-600 text-white p-4 flex items-center gap-4">
                <button
                    onClick={() => navigate(-1)}
                    aria-label="뒤로가기"
                    className="text-white text-lg font-bold px-2 py-1 rounded hover:bg-blue-700 transition"
                >
                    ← 뒤로가기
                </button>
                <h1 className="flex-grow text-center font-bold text-lg">
                    챗봇 상담창
                </h1>
                <div className="w-20" />
            </header>

            <main className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`max-w-[75%] p-2 rounded ${
                            msg.sender === "bot"
                                ? "bg-blue-100 self-start"
                                : "bg-green-100 self-end"
                        }`}
                    >
                        {msg.text}
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </main>

            <footer className="p-4 border-t flex gap-2">
                <textarea
                    rows={1}
                    className="flex-grow resize-none border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="메시지를 입력하세요..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={onKeyDown}
                />
                <button
                    onClick={sendMessage}
                    className="bg-blue-600 text-white px-4 rounded hover:bg-blue-700 transition"
                    aria-label="메시지 전송"
                >
                    전송
                </button>
            </footer>
        </div>
    );
}

export default ChatBotPage;
