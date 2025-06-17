import { NavLink } from "react-router-dom";

import { CiViewBoard, CiViewList, CiCircleCheck } from "react-icons/ci";
import {
   PiFireExtinguisher,
   PiListChecks,
   PiChartBar,
   PiDownloadSimple,
   PiSiren,
   PiFireTruck,
   PiChartPieSlice,
   PiUserList,
   PiClipboardText,
   PiShieldCheck,
   PiFire,
} from "react-icons/pi";
import { HiLocationMarker } from "react-icons/hi";
import { RxDashboard, RxPerson } from "react-icons/rx";

const menuGroups = [
   {
      title: "대시보드",
      items: [
         {
            name: "실시간 현황",
            path: "/dashboard",
            icon: <RxDashboard className="text-lg flex-none" />,
         },
         {
            name: "화재 위험 예측",
            path: "/fire-risk",
            icon: <PiChartPieSlice className="text-xl flex-none" />,
         },
      ],
   },
   {
      title: "신고 관리",
      items: [
         {
            name: "모든 신고 보기",
            path: "/reports/all",
            icon: <PiClipboardText className="text-xl flex-none" />,
         },
         {
            name: "출동 지시된 신고",
            path: "/reports/dispatched",
            icon: <PiFire className="text-xl flex-none" />,
         },
         {
            name: "완료된 신고",
            path: "/reports/completed",
            icon: <PiShieldCheck className="text-xl flex-none" />,
         },
      ],
   },
   {
      title: "출동 이력",
      items: [
         {
            name: "출동 이력",
            path: "/dispatches",
            icon: <PiListChecks className="text-xl flex-none" />,
         },
      ],
   },
   {
      title: "통계 및 리포트",
      items: [
         {
            name: "지역별 화재 발생 추이",
            path: "/stats/area",
            icon: <PiChartBar className="text-xl flex-none" />,
         },
         {
            name: "월간/주간 리포트 다운로드",
            path: "/stats/reports",
            icon: <PiDownloadSimple className="text-xl flex-none" />,
         },
      ],
   },
   {
      title: "시스템 설정",
      items: [
         {
            name: "사용자 관리",
            path: "/settings/users",
            icon: <PiUserList className="text-lg flex-none" />,
         },
         {
            name: "응급실 정보 관리",
            path: "/settings/hospitals",
            icon: <PiSiren className="text-xl flex-none" />,
         },
         {
            name: "소화전 정보 관리",
            path: "/settings/hydrants",
            icon: <PiFireExtinguisher className="text-xl flex-none" />,
         },
         {
            name: "소방서 정보 관리",
            path: "/settings/stations",
            icon: <PiFireTruck className="text-xl flex-none" />,
         },
      ],
   },
];

export default function Sidebar({ isOpen }) {
   return (
      <div
         className={`bg-white border-r border-[#E4E7EC] text-gray-800 transition-all duration-300 ease-in-out ${
            isOpen ? "w-64" : "w-16"
         } h-screen fixed left-0 top-0 z-20 flex flex-col`}
      >
         <div className="flex items-center justify-center h-16 font-[900] text-[27px] font-suit text-[#3E7EFF] tracking-[-.09em]">
            <HiLocationMarker />
            {isOpen ? "JusoCraft" : ""}
         </div>
         <nav className="flex-1 p-2 space-y-4 overflow-y-auto text-sm">
            {menuGroups.map((group) => (
               <div key={group.title}>
                  {isOpen && (
                     <div className="text-xs text-blue-400 uppercase px-4 mb-2 font-semibold">
                        {group.title}
                     </div>
                  )}
                  <div className="space-y-1">
                     {group.items.map((item) => (
                        <NavLink
                           key={item.path}
                           to={item.path}
                           className={({ isActive }) => {
                              const baseStyle =
                                 "flex items-center gap-3 px-4 py-2 rounded-md transition";
                              const activeStyle = "bg-[#3E7EFF] text-white";
                              const hoverStyle =
                                 "hover:bg-[#ECF2FF] hover:text-[#3E7EFF] text-gray-500 font-semibold";

                              return `${baseStyle} ${
                                 isActive ? activeStyle : hoverStyle
                              }`;
                           }}
                        >
                           {item.icon}
                           {isOpen && <span>{item.name}</span>}
                        </NavLink>
                     ))}
                  </div>
               </div>
            ))}
         </nav>
      </div>
   );
}
