import { AwaitedReactNode, JSXElementConstructor, Key, ReactElement, ReactNode, ReactPortal, useEffect, useState } from 'react';
import { useRouter } from 'next/router';

import PageBanner from '../PageBanner';
import { TableCellsIcon } from '@heroicons/react/24/outline';
import Spinner from '../Spinner';

const BALANCE_TYPES = [
    "Cash",
    "Non-qualified",
    "Qualified (401k IRA)",
    "Qualified (401k IRA) Spouse",
    "Roth IRA",
    "Deferred Annuity",
    "Life Insurance Cash Value"
];

const Result = () => {
    const router = useRouter();


    const [data, setData] = useState<any>({});

    const [loading, setLoading] = useState<boolean>(true);


    useEffect(() => {
        const fetchResult = async (token: any) => {
            try {
                const response = await fetch(`/api/result?id=${token}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    throw new Error(`Error: ${response.statusText}`);
                }
                const result = await response.json();
                console.log('fecthed result', result);
                setData(result.results[0] || {});
                setLoading(false);

            } catch (error) {
                console.error('Failed to fetch result:', error);
                setLoading(false);
            }
        };
        const token = router.query.token;

        if (token) {
            fetchResult(token);
        }
    }, [router.query.token]);


    return (
        <>
            <PageBanner
                title={'Result'}
                description={'Our solution provides investment strategies to achieve optimized net present value.'}
                icon={<TableCellsIcon className='w-6 h-6 mr-2 text-primary-cyan' />}
            />
            <section className='mt-5'>
                <div className="relative overflow-hidden bg-white shadow-md dark:bg-gray-800 rounded-[15px]">
                    {/* <div className='pl-5 pt-5 flex items-center text-lg font-semibold leading-6 text-gray-900 dark:text-white'>
                        Division Result
                    </div> */}
                    <div className="flex flex-col px-4 py-3 space-y-3 lg:flex-row lg:items-center lg:justify-between lg:space-y-0 lg:space-x-4">
                        <div className="flex flex-row mx-3 w-full">
                            {loading ? (
                                <Spinner /> // Showing a spinner while loading the data
                            ) : (
                                <div className="overflow-x-auto">
                                    <div className='flex flex-row mb-5'>
                                        <div className="px-6 py-3 whitespace-nowrap text-lg font-medium text-gray-900 dark:text-white">
                                            Optimized Present Value :
                                        </div>
                                        <div className="px-6 py-3 whitespace-nowrap text-lg text-gray-900 dark:text-white">
                                            {Math.round(data.presentValue)}
                                        </div>
                                    </div>
                                    <div className='flex flex-row mb-5'>
                                        <div className="px-6 py-3 whitespace-nowrap text-lg font-medium text-gray-900 dark:text-white">
                                            Optimized Filed Age :
                                        </div>
                                        <div className="px-6 py-3 whitespace-nowrap text-lg text-gray-900 dark:text-white">
                                            {( data.maxF !== undefined && data.maxF != 0) ? data.maxF : "When social security is fixed, we do not estimate the optimal filed age."}
                                        </div>
                                    </div>
                                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                        <thead>
                                            <tr>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Type / Year
                                                </th>
                                                {Array.from(Array(data.totalYears + 1).keys()).map(year => (
                                                    <th key={year} scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        {new Date().getFullYear() + year}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                                            <tr>
                                                <td className="px-6 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                                    All Cash Sources
                                                </td>
                                                {data.valueOfTotalIncome && data.valueOfTotalIncome.map((value: number, index: Key) => (
                                                    <td key={index} className="px-6 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                                        {Math.round(value)}
                                                    </td>
                                                ))}
                                            </tr>
                                            <tr>
                                                <td className="px-6 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                                    Total Expenses
                                                </td>
                                                {data.valueOfTotalExpenses && data.valueOfTotalExpenses.map((value: number, index: Key) => (
                                                    <td key={index} className="px-6 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                                        {Math.round(value)}
                                                    </td>
                                                ))}
                                            </tr>
                                            <tr>
                                                <td className="px-6 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                                    Social Security
                                                </td>
                                                {data.valueofSocialSecurity && data.valueofSocialSecurity.map((value: number, index: Key) => (
                                                    <td key={index} className="px-6 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                                        {Math.round(value)}
                                                    </td>
                                                ))}
                                            </tr>
                                            <tr>
                                                <td className="px-6 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                                    Social Security Spouse
                                                </td>
                                                {data.valueofSocialSecuritySpouse && data.valueofSocialSecuritySpouse.map((value: number, index: Key) => (
                                                    <td key={index} className="px-6 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                                        {Math.round(value)}
                                                    </td>
                                                ))}
                                            </tr>
                                            <tr>
                                                <td className="px-6 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                                    APTC
                                                </td>
                                                {data.valueofAPTC && data.valueofAPTC.map((value: number, index: Key) => (
                                                    <td key={index} className="px-6 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                                        {Math.round(value)}
                                                    </td>
                                                ))}
                                            </tr>
                                            <tr>
                                                <td className="px-6 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                                    IRMAA
                                                </td>
                                                {data.valueofIRMAA && data.valueofIRMAA.map((value: number, index: Key) => (
                                                    <td key={index} className="px-6 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                                        {Math.round(value)}
                                                    </td>
                                                ))}
                                            </tr>
                                            {BALANCE_TYPES.map((balanceType, i) => (
                                                <tr key={`withdrawal-${i}`}>
                                                    <td className="px-6 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                                        Withdrawal ({balanceType})
                                                    </td>
                                                    {data.withdrawalAmount && data.withdrawalAmount[i] && data.withdrawalAmount[i].map((amount: number, index: Key) => (
                                                        <td key={index} className="px-6 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                                            {Math.round(amount)}
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))}
                                            {BALANCE_TYPES.map((balanceType, i) => (
                                                <tr key={`portfolio-${i}`}>
                                                    <td className="px-6 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                                        Balance ({balanceType})
                                                    </td>
                                                    {data.portfolioForEachYears && data.portfolioForEachYears[i] && data.portfolioForEachYears[i].map((value: number, index: Key) => (
                                                        <td key={index} className="px-6 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                                            {Math.round(value)}
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))}
                                            {BALANCE_TYPES.map((balanceType, i) => (
                                                <tr key={`portfolio-${i}`}>
                                                    <td className="px-6 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                                        Rate of Return ({balanceType})
                                                    </td>
                                                    {data.trrNominal && data.trrNominal[i] && data.trrNominal[i].map((value: number, index: Key) => (
                                                        <td key={index} className="px-6 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                                            {value}
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))}

                                            <tr>
                                                <td className="px-6 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                                    Net Worth
                                                </td>
                                                {data.totalNetWorth && data.totalNetWorth.map((worth: number, index: Key) => (
                                                    <td key={index} className="px-6 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                                        {Math.round(worth)}
                                                    </td>
                                                ))}
                                            </tr>
                                            <tr>
                                                <td className="px-6 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                                    Jae Adjusted
                                                </td>
                                                {data.divisionResults && data.divisionResults.map((result: number, index: Key) => (
                                                    <td key={index} className="px-6 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                                        {Math.round(result)}
                                                    </td>
                                                ))}
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            )}

                        </div>
                    </div>
                </div>
            </section>

        </>
    )
}
export default Result;