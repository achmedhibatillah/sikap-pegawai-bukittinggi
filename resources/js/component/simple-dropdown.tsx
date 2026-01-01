import React, { useState, useRef, useEffect } from 'react';

type Option = {
    value: string | number;
    label: string;
    [key: string]: any;
};

type SimpleDropdownProps = {
    options?: Option[];
    className?: string;
    name?: string;
    id?: string;
    placeholder?: string;
    value?: Option | null;
    onChange?: (selected: Option | null) => void;
    disabled?: boolean;
    renderOption?: (opt: Option) => React.ReactNode;
};

export default function SimpleDropdown({
    options = [],
    className = '',
    name,
    id,
    placeholder = 'Pilih...',
    value = null,
    onChange,
    disabled = false,
    renderOption,
}: SimpleDropdownProps) {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const dropdownRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (selected: Option) => {
        onChange && onChange(selected);
        setIsOpen(false);
    };

    return (
        <div className={`relative ${className}`} ref={dropdownRef}>
            <button
                type="button"
                name={name}
                id={id}
                onClick={() => !disabled && setIsOpen(!isOpen)}
                disabled={disabled}
                className={`block w-full px-3 py-2.5 text-left border border-gray-300 rounded-lg shadow-sm
                    focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-300
                    transition-colors duration-200
                    ${disabled 
                        ? 'bg-gray-100 text-gray-500 cursor-not-allowed' 
                        : 'bg-white text-gray-900 cursor-pointer hover:border-gray-400'
                    }`}
            >
                <span className="block truncate">
                    {value?.label || placeholder}
                </span>
                <span className={`absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none
                    transition-transform duration-200 ${isOpen ? 'rotate-180' : 'rotate-0'}`}>
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </span>
            </button>

            {isOpen && options.length > 0 && (
                <ul className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
                    {options.map(opt => (
                        <li
                            key={String(opt.value)}
                            onClick={() => handleSelect(opt)}
                            className={`cursor-pointer px-3 py-2.5 transition-colors duration-150 ${
                                value?.value === opt.value 
                                    ? 'bg-emerald-50 text-emerald-700 font-medium' 
                                    : 'hover:bg-gray-100 text-gray-700'
                            }`}
                        >
                            {renderOption ? renderOption(opt) : opt.label}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

