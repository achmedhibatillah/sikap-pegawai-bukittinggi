import React, { useState } from "react";
import { IoClose } from "react-icons/io5";

interface ErrorFlashProps {
  children?: React.ReactNode;
}

const ErrorFlash = ({ children }: ErrorFlashProps) => {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <div
      className="
        relative
        rounded-md
        border border-red-400
        bg-red-500/10
        px-8 py-3
        text-center
        text-xs
        font-light
        text-red-600
      "
    >
      <button
        type="button"
        onClick={() => setVisible(false)}
        className="
            cursor-pointer
            absolute
            right-2
            top-2
            text-red-500
            hover:text-red-700
        "
        aria-label="Close"
      >
        <IoClose size={16} />
      </button>

      {children}
    </div>
  );
};

export default ErrorFlash;
