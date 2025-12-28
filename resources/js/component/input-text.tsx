import React, { useRef, useEffect } from "react";

type InputTextProps = {
  type?: string;
  className?: string;
  name?: string;
  id?: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  disabled?: boolean;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  noCapital?: boolean;
  noCharacter?: boolean;
  noSpace?: boolean;
  isSlug?: boolean;
  entered?: boolean;
};

export default function InputText({
  type = "text",
  className = "",
  name,
  id,
  placeholder,
  value,
  onChange,
  disabled = false,
  onKeyDown,
  onBlur,
  noCapital = false,
  noCharacter = false,
  noSpace = false,
  isSlug = false,
  entered = false,
}: InputTextProps) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    let val = e.target.value;

    if (noCapital) {
      val = val.replace(/[A-Z]/g, "");
    }

    if (noCharacter) {
      val = val.replace(/[A-Za-z]/g, "");
    }

    if (noSpace) {
      val = val.replace(/\s+/g, "");
    }

    if (isSlug) {
      val = val.toLowerCase().replace(/[^a-z0-9-]/g, "");
    }

    e.target.value = val;
    onChange(e);

    // auto resize kalau textarea
    if (entered && textareaRef.current) {
      textareaRef.current.style.height = "auto"; // reset dulu
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    if (onKeyDown) onKeyDown(e);
  };

  useEffect(() => {
    if (entered && textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [value, entered]);

  if (entered) {
    return (
      <textarea
        ref={textareaRef}
        name={name}
        id={id}
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onBlur={onBlur}
        disabled={disabled}
        className={`${className} block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm
          focus:outline-none focus:ring-indigo-300 focus:border-indigo-300
          transition-colors duration-200 resize-none
          ${disabled ? "bg-gray-100 cursor-not-allowed" : ""}`}
      />
    );
  }

  return (
    <input
      type={type}
      name={name}
      id={id}
      autoComplete="off"
      placeholder={placeholder}
      value={value}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      onBlur={onBlur}
      disabled={disabled}
      className={`${className} block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm
        focus:outline-none focus:ring-indigo-300 focus:border-indigo-300
        transition-colors duration-200
        ${disabled ? "bg-gray-100 cursor-not-allowed" : ""}`}
    />
  );
}
