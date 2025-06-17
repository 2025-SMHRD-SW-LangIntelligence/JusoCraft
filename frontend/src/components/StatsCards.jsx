import {
   FaUsers,
   FaFire,
   FaCheckCircle,
   FaClipboardList,
} from "react-icons/fa";
import { BsFire } from "react-icons/bs";
import { TbShieldCheckFilled } from "react-icons/tb";
import StatsCard from "./StatsCard";
import { TbMessageReportFilled } from "react-icons/tb";

export default function StatsCards() {
   // 예시 데이터
   const stats = [
      {
         icon: <FaUsers className="w-7 h-7" />,
         title: "오늘 신고",
         value: 1,
         bgColor: "from-blue-600 to-blue-400 shadow-blue-500/40",
      },
      {
         icon: <TbMessageReportFilled className="w-7 h-7" />,
         title: "접수",
         value: 1235,
      },
      {
         icon: <BsFire className="w-7 h-7" />,
         title: "출동",
         value: 1230,
      },
      {
         icon: <TbShieldCheckFilled className="w-7 h-7" />,
         title: "완료",
         value: 1225,
         bgColor: "from-green-600 to-green-400 shadow-green-500/40",
      },
   ];

   return (
      <div className="flex gap-6">
         {stats.map((stat) => (
            <div key={stat.title} className="flex-1">
               <StatsCard {...stat} />
            </div>
         ))}
      </div>
   );
}
