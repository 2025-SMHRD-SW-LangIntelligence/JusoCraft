export default function StatsCard({
   icon,
   title,
   value,
   footerText,
   footerHighlight,
   bgColor = "from-pink-600 to-pink-400 shadow-pink-500/40", // 기본
}) {
   return (
      <div
         className="relative flex flex-col bg-white rounded-xl text-gray-700 shadow-lg border"
         style={{
            boxShadow: "0 2px 10px rgba(0, 0, 0, 0.01)",
         }}
      >
         <div
            className={`absolute -mt-4 left-4 top-0 grid h-16 w-16 place-items-center rounded-xl bg-gradient-to-tr ${bgColor} shadow-lg text-white`}
         >
            {icon}
         </div>
         <div className="p-4 pt-8 text-right">
            <p className="text-sm font-normal text-blue-gray-600 antialiased">
               {title}
            </p>
            <h4 className="font-suit text-3xl font-bold text-blue-gray-900 antialiased">
               {value}
            </h4>
         </div>
         {footerText && (
            <div className="border-t border-blue-gray-50 p-4">
               <p className="text-base font-normal text-blue-gray-600 antialiased">
                  {footerHighlight && (
                     <strong className="text-green-500">
                        {footerHighlight}
                     </strong>
                  )}
                  &nbsp;{footerText}
               </p>
            </div>
         )}
      </div>
   );
}
