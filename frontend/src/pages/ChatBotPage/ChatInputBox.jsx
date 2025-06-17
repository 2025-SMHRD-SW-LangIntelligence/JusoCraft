function ChatInputBox({ input, setInput, onSend }) {
    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            onSend();
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
