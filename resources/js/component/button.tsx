import React from "react";
import clsx from "clsx";

type ButtonColor = "basic" | "middle" | "main" | "secondary" | "success" | "warning" | "danger";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  color?: ButtonColor;
  loading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  children,
  color = "main",
  loading = false,
  fullWidth = false,
  icon,
  disabled,
  className,
  ...props
}) => {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={clsx(
        "inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all",
        "focus:outline-none focus:ring-2 focus:ring-offset-2 cursor-pointer",
        {
        "bg-[var(--color-main)] text-gray-800 hover:brightness-95 focus:ring-[var(--color-main)]":
            color === "main",

        "bg-[var(--color-middle)] text-gray-800 hover:brightness-95 focus:ring-[var(--color-middle)]":
            color === "middle",

        "bg-[var(--color-basic)] text-gray-700 hover:bg-[var(--color-middle)] focus:ring-[var(--color-middle)]":
            color === "basic",

        "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100 focus:ring-gray-300":
            color === "secondary",

        "bg-green-600 text-white hover:bg-green-700 focus:ring-green-600":
            color === "success",

        "bg-yellow-400 text-yellow-900 hover:bg-yellow-500 focus:ring-yellow-400":
            color === "warning",

        "bg-red-600 text-white hover:bg-red-700 focus:ring-red-600":
            color === "danger",

        "w-full": fullWidth,
        "opacity-50 cursor-not-allowed": disabled || loading,
        },
        className
      )}
    >
      {loading && (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-gray-600 border-t-transparent" />
      )}

      {!loading && icon}
      <span>{children}</span>
    </button>
  );
};

export default Button;
