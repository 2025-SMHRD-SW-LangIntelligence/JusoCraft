import { useState } from "react";
import { MdOutlineArrowDropDown } from "react-icons/md";

function UrlTable({ urls, reports }) {
    const [showAll, setShowAll] = useState(false);

    // 최신순 정렬 (createdAt이나 reportId 기준으로 정렬)
    const sortedUrls = [...urls].sort(
        (a, b) => b.reportId - a.reportId // 혹은 b.createdAt - a.createdAt
    );

    // 5개 또는 10개 제한
    const visibleUrls = sortedUrls.slice(0, showAll ? 10 : 5);

    return (
        <div className="rounded-2xl border border-gray-200 bg-white">
            <div className="px-6 pt-4">
                <h3 className="text-base font-medium text-gray-800">
                    생성된 URL 목록
                </h3>
            </div>

            <div className="p-4 border-gray-100 sm:p-6">
                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                    <div className="max-w-full overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead className="border-b border-gray-100 bg-neutral-50">
                                <tr>
                                    <th className="px-4 py-4 text-center text-xs font-medium text-gray-500">
                                        신고 ID
                                    </th>
                                    <th className="px-4 py-4 text-center text-xs font-medium text-gray-500">
                                        연락처
                                    </th>
                                    <th className="px-2 py-4 text-center text-xs font-medium text-gray-500">
                                        URL
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-100">
                                {visibleUrls.map((entry, idx) => {
                                    const matchedReport = reports.find(
                                        (r) => r.id === entry.reportId
                                    );

                                    return (
                                        <tr key={idx}>
                                            <td className="px-2 py-2 text-gray-700 text-center">
                                                {matchedReport ? (
                                                    entry.reportId
                                                ) : (
                                                    <span className="text-sm text-gray-400">
                                                        미제출
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-2 py-2 text-gray-700 text-center">
                                                {matchedReport?.reporterPhone ||
                                                    entry.phone ||
                                                    "-"}
                                            </td>
                                            <td className="px-2 py-4 text-blue-600 break-all text-left text-sm max-w-[400px] truncate whitespace-nowrap overflow-hidden">
                                                <a
                                                    href={entry.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="hover:underline"
                                                >
                                                    {entry.url}
                                                </a>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* 전체보기 토글 아이콘 */}
                    {sortedUrls.length > 5 && (
                        <div className="flex justify-center bg-gray-100 border-t">
                            <button
                                onClick={() => setShowAll((prev) => !prev)}
                                className="flex items-center justify-center w-full h-full text-gray-600 hover:text-gray-800"
                                aria-label={showAll ? "간략히 보기" : "더 보기"}
                                title={showAll ? "간략히 보기" : "더 보기"}
                            >
                                <MdOutlineArrowDropDown
                                    size={20}
                                    className={`transition-transform duration-100 ${
                                        showAll ? "rotate-180" : ""
                                    }`}
                                />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default UrlTable;
