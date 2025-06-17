import { useEffect } from "react";
import { BsCheckCircle } from "react-icons/bs";
import { CgClose } from "react-icons/cg";

const Toast = ({ message, onClose }) => {
   useEffect(() => {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
   }, [onClose]);

   return (
      <div
         className="fixed bottom-5 right-5 flex items-center w-full max-w-xs p-4 text-gray-700 bg-white rounded-lg shadow-lg z-[500] border"
         role="alert"
      >
         <div className="inline-flex items-center justify-center shrink-0 w-8 h-8 text-green-500 bg-green-100 rounded-lg">
            <BsCheckCircle className="w-5 h-5" />
            <span className="sr-only">Success icon</span>
         </div>
         <div className="ms-3 text-sm font-normal">{message}</div>
         <button
            onClick={onClose}
            className="ms-auto -mx-1.5 -my-1.5 text-gray-400 hover:text-gray-900 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 hover:bg-gray-100 inline-flex items-center justify-center h-8 w-8"
            aria-label="Close"
         >
            <CgClose className="w-4 h-4" />
         </button>
      </div>
   );
};

export default Toast;
