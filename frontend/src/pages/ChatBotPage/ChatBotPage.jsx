import { useRef, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ChatHeader from "./ChatHeader";
import ChatMessageList from "./ChatMessageList";
import ChatInputBox from "./ChatInputBox";
// import useChatBot from "./hooks/useChatBot";

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
        const newMessage = { id: Date.now(), sender: "user", text: input };
        setMessages((prev) => [...prev, newMessage]);
        setInput("");

        // TODO: OpenAI 응답 처리 로직 여기에
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
