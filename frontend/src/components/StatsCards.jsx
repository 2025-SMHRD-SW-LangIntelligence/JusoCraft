import { useEffect, useState } from "react";
import axios from "axios";
import { FaUsers } from "react-icons/fa";
import { BsFire } from "react-icons/bs";
import { TbShieldCheckFilled, TbMessageReportFilled } from "react-icons/tb";
import StatsCard from "./StatsCard";

export default function StatsCards() {
   const [stats, setStats] = useState({
      todayReports: 0,
      received: 0,
      dispatched: 0,
      completed: 0,
   });

   const apiUrl = import.meta.env.VITE_API_URL;

   useEffect(() => {
      const fetchStats = async () => {
         try {
            const response = await axios.get(`${apiUrl}/fire-reports/stats`);
            setStats(response.data);
            console.log(response.data);
         } catch (error) {
            console.error("통계 데이터 가져오기 실패", error);
         }
      };

      fetchStats();
   }, []);

   const statsList = [
      {
         icon: <FaUsers className="w-7 h-7" />,
         title: "오늘 신고",
         value: stats.todayReports,
         bgColor: "from-blue-600 to-blue-400 shadow-blue-500/40",
      },
      {
         icon: <TbMessageReportFilled className="w-7 h-7" />,
         title: "소방서 접수",
         value: stats.received,
      },
      {
         icon: <BsFire className="w-7 h-7" />,
         title: "소방서 출동",
         value: stats.dispatched,
      },
      {
         icon: <TbShieldCheckFilled className="w-7 h-7" />,
         title: "진압 완료",
         value: stats.completed,
         bgColor: "from-green-600 to-green-400 shadow-green-500/40",
      },
   ];

   return (
      <div className="flex gap-6">
         {statsList.map((stat) => (
            <div key={stat.title} className="flex-1">
               <StatsCard {...stat} />
            </div>
         ))}
      </div>
   );
}
