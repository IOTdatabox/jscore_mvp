import { useEffect, useState } from 'react';
import PageBanner from '../PageBanner';
import { CpuChipIcon } from '@heroicons/react/24/outline';
import Dropdown from './DropDown';
import NumberInput from './NumberInput';
import AllocationInput from './AllocationInput';
import Spinner from '../Spinner';

const PortfolioVisualizer = () => {

    useEffect(() => {
        // 
    }, []);

    const inflatoinOption = ['Yes', 'No'];
    const taxOptions = ['Pre-Tax Return', 'After-Tax Return'];
    const investmentOptions = ['Simulated Period', 'Perpetual'];
    const returnRiskOptions = ['No Adjustments', 'Worst 1 Year First',
        'Worst 2 Years First', 'Worst 3 Years First', 'Worst 4 Years First', 'Worst 5 Years First',
        'Worst 6 Years First', 'Worst 7 Years First', 'Worst 8 Years First', 'Worst 9 Years First',
        'Worst 10 Years First'
    ];
    const rebalancingOption = ['No rebalancing', 'Rebalance annually', 'Rebalance semi-annually',
        'Rebalance quarterly', 'Rebalance monthly'];

    const [isSaving, setIsSaving] = useState<boolean>(false);

    const [federalTax, setFederalTax] = useState('');
    const [capitalTax, setCapitalTax] = useState('');
    const [dividendTax, setDividendTax] = useState('');
    const [affordableTax, setAffordableTax] = useState('');
    const [stateTax, setStateTax] = useState('');
    const [assetAllocations, setAssetAllocations] = useState<string[]>([]);
    const [allocationAmounts, setAllocationAmounts] = useState<number[]>([]); // Array to hold allocation amounts





    const handleInflationAdjustedChange = () => (selectedValue: string) => {
        console.log('Inflation Adjusted', selectedValue);
        // Additional logic to handle the change...
    };
    const handleTaxTypeChange = () => (selectedValue: string) => {
        console.log('Tax Treatment', selectedValue);
        // Additional logic to handle the change...
    };
    const handleInvestmentChange = () => (selectedValue: string) => {
        console.log('Inflation Adjusted', selectedValue);
        // Additional logic to handle the change...
    };
    const handleFederalTaxChange = (newFederalTax: string) => {
        console.log(newFederalTax);
        setFederalTax(newFederalTax); // Update state with new zip value
        // Additional logic can be performed here if needed
    };
    const handleCapitalTaxChange = (newCapitalTax: string) => {
        console.log(newCapitalTax)
        setCapitalTax(newCapitalTax); // Update state with new zip value
        // Additional logic can be performed here if needed
    };
    const handleDividendTaxChange = (newDividendTax: string) => {
        console.log(newDividendTax)
        setDividendTax(newDividendTax); // Update state with new zip value
        // Additional logic can be performed here if needed
    };
    const handleAffordableTaxChange = (newAffordableTax: string) => {
        console.log(newAffordableTax);
        setAffordableTax(newAffordableTax); // Update state with new zip value
        // Additional logic can be performed here if needed
    };
    const handleStateTaxChange = (newStateTax: string) => {
        console.log(newStateTax);
        setStateTax(newStateTax); // Update state with new zip value
        // Additional logic can be performed here if needed
    };

    const handleReturnRiskChange = () => (selectedValue: string) => {
        console.log('Sequence of Returns Risk', selectedValue);
        // Additional logic to handle the change...
    };
    const handleRebalancingChange = () => (selectedValue: string) => {
        console.log('Rebalancing', selectedValue);
        // Additional logic to handle the change...
    };

    const handleAssetChange = (assetIndex: number) => (selectedValue: string) => {
        console.log(`Asset ${assetIndex + 1} selected:`, selectedValue);
    };

    const handleAmountChange = (assetIndex: number) => (newAmount: number) => {
        console.log(`Asset ${assetIndex + 1} selected:`, newAmount);
        const updatedAllocationAmounts = [...allocationAmounts];
        updatedAllocationAmounts[assetIndex] = newAmount;
        setAllocationAmounts(updatedAllocationAmounts);
    };

    const handleSaveClick = () => {
        setIsSaving(true);

        console.log("Save Clicked");
        setIsSaving(false);

    }


    return (
        <>
            <PageBanner
                title={'Portfolio Visualizer'}
                description={'The Portfolio Visualizer Setting allows admins to quickly edit monte carlo simulation parameters.'}
                icon={<CpuChipIcon className='w-6 h-6 mr-2 text-primary-cyan' />}
            />
            <section className='mt-5'>
                <div className="relative overflow-hidden bg-white shadow-md dark:bg-gray-800 rounded-[15px]">
                    <div className="flex flex-col px-4 py-3 space-y-3 lg:flex-row lg:items-center lg:justify-between lg:space-y-0 lg:space-x-4">
                        <div className="mx-3 lg:w-1/2 w-full">
                            <Dropdown
                                label="Inflatoin Adjusted"
                                options={inflatoinOption}
                                onSelectionChange={handleInflationAdjustedChange()}
                            />
                            <Dropdown
                                label="Tax Treatment"
                                options={taxOptions}
                                onSelectionChange={handleTaxTypeChange()}
                            />
                            {/* When After-tax Returns is chosen.*/}
                            <Dropdown
                                label="Investment Horizon"
                                options={investmentOptions}
                                onSelectionChange={handleInvestmentChange()}
                            />
                            <NumberInput
                                label="Federal Income Tax"
                                placeholder="12345"
                                onValueChange={handleFederalTaxChange}
                            />
                            <NumberInput
                                label="Capital Gains Tax"
                                placeholder="12345"
                                onValueChange={handleCapitalTaxChange}
                            />
                            <NumberInput
                                label="Dividend Tax"
                                placeholder="12345"
                                onValueChange={handleDividendTaxChange}
                            />
                            <NumberInput
                                label="Affordable Care Act Tax"
                                placeholder="12345"
                                onValueChange={handleAffordableTaxChange}
                            />
                            <NumberInput
                                label="State Income Tax"
                                placeholder="12345"
                                onValueChange={handleStateTaxChange}
                            />
                            {/* When After-tax Returns is chosen.*/}
                            <Dropdown
                                label="Sequence of Returns Risk"
                                options={returnRiskOptions}
                                onSelectionChange={handleReturnRiskChange()}
                            />
                            <Dropdown
                                label="Rebalancing "
                                options={rebalancingOption}
                                onSelectionChange={handleRebalancingChange()}
                            />
                        </div>
                        <div className="mx-3 lg:w-1/2 w-full">
                            {Array.from({ length: 10 }, (_, index) => (
                                <AllocationInput
                                    key={index + 1}
                                    label={`Asset ${index + 1}`}
                                    onSelectionChange={handleAssetChange(index)}
                                    onAmountChange={handleAmountChange(index)} // Pass the new handler here
                                />
                            ))}
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
export default PortfolioVisualizer;