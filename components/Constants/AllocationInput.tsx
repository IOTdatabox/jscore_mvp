import React, { useState } from 'react';

const assetOptions = [
  {
    groupName: "US Equity",
    options: [
      "TotalStockMarket",
      "LargeCapBlend",
      "LargeCapValue",
      "LargeCapGrowth",
      "MidCapBlend",
      "MidCapValue",
      "MidCapGrowth",
      "SmallCapBlend",
      "SmallCapValue",
      "SmallCapGrowth",
      "MicroCap",
    ],
  },
  {
    groupName: "International Equity",
    options: [
      "IntlStockMarket",
      "IntlDeveloped",
      "IntlSmall",
      "IntlValue",
      "Europe",
      "Pacific",
      "EmergingMarket",
    ],
  },
  {
    groupName: "Fixed Income",
    options: [
      "TreasuryBills",
      "ShortTreasury",
      "IntermediateTreasury",
      "TreasuryNotes",
      "LongTreasury",
      "TotalBond",
      "TIPS",
      "GlobalBond",
      "GlobalBondHedged",
      "ShortInvBond",
      "CorpBond",
      "LongCorpBond",
      "HighYield",
      "ShortTaxExempt",
      "InterTaxExempt",
      "LongTaxExempt",
    ],
  },
  {
    groupName: "Alternatives",
    options: [
      "REIT",
      "Gold",
      "PreciousMetals",
      "Commodities",
    ],
  },
];

interface AllocationInputProps {
  label: string;
  assetValue?: string;
  amountValue?: number;
  onSelectionChange: (selectedValue: string) => void;
  onAmountChange: (amount: number) => void;

}

const AllocationInput: React.FC<AllocationInputProps> = ({ label, assetValue, amountValue, onSelectionChange, onAmountChange }) => {
  const [allocationAmount, setAllocationAmount] = useState<number>(0); // Indicate the state will hold a number
  const handleAllocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newAllocationAmount = parseFloat(e.target.value);
    if (!isNaN(newAllocationAmount)) { // Check if the parsed value is a valid number
      setAllocationAmount(newAllocationAmount);
      // If needed, propagate this change to the parent component...
    } else {
      setAllocationAmount(0); // Set to some default value like 0 or clear the field
    }
    // You might also want to propagate this change to the parent component
    // If needed, you could call a prop function like this:
    // onAllocationAmountChange(e.target.value);
  };

  return (
    <div className="flex w-full px-3 mb-6 md:mb-2">
      {/* Dropdown and Allocation Container */}
      <div className="flex-grow">
        {/* Dropdown Label */}
        <label className="block tracking-wide text-gray-700 text-xs font-bold mb-2 pl-1">
          {label}
        </label>
        <div className="relative">
          {/* Dropdown Select */}
          <select
            value={assetValue}
            onChange={(e) => onSelectionChange(e.target.value)}
            className="block appearance-none w-full bg-gray-200 border border-gray-200 text-gray-700 py-2 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
            id="dropdown-select">s
            {assetOptions.map((group, groupIndex) => (
              <optgroup key={groupIndex} label={group.groupName}>
                {group.options.map((option, optionIndex) => (
                  <option key={optionIndex} value={option}>
                    {option}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
          {/* Dropdown Icon */}
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Allocation Amount Input Container */}
      <div className="w-1/4 ml-3">
        <label className="block tracking-wide text-gray-700 text-xs font-bold mb-2 pl-1" htmlFor="allocation-amount">
          Allocation(%)
        </label>
        <input
          value={amountValue}
          type="number"
          id="allocation-amount"
          onChange={(e) => {
            const amount = parseFloat(e.target.value);
            onAmountChange(isNaN(amount) ? 0 : amount); // Call the onAmountChange prop directly with the parsed number or default to 0
          }}
          className="block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-2 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
          placeholder="Enter amount" />
      </div>
    </div>
  );
};

export default AllocationInput;
