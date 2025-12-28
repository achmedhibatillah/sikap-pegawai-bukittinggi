import { ChangeEvent, useState } from "react";
import { IconType } from "react-icons";
import InputText from "./input-text";

interface InputTextAuthProps {
  name: string;
  type: React.HTMLInputTypeAttribute;
  value?: string;
  id?: string;
  placeholder?: string;
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  icon?: IconType;
  disabled?: boolean;
}

const InputTextAuth = ({
  name,
  type,
  id,
  placeholder,
  value,
  onChange,
  icon: Icon,
  disabled
}: InputTextAuthProps) => {
  return (
    <div className="relative">
      {Icon && (
        <Icon className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500" />
      )}

      <InputText
        type={type}
        name={name}
        id={id}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="ps-8 bg-amber-50"
        disabled={disabled}
      />
    </div>
  );
};

export default InputTextAuth;
