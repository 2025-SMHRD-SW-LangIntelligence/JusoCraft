// OpenAI 연동 및 메시지 처리 로직 페이지

import { useEffect, useRef, useState } from "react";
import axios from "axios";

function useChatBot() {
    const [messages, setMessages] = useState([
        {
            id: 1,
            sender: "bot",
            text: "안녕하세요. 화재 행동요령 도우미 챗봇입니다. 무엇을 도와드릴까요?",
        },
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const addMessage = (sender, text) => {
        setMessages((prev) => [...prev, { id: Date.now(), sender, text }]);
    };

    const sendMessage = async () => {
        if (!input.trim()) return;

        const userText = input.trim();
        addMessage("user", userText);
        setInput("");
        setLoading(true);

        try {
            const response = await axios.post(
                "https://api.openai.com/v1/chat/completions",
                {
                    model: "gpt-3.5-turbo",
                    messages: [
                        {
                            role: "system",
                            content: "당신은 화재 행동요령 전문가입니다.",
                        },
                        {
                            role: "user",
                            content: userText,
                        },
                    ],
                    temperature: 0.7,
                },
                {
                    headers: {
                        Authorization: `Bearer ${
                            import.meta.env.VITE_OPENAI_API_KEY
                        }`,
                        "Content-Type": "application/json",
                    },
                }
            );

            const botReply =
                response.data.choices?.[0]?.message?.content?.trim() ??
                "죄송합니다. 답변을 생성할 수 없습니다.";

            addMessage("bot", botReply);
        } catch (err) {
            console.error("OpenAI 응답 오류:", err);
            addMessage("bot", "⚠️ 답변을 가져오는 데 실패했습니다.");
        } finally {
            setLoading(false);
        }
    };

    return {
        messages,
        input,
        setInput,
        sendMessage,
        loading,
        messagesEndRef,
    };
}

export default useChatBot;
