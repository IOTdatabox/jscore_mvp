import React from 'react';

interface DropdownProps {
    label: string;
    options: string[];
    onSelectionChange: (selectedValue: string) => void;

}

const Dropdown: React.FC<DropdownProps> = ({ label, options, onSelectionChange }) => {
    return (
        <div className="w-full px-3 mb-6 md:mb-2">
            <div className="flex-grow">

                <label className="block tracking-wide text-gray-700 text-xs font-bold mb-2 pl-1">
                    {label}
                </label>
                <div className="relative">
                    <select
                        onChange={(e) => onSelectionChange(e.target.value)}
                        className="block appearance-none w-full bg-gray-200 border border-gray-200 text-gray-700 py-2 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500" id="dropdown-select">
                        {options.map((option, index) => (
                            <option key={index} value={option}>
                                {option}
                            </option>
                        ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                        </svg>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dropdown;
