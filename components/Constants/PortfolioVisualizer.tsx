import { useEffect, useState } from 'react';
import PageBanner from '../PageBanner';
import { CpuChipIcon } from '@heroicons/react/24/outline';
import Dropdown from './DropDown';
import NumberInput from './NumberInput';
import AllocationInput from './AllocationInput';
import Spinner from '../Spinner';

const PortfolioVisualizer = () => {

    const inflationOptions = ['Yes', 'No'];
    const taxOptions = ['Pre-Tax Return', 'After-Tax Return'];
    const investmentOptions = ['Simulated Period', 'Perpetual'];
    const returnRiskOptions = ['No Adjustments', 'Worst 1 Year First',
        'Worst 2 Years First', 'Worst 3 Years First', 'Worst 4 Years First', 'Worst 5 Years First',
        'Worst 6 Years First', 'Worst 7 Years First', 'Worst 8 Years First', 'Worst 9 Years First',
        'Worst 10 Years First'
    ];
    const rebalancingOptions = ['No rebalancing', 'Rebalance annually', 'Rebalance semi-annually',
        'Rebalance quarterly', 'Rebalance monthly'];

    const [isSaving, setIsSaving] = useState<boolean>(false);

    const [inflationOption, setInflationOption] = useState('Yes');
    const [taxOption, setTaxOption] = useState('Pre-Tax Returns');
    const [investmentOption, setInvestmentOption] = useState('Simulated Period');
    const [returnRiskOption, setReturnRiskOption] = useState('No Adjustments');
    const [rebalancingOption, setRebalancingOption] = useState('No rebalancing');

    const [federalTax, setFederalTax] = useState(0);
    const [capitalTax, setCapitalTax] = useState(0);
    const [dividendTax, setDividendTax] = useState(0);
    const [affordableTax, setAffordableTax] = useState(0);
    const [stateTax, setStateTax] = useState(0);
    const [assetAllocations, setAssetAllocations] = useState<string[]>(
        Array(10).fill("TotalStockMarket")
    );
    const [allocationAmounts, setAllocationAmounts] = useState<number[]>(
        Array(10).fill(0)
    );




    const handleInflationAdjustedChange = () => (selectedValue: string) => {
        console.log('Inflation Adjusted', selectedValue);
        setInflationOption(selectedValue);
        // Additional logic to handle the change...
    };
    const handleTaxTypeChange = () => (selectedValue: string) => {
        console.log('Tax Treatment', selectedValue);
        setTaxOption(selectedValue);
        // Additional logic to handle the change...
    };
    const handleInvestmentChange = () => (selectedValue: string) => {
        console.log('Inflation Adjusted', selectedValue);
        setInvestmentOption(selectedValue);
        // Additional logic to handle the change...
    };
    const handleFederalTaxChange = (newFederalTax: number) => {
        console.log(newFederalTax);
        setFederalTax(newFederalTax); // Update state with new zip value
        // Additional logic can be performed here if needed
    };
    const handleCapitalTaxChange = (newCapitalTax: number) => {
        console.log(newCapitalTax)
        setCapitalTax(newCapitalTax); // Update state with new zip value
        // Additional logic can be performed here if needed
    };
    const handleDividendTaxChange = (newDividendTax: number) => {
        console.log(newDividendTax)
        setDividendTax(newDividendTax); // Update state with new zip value
        // Additional logic can be performed here if needed
    };
    const handleAffordableTaxChange = (newAffordableTax: number) => {
        console.log(newAffordableTax);
        setAffordableTax(newAffordableTax); // Update state with new zip value
        // Additional logic can be performed here if needed
    };
    const handleStateTaxChange = (newStateTax: number) => {
        console.log('State Tax',newStateTax);
        setStateTax(newStateTax); // Update state with new zip value
        // Additional logic can be performed here if needed
    };

    const handleReturnRiskChange = () => (selectedValue: string) => {
        console.log('Sequence of Returns Risk', selectedValue);
        setReturnRiskOption(selectedValue);
        // Additional logic to handle the change...
    };
    const handleRebalancingChange = () => (selectedValue: string) => {
        console.log('Rebalancing', selectedValue);
        setRebalancingOption(selectedValue);
        // Additional logic to handle the change...
    };

    const handleAssetChange = (assetIndex: number) => (selectedValue: string) => {
        console.log(`Asset ${assetIndex + 1} selected:`, selectedValue);
        const updatedAssetChange = [...assetAllocations];
        updatedAssetChange[assetIndex] = selectedValue;
        setAssetAllocations(updatedAssetChange);
    };

    const handleAmountChange = (assetIndex: number) => (newAmount: number) => {
        console.log(`Asset ${assetIndex + 1} selected:`, newAmount);
        const updatedAllocationAmounts = [...allocationAmounts];
        updatedAllocationAmounts[assetIndex] = newAmount;
        setAllocationAmounts(updatedAllocationAmounts);
    };

    const handleSaveClick = async () => {
        setIsSaving(true);

        // Gather all the data that you want to save
        const portfolioData = {
            inflationOption,
            taxOption,
            investmentOption,
            returnRiskOption,
            rebalancingOption,
            federalTax,
            capitalTax,
            dividendTax,
            affordableTax,
            stateTax,
            assetAllocations,
            allocationAmounts,
        };
        console.log('PortfolioData', portfolioData)

        try {
            const response = await fetch('/api/portfoliosettings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(portfolioData)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            console.log('Portfolio saved:', result);
            // Handle success here, such as showing a success message
        } catch (error) {
            console.error('There was an error saving the portfolio:', error);
            // Handle errors here, such as displaying an error message
        } finally {
            setIsSaving(false);
        }
    }

    useEffect(() => {
        async function fetchAndInitializeSettings() {
            try {
                const response = await fetch('/api/portfoliosettings', { method: 'GET' });
                console.log(response);
                if (!response.ok) throw new Error('Failed to fetch portfolio settings');
                const data = await response.json();
                console.log(data.federalTax);

                // Update local state with fetched data
                setInflationOption(data.inflationOption);
                setTaxOption(data.taxOption);
                setInvestmentOption(data.investmentOption);
                setReturnRiskOption(data.returnRiskOption);
                setRebalancingOption(data.rebalancingOption);
                
                setFederalTax(data.federalTax);
                setCapitalTax(data.capitalTax);
                setDividendTax(data.dividendTax);
                setAffordableTax(data.affordableTax);
                setStateTax(data.stateTax);
    
                setAssetAllocations(data.assetAllocations);
                setAllocationAmounts(data.allocationAmounts);
            } catch (error) {
                console.error('An error occurred while initializing settings:', error);
            }
        }
    
        fetchAndInitializeSettings();
    }, []);



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
                                options={inflationOptions}
                                value={inflationOption}
                                onSelectionChange={handleInflationAdjustedChange()}
                            />
                            <Dropdown
                                label="Tax Treatment"
                                options={taxOptions}
                                value = {taxOption}
                                onSelectionChange={handleTaxTypeChange()}
                            />
                            {/* When After-tax Returns is chosen.*/}
                            <Dropdown
                                label="Investment Horizon"
                                options={investmentOptions}
                                value={investmentOption}
                                onSelectionChange={handleInvestmentChange()}
                            />
                            <NumberInput
                                label="Federal Income Tax"
                                placeholder="12345"
                                value={federalTax}
                                onValueChange={handleFederalTaxChange}
                            />
                            <NumberInput
                                label="Capital Gains Tax"
                                placeholder="12345"
                                value={capitalTax}
                                onValueChange={handleCapitalTaxChange}
                            />
                            <NumberInput
                                label="Dividend Tax"
                                placeholder="12345"
                                value={dividendTax}
                                onValueChange={handleDividendTaxChange}
                            />
                            <NumberInput
                                label="Affordable Care Act Tax"
                                placeholder="12345"
                                value={affordableTax}
                                onValueChange={handleAffordableTaxChange}
                            />
                            <NumberInput
                                label="State Income Tax"
                                placeholder="12345"
                                value={stateTax}
                                onValueChange={handleStateTaxChange}
                            />
                            {/* When After-tax Returns is chosen.*/}
                            <Dropdown
                                label="Sequence of Returns Risk"
                                options={returnRiskOptions}
                                value={returnRiskOption}
                                onSelectionChange={handleReturnRiskChange()}
                            />
                            <Dropdown
                                label="Rebalancing"
                                options={rebalancingOptions}
                                value={rebalancingOption}
                                onSelectionChange={handleRebalancingChange()}
                            />
                        </div>
                        <div className="mx-3 lg:w-1/2 w-full">
                            {Array.from({ length: 10 }, (_, index) => (
                                <AllocationInput
                                    key={index + 1}
                                    label={`Asset ${index + 1}`}
                                    assetValue={assetAllocations[index]}
                                    amountValue={allocationAmounts[index]}
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