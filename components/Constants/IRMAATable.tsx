import React from 'react';

interface medicarePremium {
    individual: string;
    joint: string;
    partB: string;
    partD: string;
}

interface MedicarePremiumProps {
    medicarePremiums: medicarePremium[];
    onUpdate: (index: number, key: keyof medicarePremium, value: string) => void;
}

const IRMAATable = ({ medicarePremiums, onUpdate }: MedicarePremiumProps) => {
    const handleChange = (index: number, key: keyof medicarePremium, value: string) => {
        onUpdate(index, key, value);
    };
    return (
        <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
            <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                    <tr>
                        <th scope="col" className="px-6 py-3">
                            Individual
                        </th>
                        <th scope="col" className="px-6 py-3">
                            Joint
                        </th>
                        <th scope="col" className="px-6 py-3">
                            Part B Premium
                        </th>
                        <th scope="col" className="px-6 py-3">
                            Part D Premium
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {medicarePremiums.map((medicarePremium, index) => (
                        <tr key={index} className={`bg-${index % 2 === 0 ? 'white' : 'gray-50'} 
                dark:bg-${index % 2 === 0 ? 'gray-800' : 'gray-900'}
                border-b dark:border-gray-700`}>

                            <td className="px-6 py-4">
                                <input
                                    type="text"
                                    value={medicarePremium.individual}
                                    onChange={(e) => handleChange(index, 'individual', e.target.value)}
                                    className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-2 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                                />
                            </td>
                            <td className="px-6 py-4">
                                <input
                                    type="text"
                                    value={medicarePremium.joint}
                                    onChange={(e) => handleChange(index, 'joint', e.target.value)}
                                    className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-2 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                                />
                            </td>
                            <td className="px-6 py-4">
                                <input
                                    type="text"
                                    value={medicarePremium.partB}
                                    onChange={(e) => handleChange(index, 'partB', e.target.value)}
                                    className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-2 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                                />
                            </td>
                            <td className="px-6 py-4">
                                <input
                                    type="text"
                                    value={medicarePremium.partD}
                                    onChange={(e) => handleChange(index, 'partD', e.target.value)}
                                    className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-2 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                                />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default IRMAATable;
