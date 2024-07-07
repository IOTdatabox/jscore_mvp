import { useEffect, useState } from 'react';
import PageBanner from '../PageBanner';
import { TableCellsIcon } from '@heroicons/react/24/outline';
import Spinner from '../Spinner';
import NumberInput from './NumberInput';
import { mainProcessForTest } from '@/utils/main-process-test';

const InputForTesting = () => {
    const [isSaving, setIsSaving] = useState<boolean>(false);

    const handleSaveClick = async () => {
        setIsSaving(true);
        try {

            const inputForTestingData = {
                //age
                ageSelf,
                ageSpouse,
                //income
                incomeSelf,
                incomeSpouse,
                incomeDependent,
                incomeSocialSecurity,
                incomeSocialSecuritySpouse,
                incomePension,
                incomeOther,    // Annuity Income + Rental Income + Reverse Mortgage Income
                //balance
                balanceCash,
                balanceQ,
                balanceQSpouse,
                balanceNQ,
                balanceRoth,
                balanceAnnuity,
                balanceLifeInsurance,
                //expense
                expenseHousing,
                expenseTransportation,
                expenseDaily,
                expenseHealth,
            };
            const inpoutForTestingResponse = await fetch('/api/inputfortesting', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(inputForTestingData)
            });

            if (!inpoutForTestingResponse.ok) {
                throw new Error(`HTTP error! status: ${inpoutForTestingResponse.status}`);
            }
            const inputForTestingResult = await inpoutForTestingResponse.json();
            console.log('Input Data For Testing Saved:', inputForTestingResult);
        } catch (error) {
            console.error('There was an error saving input data for testing', error);
        } finally {
            setIsSaving(false);
        }

        const result = await mainProcessForTest();
        console.log('Main Process For Test Result:', result);
    };

    const [ageSelf, setAgeSelf] = useState(0);
    const [ageSpouse, setAgeSpouse] = useState(0);

    const [incomeSelf, setIncomeSelf] = useState(0);
    const [incomeSpouse, setIncomeSpouse] = useState(0);
    const [incomeDependent, setIncomeDependent] = useState(0);
    const [incomeSocialSecurity, setIncomeSocialSecurity] = useState(0);
    const [incomeSocialSecuritySpouse, setIncomeSocialSecuritySpouse] = useState(0);
    const [incomePension, setIncomePension] = useState(0);
    const [incomeOther, setIncomeOther] = useState(0);

    const [balanceCash, setBalanceCash] = useState(0);
    const [balanceQ, setBalanceQ] = useState(0);
    const [balanceQSpouse, setBalanceQSpouse] = useState(0);
    const [balanceNQ, setBalanceNQ] = useState(0);
    const [balanceRoth, setBalanceRoth] = useState(0);
    const [balanceAnnuity, setBalanceAnnuity] = useState(0);
    const [balanceLifeInsurance, setBalanceLifeInsurance] = useState(0);

    const [expenseHousing, setExpenseHousing] = useState(0);
    const [expenseTransportation, setExpenseTransportation] = useState(0);
    const [expenseDaily, setExpenseDaily] = useState(0);
    const [expenseHealth, setExpenseHealth] = useState(0);

    const [taxRateForIncome, setTaxRateForIncome] = useState(0);
    const [taxRateForRoth, setTaxRateForRoth] = useState(0);
    const [taxRateForGains, setTaxRateForGains] = useState(0);


    const handleAgeSelfChange = (newAgeSelf: number) => {
        console.log(newAgeSelf);
        setAgeSelf(newAgeSelf);
    };
    const handleAgeSpouseChange = (newAgeSpouse: number) => {
        console.log(newAgeSpouse);
        setAgeSpouse(newAgeSpouse);
    };

    const handleIncomeSelfChange = (newIncomeSelf: number) => {
        console.log(newIncomeSelf);
        setIncomeSelf(newIncomeSelf);
    };
    const handleIncomeSpouseChange = (newIncomeSpouse: number) => {
        console.log(newIncomeSpouse);
        setIncomeSpouse(newIncomeSpouse);
    };
    const handleIncomeDependentChange = (newIncomeDependent: number) => {
        console.log(newIncomeDependent);
        setIncomeDependent(newIncomeDependent);
    };
    const handleIncomeSocialSecurityChange = (newIncomeSocialSecurity: number) => {
        console.log(newIncomeSocialSecurity);
        setIncomeSocialSecurity(newIncomeSocialSecurity);
    };
    const handleIncomeSocialSecuritySpouseChange = (newIncomeSocialSecuritySpouse: number) => {
        console.log(newIncomeSocialSecuritySpouse);
        setIncomeSocialSecuritySpouse(newIncomeSocialSecuritySpouse);
    };
    const handleIncomePensionChange = (newIncomePension: number) => {
        console.log(newIncomePension);
        setIncomePension(newIncomePension);
    };
    const handleIncomeOtherChange = (newIncomeOther: number) => {
        console.log(newIncomeOther);
        setIncomeOther(newIncomeOther);
    };

    const handleBalanceCashChange = (newBalanceCash: number) => {
        console.log(newBalanceCash);
        setBalanceCash(newBalanceCash);
    };
    const handleBalanceQChange = (newBalanceQ: number) => {
        console.log(newBalanceQ);
        setBalanceQ(newBalanceQ);
    };
    const handleBalanceQSpouseChange = (newBalanceQSpouse: number) => {
        console.log(newBalanceQSpouse);
        setBalanceQSpouse(newBalanceQSpouse);
    };
    const handleBalanceNQChange = (newBalanceNQ: number) => {
        console.log(newBalanceNQ);
        setBalanceNQ(newBalanceNQ);
    };
    const handleBalanceRothChange = (newBalanceRoth: number) => {
        console.log(newBalanceRoth);
        setBalanceRoth(newBalanceRoth);
    };
    const handleBalanceAnnuityChange = (newBalanceAnnuity: number) => {
        console.log(newBalanceAnnuity);
        setBalanceAnnuity(newBalanceAnnuity);
    };
    const handleBalanceLifeInsuranceChange = (newBalanceLifeInsurance: number) => {
        console.log(newBalanceLifeInsurance);
        setBalanceLifeInsurance(newBalanceLifeInsurance);
    };

    const handleExpenseHousingChange = (newExpenseHousing: number) => {
        console.log(newExpenseHousing);
        setExpenseHousing(newExpenseHousing);
    };
    const handleExpenseTransportationChange = (newExpenseTransportation: number) => {
        console.log(newExpenseTransportation);
        setExpenseTransportation(newExpenseTransportation);
    };
    const handleExpenseDailyChange = (newExpenseDaily: number) => {
        console.log(newExpenseDaily);
        setExpenseDaily(newExpenseDaily);
    };
    const handleExpenseHealthChange = (newExpenseHealth: number) => {
        console.log(newExpenseHealth);
        setExpenseHealth(newExpenseHealth);
    };





    useEffect(() => {

        async function fetchInputForTesting() {
            try {
                const response = await fetch('/api/inputfortesting', { method: 'GET' });
                console.log(response);
                if (!response.ok) throw new Error('Failed to fetch input data for testing');
                const data = await response.json();

                console.log("data", data);

                // Update local state with fetched data
                setAgeSelf(data.ageSelf);
                setAgeSpouse(data.ageSpouse);

                setIncomeSelf(data.incomeSelf);
                setIncomeSpouse(data.incomeSpouse);
                setIncomeDependent(data.incomeDependent);
                setIncomeSocialSecurity(data.incomeSocialSecurity);
                setIncomeSocialSecuritySpouse(data.incomeSocialSecuritySpouse);
                setIncomePension(data.incomePension);
                setIncomeOther(data.incomeOther);

                setBalanceCash(data.balanceCash);
                setBalanceQ(data.balanceQ);
                setBalanceQSpouse(data.balanceQSpouse);
                setBalanceNQ(data.balanceNQ);
                setBalanceRoth(data.balanceRoth)
                setBalanceAnnuity(data.balanceAnnuity);
                setBalanceLifeInsurance(data.balanceLifeInsurance);

                setExpenseHousing(data.expenseHousing);
                setExpenseTransportation(data.expenseTransportation);
                setExpenseDaily(data.expenseDaily);
                setExpenseHealth(data.expenseHealth);

            } catch (error) {
                console.error('An error occurred while initializing settings:', error);
            }
        }
        fetchInputForTesting();
    }, []);


    return (
        <>
            <PageBanner
                title={'Input For Testing'}
                description={'It is just to test quickly on behalf of typeform.'}
                icon={<TableCellsIcon className='w-6 h-6 mr-2 text-primary-cyan' />}
            />
            <section className='mt-5'>
                <div className="relative overflow-hidden bg-white shadow-md dark:bg-gray-800 rounded-[15px]">
                <div className='pl-5 pt-5 flex items-center text-lg font-semibold leading-6 text-gray-900 dark:text-white'>
                        Age
                    </div>
                    <div className="flex flex-col px-4 py-3 space-y-3 lg:flex-row lg:items-center lg:justify-between lg:space-y-0 lg:space-x-4">
                        <div className="flex flex-row mx-3 w-full">
                            <NumberInput
                                label="Your Age"
                                placeholder="12345"
                                value={ageSelf}
                                onValueChange={handleAgeSelfChange}
                            />
                            <NumberInput
                                label="Your Spouse's Age"
                                placeholder="12345"
                                value={ageSpouse}
                                onValueChange={handleAgeSpouseChange}
                            />
                        </div>
                    </div>

                    <div className='pl-5 pt-5 flex items-center text-lg font-semibold leading-6 text-gray-900 dark:text-white'>
                        Income
                    </div>
                    <div className="flex flex-col px-4 py-3 space-y-3 lg:flex-row lg:items-center lg:justify-between lg:space-y-0 lg:space-x-4">
                        <div className="flex flex-row mx-3 w-full">
                            <NumberInput
                                label="Annual Income"
                                placeholder="12345"
                                value={incomeSelf}
                                onValueChange={handleIncomeSelfChange}
                            />
                            <NumberInput
                                label="Spouse Income"
                                placeholder="12345"
                                value={incomeSpouse}
                                onValueChange={handleIncomeSpouseChange}
                            />
                            <NumberInput
                                label="Dependent Income"
                                placeholder="12345"
                                value={incomeDependent}
                                onValueChange={handleIncomeDependentChange}
                            />
                            <NumberInput
                                label="Social Security"
                                placeholder="12345"
                                value={incomeSocialSecurity}
                                onValueChange={handleIncomeSocialSecurityChange}
                            />
                            <NumberInput
                                label="Spouse Social Security"
                                placeholder="12345"
                                value={incomeSocialSecuritySpouse}
                                onValueChange={handleIncomeSocialSecuritySpouseChange}
                            />
                            <NumberInput
                                label="Pension Income"
                                placeholder="12345"
                                value={incomePension}
                                onValueChange={handleIncomePensionChange}
                            />
                            <NumberInput
                                label="Other Income"
                                placeholder="12345"
                                value={incomeOther}
                                onValueChange={handleIncomeOtherChange}
                            />
                        </div>
                    </div>
                    <div className='pl-5 pt-5 flex items-center text-lg font-semibold leading-6 text-gray-900 dark:text-white'>
                        Balance
                    </div>
                    <div className="flex flex-col px-4 py-3 space-y-3 lg:flex-row lg:items-center lg:justify-between lg:space-y-0 lg:space-x-4">
                        <div className="flex flex-row mx-3 w-full">
                            <NumberInput
                                label="Cash & Saving"
                                placeholder="12345"
                                value={balanceCash}
                                onValueChange={handleBalanceCashChange}
                            />
                            <NumberInput
                                label="Qualified Fund"
                                placeholder="12345"
                                value={balanceQ}
                                onValueChange={handleBalanceQChange}
                            />
                            <NumberInput
                                label="Spouse Q F"
                                placeholder="12345"
                                value={balanceQSpouse}
                                onValueChange={handleBalanceQSpouseChange}
                            />
                            <NumberInput
                                label="Non-Q Fund"
                                placeholder="12345"
                                value={balanceNQ}
                                onValueChange={handleBalanceNQChange}
                            />
                            <NumberInput
                                label="Roth IRA"
                                placeholder="12345"
                                value={balanceRoth}
                                onValueChange={handleBalanceRothChange}
                            />
                            <NumberInput
                                label="Annuity Balance"
                                placeholder="12345"
                                value={balanceAnnuity}
                                onValueChange={handleBalanceAnnuityChange}
                            />
                            <NumberInput
                                label="Life Insurance"
                                placeholder="12345"
                                value={balanceLifeInsurance}
                                onValueChange={handleBalanceLifeInsuranceChange}
                            />
                        </div>
                    </div>

                    <div className='pl-5 pt-5 flex items-center text-lg font-semibold leading-6 text-gray-900 dark:text-white'>
                        Expense
                    </div>
                    <div className="flex flex-col px-4 py-3 space-y-3 lg:flex-row lg:items-center lg:justify-between lg:space-y-0 lg:space-x-4">
                        <div className="flex flex-row mx-3 w-full">
                            <NumberInput
                                label="Housing"
                                placeholder="12345"
                                value={expenseHousing}
                                onValueChange={handleExpenseHousingChange}
                            />
                            <NumberInput
                                label="Transportation"
                                placeholder="12345"
                                value={expenseTransportation}
                                onValueChange={handleExpenseTransportationChange}
                            />
                            <NumberInput
                                label="Daily Expense"
                                placeholder="12345"
                                value={expenseDaily}
                                onValueChange={handleExpenseDailyChange}
                            />
                            <NumberInput
                                label="Health Insurance"
                                placeholder="12345"
                                value={expenseHealth}
                                onValueChange={handleExpenseHealthChange}
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
export default InputForTesting;