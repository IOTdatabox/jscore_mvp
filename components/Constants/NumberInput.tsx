import React from 'react';

interface NumberInputProps {
    label: string;
    placeholder: string;
    value?: number;
    onValueChange: (value: number) => void; // Callback function to notify parent component
}

const NumberInput: React.FC<NumberInputProps> = ({ label, placeholder,value,  onValueChange }) => {
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const numericValue = parseFloat(event.target.value);
        if (!isNaN(numericValue)) {
            onValueChange(numericValue);
        }
    };

    return (
        <div className="w-full px-3 mb-6 md:mb-2">
            <div className="flex-grow">
                <label className="block tracking-wide text-gray-700 text-xs font-bold mb-2">
                    {label}
                </label>
                <input
                    className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-2 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                    type="number"
                    value={value}
                    placeholder={placeholder}
                    onChange={handleChange} // Attach the change handler
                />
            </div>
        </div>
    );
};

export default NumberInput;
