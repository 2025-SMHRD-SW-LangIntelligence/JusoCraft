import { CgMenuLeft } from "react-icons/cg";

export default function Topbar({ toggleSidebar }) {
   return (
      <header className="bg-white shadow p-4 pr-8 flex items-center justify-between border-b border-[#E4E7EC]">
         <button
            className="text-gray-500 text-xl focus:outline-none p-2 border border-[#E4E7EC] rounded-md"
            onClick={toggleSidebar}
         >
            {/* 햄버거 아이콘 */}
            <CgMenuLeft />
         </button>
      </header>
   );
}
