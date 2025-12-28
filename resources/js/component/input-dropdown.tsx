import React, { useState, useRef, useEffect } from 'react';

type Option = {
    value: string | number;
    label: string;
    [key: string]: any;
};

type InputDropdownProps = {
    options?: Option[];
    className?: string;
    name?: string;
    id?: string;
    placeholder?: string;
    value?: Option | null;
    onChange?: (selected: Option | null) => void;
    disabled?: boolean;
    onSearchChange?: (q: string) => void;
    renderOption?: (opt: Option) => React.ReactNode;
};

export default function InputDropdown({
    options = [],
    className = '',
    name,
    id,
    placeholder = '',
    value = null,
    onChange,
    disabled = false,
    onSearchChange,
    renderOption,
}: InputDropdownProps) {
    const [search, setSearch] = useState<string>(value?.label || '');
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const dropdownRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        setSearch(value?.label || '');
    }, [value]);

    const filteredOptions = options.filter(opt =>
        opt.label.toLowerCase().includes(search.toLowerCase())
    );

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
        setSearch(selected.label);
        onChange && onChange(selected);
        setIsOpen(false);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setSearch(val);
        setIsOpen(true);

        if (val === '') {
            onChange && onChange(null);
        }

        onSearchChange && onSearchChange(val);
    };

    return (
        <div className={`relative ${className}`} ref={dropdownRef}>
            <div className="relative">
                <input
                    type="text"
                    name={name}
                    id={id}
                    autoComplete="off"
                    placeholder={placeholder}
                    value={search}
                    onChange={handleInputChange}
                    disabled={disabled}
                    className={`block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm
                        focus:outline-none focus:ring-indigo-300 focus:border-indigo-300
                        transition-colors duration-200
                        ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                    onClick={() => !disabled && setIsOpen(!isOpen)}
                />

                <i
                    className={`fas fa-chevron-down absolute right-3 top-1/2 transform -translate-y-1/2
                        transition-transform duration-200 ${isOpen ? 'rotate-180' : 'rotate-0'}`}
                />
            </div>

            {isOpen && filteredOptions.length > 0 && (
                <ul className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                    {filteredOptions.map(opt => (
                        <li
                            key={String(opt.value)}
                            onClick={() => handleSelect(opt)}
                            className="cursor-pointer hover:bg-indigo-100 px-3 py-2"
                        >
                            {renderOption ? renderOption(opt) : opt.label}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
