import { useEffect, useState } from 'react';
import PageBanner from '../PageBanner';
import { TableCellsIcon } from '@heroicons/react/24/outline';
import Spinner from '../Spinner';
import IRMAATable from './IRMAATable';
import { MedicarePremium, RMDValue } from '@/utils/constant.type';
import RMDTable from './RMDTable';
import NumberInput from './NumberInput';

const OtherConstraint = () => {
    const [isSaving, setIsSaving] = useState<boolean>(false);

    const handleSaveClick = async () => {
        setIsSaving(true);
        try {
            // Save Medicare premiums
            console.log("medicarePremiums", medicarePremiums);
            const premiumResponse = await fetch('/api/irmaasettings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ premiums: medicarePremiums })
            });

            if (!premiumResponse.ok) {
                throw new Error(`HTTP error! Status: ${premiumResponse.status}`);
            }

            const premiumsResult = await premiumResponse.json();
            console.log('Medicare premiums saved:', premiumsResult);

            // Save RMD Values
            console.log("rdmValues", rmdValues);

            const rmdResponse = await fetch('/api/rmdsettings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ rmdValues: rmdValues })
            });

            if (!rmdResponse.ok) {
                throw new Error(`HTTP error! Status: ${rmdResponse.status}`);
            }
            const rmdResult = await rmdResponse.json();
            console.log('RMD values saved:', rmdResult);
            const variousRateData = {
                cashRate,
                expenseRate,
                jAdjustedRate,
            };
            const variousRateResponse = await fetch('/api/variousratesettings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(variousRateData)
            });

            if (!variousRateResponse.ok) {
                throw new Error(`HTTP error! status: ${variousRateResponse.status}`);
            }
            const variousRateResult = await variousRateResponse.json();
            console.log('Varrious Rates Saved:', variousRateResult);
        } catch (error) {
            console.error('There was an error saving constraints data', error);
        } finally {
            setIsSaving(false);
        }
    };

    const [medicarePremiums, setMedicarePremiums] = useState<MedicarePremium[]>([]);
    const [rmdValues, setRMDValues] = useState<RMDValue[]>([]);
    const [cashRate, setCashRate] = useState(0);
    const [expenseRate, setExpenseRate] = useState(0);
    const [jAdjustedRate, setJAdjustedRate] = useState(0);


    const updateMedicarePremiums = (index: number, key: keyof MedicarePremium, value: string) => {
        const newPremiums = [...(medicarePremiums || [])];
        newPremiums[index] = { ...newPremiums[index], [key]: value };
        setMedicarePremiums(newPremiums);
    };

    const updateRMDValues = (index: number, key: keyof RMDValue, value: string) => {
        const newValues = [...(rmdValues || [])];
        newValues[index] = { ...newValues[index], [key]: Number(value) };
        setRMDValues(newValues);
    };

    const handleCashRateChange = (newCashRate: number) => {
        console.log(newCashRate);
        setCashRate(newCashRate);
    };
    const handleExpenseRateChange = (newExpenseRate: number) => {
        console.log(newExpenseRate)
        setExpenseRate(newExpenseRate);
    };
    const handleJAdjustedRateChange = (newJAdjustedRate: number) => {
        console.log(newJAdjustedRate)
        setJAdjustedRate(newJAdjustedRate);
    };



    useEffect(() => {
        async function fetchMedicarePremiums() {
            try {
                const response = await fetch('/api/irmaasettings');
                if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
                const loadedPremiums = await response.json();
                setMedicarePremiums(loadedPremiums);
            } catch (error) {
                console.error('An error occurred while fetching Medicare premiums:', error);
            }
        }

        fetchMedicarePremiums();

        async function fetchRMDValues() {
            const response = await fetch('/api/rmdsettings');
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

            const loadedRMDValues = await response.json();
            setRMDValues(loadedRMDValues);
        }

        fetchRMDValues();

        async function fetchVaroiusRates() {
            try {
                const response = await fetch('/api/variousratesettings', { method: 'GET' });
                console.log(response);
                if (!response.ok) throw new Error('Failed to fetch portfolio settings');
                const data = await response.json();

                console.log("data", data);

                // Update local state with fetched data
                setCashRate(data.cashRate);
                setExpenseRate(data.expenseRate);
                setJAdjustedRate(data.jAdjustedRate);
            } catch (error) {
                console.error('An error occurred while initializing settings:', error);
            }
        }

        fetchVaroiusRates();
    }, []);


    return (
        <>
            <PageBanner
                title={'Other Constraint'}
                description={'The Other Constraint Setting allows admins to quickly edit RMD, IRMMA, J Adjusted Value, etc.'}
                icon={<TableCellsIcon className='w-6 h-6 mr-2 text-primary-cyan' />}
            />
            <section className='mt-5'>
                <div className="relative overflow-hidden bg-white shadow-md dark:bg-gray-800 rounded-[15px]">
                    <div className='pl-5 pt-5 flex items-center text-lg font-semibold leading-6 text-gray-900 dark:text-white'>
                        IRMAA Table
                    </div>
                    <div className="flex flex-col px-4 py-3 space-y-3 lg:flex-row lg:items-center lg:justify-between lg:space-y-0 lg:space-x-4">
                        <div className="mx-3 w-full">
                            {medicarePremiums && (
                                <IRMAATable
                                    medicarePremiums={medicarePremiums}
                                    onUpdate={updateMedicarePremiums}
                                />
                            )}
                        </div>
                    </div>
                    <div className='pl-5 pt-5 flex items-center text-lg font-semibold leading-6 text-gray-900 dark:text-white'>
                        RMD Table
                    </div>
                    <div className="flex flex-col px-4 py-3 space-y-3 lg:flex-row lg:items-center lg:justify-between lg:space-y-0 lg:space-x-4">
                        <div className="mx-3 w-full">
                            <RMDTable
                                rmdTableValues={rmdValues}
                                onUpdate={updateRMDValues}
                            />
                        </div>
                    </div>
                    <div className='pl-5 pt-5 flex items-center text-lg font-semibold leading-6 text-gray-900 dark:text-white'>
                        Various Rates
                    </div>
                    <div className="flex flex-col px-4 py-3 space-y-3 lg:flex-row lg:items-center lg:justify-between lg:space-y-0 lg:space-x-4">
                        <div className="flex flex-row mx-3 w-full">
                            <NumberInput
                                label="Cash Rate (Social Security)"
                                placeholder="12345"
                                value={cashRate}
                                onValueChange={handleCashRateChange}
                            />
                            <NumberInput
                                label="Expense Rate"
                                placeholder="12345"
                                value={expenseRate}
                                onValueChange={handleExpenseRateChange}
                            />
                            <NumberInput
                                label="J Adjusted Rate"
                                placeholder="12345"
                                value={jAdjustedRate}
                                onValueChange={handleJAdjustedRateChange}
                            />
                        </div>
                    </div>
                    <div className='m-4 flex items-center justify-end'>
                        <button
                            className="sm:w-fit w-full flex items-center justify-center text-white bg-primary-cyan hover:bg-secondary-cyan focus:ring-4 focus:ring-primary-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-primary-cyan dark:hover:bg-secondary-cyan focus:outline-none dark:focus:ring-secondary-cyan"
                            onClick={handleSaveClick}
                        >
                            {isSaving ? <Spinner text='Saving ...' size={'5'} /> : 'Save'}
                        </button>
                    </div>
                </div>
            </section>

        </>
    )
}
export default OtherConstraint;