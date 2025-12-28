import React from "react";
import { BsExclamationCircle } from "react-icons/bs";

interface ErrorInputProps {
    children?: React.ReactNode;
    className?: string;
}

const ErrorInput = ({children, className}: ErrorInputProps) => {
    return (
        <div className={`text-red-500 text-xs font-light flex items-center gap-1 ${className}`}><BsExclamationCircle /> {children}</div>
    )
}

export default ErrorInput