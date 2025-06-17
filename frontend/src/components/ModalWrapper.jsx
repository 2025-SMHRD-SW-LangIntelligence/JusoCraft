// components/ModalWrapper.tsx
import { CgClose } from "react-icons/cg";

export default function ModalWrapper({
   title,
   onClose,
   children,
   size = "md", // 기본값 'md'
}) {
   const sizeClass = {
      sm: "max-w-sm",
      md: "max-w-md",
      lg: "max-w-3xl",
      xl: "max-w-[100rem]",
   }[size];

   return (
      <div className="fixed inset-0 z-[600] flex items-center justify-center bg-black bg-opacity-50 p-4 overflow-y-auto">
         <div
            className={`bg-white rounded-lg shadow-lg w-full ${sizeClass} max-h-[90vh] flex flex-col`}
         >
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b px-5 py-4 shrink-0">
               <h3 className="font-bold text-lg">{title}</h3>
               <button
                  onClick={onClose}
                  className="ms-auto -mx-1.5 -my-1.5 text-gray-500 hover:text-gray-900 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 hover:bg-gray-100 inline-flex items-center justify-center h-8 w-8"
               >
                  <CgClose className="w-5 h-5" />
               </button>
            </div>

            {/* Modal Body (스크롤 가능) */}
            <div className="p-5 overflow-y-auto max-h-[75vh]">{children}</div>
         </div>
      </div>
   );
}
