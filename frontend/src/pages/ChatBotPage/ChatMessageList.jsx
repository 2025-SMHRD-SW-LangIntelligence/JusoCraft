function ChatMessageList({ messages, endRef }) {
    return (
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
            <div ref={endRef} />
        </main>
    );
}
export default ChatMessageList;
