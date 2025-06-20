import { useRef, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ChatHeader from "./ChatHeader";
import ChatMessageList from "./ChatMessageList";
import ChatInputBox from "./ChatInputBox";
import axios from "axios";

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

    const apiUrl = import.meta.env.VITE_API_URL;

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const sendMessage = async () => {
        if (!input.trim()) return;

        const newMessage = { id: Date.now(), sender: "user", text: input };
        setMessages((prev) => [...prev, newMessage]);
        setInput("");

        try {
            const res = await axios.post(`${apiUrl}/chat`, {
                question: input,
            });

            const botMessage = {
                id: Date.now() + 1,
                sender: "bot",
                text: res.data.answer,
            };

            setMessages((prev) => [...prev, botMessage]);
        } catch (error) {
            console.error("GPT 응답 실패", error);
            setMessages((prev) => [
                ...prev,
                {
                    id: Date.now() + 2,
                    sender: "bot",
                    text: "⚠️ 답변을 가져오지 못했습니다. 다시 시도해주세요.",
                },
            ]);
        }
    };

    return (
        <div className="flex flex-col h-screen max-w-xl mx-auto border rounded shadow-md bg-white">
            <ChatHeader onBack={() => navigate(-1)} />
            <ChatMessageList messages={messages} endRef={messagesEndRef} />
            <ChatInputBox
                input={input}
                setInput={setInput}
                onSend={sendMessage}
            />
        </div>
    );
}

export default ChatBotPage;
