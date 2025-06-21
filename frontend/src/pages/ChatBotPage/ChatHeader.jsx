import { IoArrowBack } from "react-icons/io5";

import { IoClose } from "react-icons/io5";

function ChatHeader({ onBack }) {
   return (
      <header className="bg-blue-600 text-white p-4 flex items-center gap-4">
         <button
            onClick={onBack}
            aria-label="뒤로가기"
            className="text-white text-2xl font-bold px-2 py-1 rounded hover:bg-blue-700 transition"
         >
            <IoArrowBack />
         </button>
         <h1 className="flex-grow text-center font-bold text-lg">
            화재 행동요령 도우미
         </h1>

         <button
            aria-label="종료하기"
            className="text-white text-2xl font-bold px-2 py-1 rounded hover:bg-blue-700 transition"
         >
            <IoClose />
         </button>
      </header>
   );
}

export default ChatHeader;
