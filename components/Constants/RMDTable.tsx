import React from "react";

interface RMDTable {
    age?: number;
    percentage?: number;
}

interface RMDTableProps {
    rmdTableValues: RMDTable[];
    onUpdate: (index: number, key: keyof RMDTable, value: string) => void;
}

const RMDTable = ({ rmdTableValues, onUpdate }: RMDTableProps) => {
    const columns = 4;
    const numberOfRows = Math.ceil(rmdTableValues.length / columns);

    const handleChange = (index: number, key: keyof RMDTable, event: React.ChangeEvent<HTMLInputElement>) => {
        onUpdate(index, key, event.target.value);
    };

    return (
        <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
            <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                    <tr>
                        {Array.from({ length: columns }, (_, i) => (
                            <React.Fragment key={i}>
                                <th scope="col" className="px-3 py-3">Age</th>
                                <th scope="col" className="px-3 py-3">Percentage</th>
                            </React.Fragment>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {Array.from({ length: numberOfRows }).map((_, rowIndex) => (
                        <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-900'}>
                            {Array.from({ length: columns }, (_, colIndex) => {
                                const itemIndex = colIndex * numberOfRows + rowIndex;
                                const item = rmdTableValues[itemIndex];
                                return item ? (
                                    <React.Fragment key={colIndex}>
                                        <td className="px-3 py-4">{item.age}</td>
                                        <td className="px-3 py-4">
                                            <input 
                                                type="number" 
                                                className="border border-gray-300 p-1 rounded"
                                                value={item.percentage} 
                                                onChange={(event) => handleChange(itemIndex, 'percentage', event)}
                                            />
                                        </td>
                                    </React.Fragment>
                                ) : (
                                    <React.Fragment key={colIndex}>
                                        <td className="px-3 py-4"></td>
                                        <td className="px-3 py-4"></td>
                                    </React.Fragment>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default RMDTable;
