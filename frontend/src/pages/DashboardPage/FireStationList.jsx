import { IoMapOutline } from "react-icons/io5";
export default function FireStationList({
   fireLat,
   fireLng,
   stations,
   reportToken,
   onDispatch,
}) {
   const getSortedStations = () => {
      const R = 6371;
      return stations
         .map((s) => {
            const dLat = (s.latitude - fireLat) * (Math.PI / 180);
            const dLng = (s.longitude - fireLng) * (Math.PI / 180);
            const a =
               Math.sin(dLat / 2) ** 2 +
               Math.cos(fireLat * (Math.PI / 180)) *
                  Math.cos(s.latitude * (Math.PI / 180)) *
                  Math.sin(dLng / 2) ** 2;
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            const distance = R * c;
            return { ...s, distance };
         })
         .sort((a, b) => a.distance - b.distance);
   };
   return (
      <div>
         <h3 className="flex items-center gap-2 text-base font-semibold mb-3 text-gray-800">
            <IoMapOutline className="text-xl text-gray-500" />
            가까운 소방서 목록
         </h3>

         <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
            <div className="max-w-full overflow-x-auto">
               <table className="min-w-full text-sm">
                  <thead className="border-b border-gray-100 bg-neutral-50">
                     <tr>
                        <th className="px-2 py-4 text-center text-xs font-medium text-gray-500 whitespace-nowrap">
                           소방서
                        </th>
                        <th className="px-2 py-4 text-center text-xs font-medium text-gray-500 whitespace-nowrap">
                           주소
                        </th>
                        <th className="px-2 py-4 text-center text-xs font-medium text-gray-500 whitespace-nowrap">
                           전화번호
                        </th>
                        <th className="px-2 py-4 text-center text-xs font-medium text-gray-500 whitespace-nowrap">
                           거리 (km)
                        </th>
                        <th className="px-2 py-4 text-center text-xs font-medium text-gray-500 whitespace-nowrap">
                           출동 지시
                        </th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                     {getSortedStations()
                        .slice(0, 10)
                        .map((s) => (
                           <tr key={s.id} className="border-t">
                              <td className="px-2 py-2 text-center">
                                 {s.centerName.replace("119안전센터", "")}
                              </td>
                              <td className="px-2 py-2 text-left">
                                 {s.address}
                              </td>
                              <td className="px-2 py-2 text-center">
                                 {s.phoneNumber}
                              </td>
                              <td className="px-2 py-2 text-center">
                                 {s.distance.toFixed(2)}
                              </td>
                              <td className="px-4 py-2 text-center">
                                 <button
                                    className="px-3 py-1 text-sm rounded-md bg-green-500 text-white hover:bg-green-600 focus:ring-4 focus:outline-none focus:ring-green-200"
                                    onClick={() =>
                                       onDispatch(reportToken, s.id)
                                    }
                                 >
                                    출동 지시
                                 </button>
                              </td>
                           </tr>
                        ))}
                  </tbody>
               </table>
            </div>
         </div>
      </div>
   );
   // return (
   //    <div>
   //       <h4 className="text-sm font-semiboldmb-2">가까운 소방서 목록</h4>
   //       <table className="min-w-full text-left text-sm border">
   //          <thead>
   //             <tr>
   //                <th className="px-4 py-2">센터명</th>
   //                <th className="px-4 py-2">주소</th>
   //                <th className="px-4 py-2">전화번호</th>
   //                <th className="px-4 py-2">거리 (km)</th>
   //                <th className="px-4 py-2">출동 지시</th>
   //             </tr>
   //          </thead>
   //          <tbody>
   //             {getSortedStations()
   //                .slice(0, 5)
   //                .map((s) => (
   //                   <tr key={s.id} className="border-t">
   //                      <td className="px-4 py-2">{s.centerName}</td>
   //                      <td className="px-4 py-2">{s.address}</td>
   //                      <td className="px-4 py-2">{s.phone}</td>
   //                      <td className="px-4 py-2">{s.distance.toFixed(2)}</td>
   //                      <td className="px-4 py-2">
   //                         <button
   //                            className="px-3 py-1 text-sm rounded bg-green-500 text-white hover:bg-green-600"
   //                            onClick={() => onDispatch(reportToken, s.id)}
   //                         >
   //                            출동 지시
   //                         </button>
   //                      </td>
   //                   </tr>
   //                ))}
   //          </tbody>
   //       </table>
   //    </div>
   // );
}
