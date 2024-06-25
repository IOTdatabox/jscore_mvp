
const valueMap = {
  'Asset Classes': 1,
  'Tickers': 2,
  'No contributions or withdrawals': 0,
  'Contribute fixed amount periodically': 1,
  'Withdraw fixed amount periodically': 2,
  'Withdraw fixed percentage periodically': 3,
  'Rolling average spending rule': 5,
  'Geometric spending rule': 6,
  'Withdraw based on life expectancy': 4,
  'Import cashflows': 7,

  /* In Withdraw based on life expectancy */
  'Single Life Expectancy': 0,
  'Uniform Life Expectancy (70+)': 1,
  /* In Withdraw based on life expectancy */

  'Yes': true,
  'No': false,
  'Monthly': 2,
  'Quarterly': 3,
  'Annually': 4,
  'Pre-tax Returns': false,
  'After-tax Returns': true,
  'Simulated Period': 1,
  'Perpetual': 2,
  'Historical Returns': 1,
  'Forecasted Returns': 4,
  'Statistical Returns': 2,
  'Parameterized Returns': 3,

  /* In Historical Returns */
  'Single Month': 0,
  'Single Year': 1,
  'Block of Years': 2,
  /* In Historical Returns */

  /* In Statistical Returns and Forecasted Returns */
  'Normal Returns': 1,
  'GARCH Model': 3,
  /* In Statistical Returns and Forecasted Returns */

  /* In Parameterized Returns */
  'Normal Distribution': 1,
  'Fat-Tailed Distribution': 2,
  /* In Parameterized Returns */

  'No Adjustments': 0,
  'Worst 1 Year First': 1,
  'Worst 2 Years First': 2,
  'Worst 3 Years First': 3,
  'Worst 4 Years First': 4,
  'Worst 5 Years First': 5,
  'Worst 6 Years First': 6,
  'Worst 7 Years First': 7,
  'Worst 8 Years First': 8,
  'Worst 9 Years First': 9,
  'Worst 10 Years First': 10,
  'Historical Inflation': 1,
  'Parameterized Inflation': 2,
  'No Rebalancing': 0,
  'Rebalance annually': 1,
  'Rebalance semi-annually': 2,
  'Rebalance quarterly': 3,
  'Rebalance monthly': 4,
  'Defaults': false,
  'Custom': true,
  'US Stock Market': 'TotalStockMarket',
  'US Large Cap': 'LargeCapBlend',
  'US Large Cap Value': 'LargeCapValue',
  'US Large Cap Growth': 'LargeCapGrowth',
  'US Mid Cap': 'MidCapBlend',
  'US Mid Cap Value': 'MidCapValue',
  'US Mid Cap Growth': 'MidCapGrowth',
  'US Small Cap': 'SmallCapBlend',
  'US Small Cap Value': 'SmallCapValue',
  'US Small Cap Growth': 'SmallCapGrowth',
  'US Micro Cap': 'MicroCap',
  'Global ex-US Stock Market': 'IntlStockMarket',
  'Intl Developed ex-US Market': 'IntlDeveloped',
  'International ex-US Small Cap': 'IntlSmall',
  'International ex-US Value': 'IntlValue',
  'European Stocks': 'Europe',
  'Pacific Stocks': 'Pacific',
  'Emerging Markets': 'EmergingMarket',
  'Cash': 'TreasuryBills',
  'Short Term Treasury': 'ShortTreasury',
  'Intermediate Term Treasury': 'IntermediateTreasury',
  '10-year Treasury': 'TreasuryNotes',
  'Long Term Treasury': 'LongTreasury',
  'Total US Bond Market': 'TotalBond',
  'TIPS': 'TIPS',
  'Global Bonds (Unhedged)': 'GlobalBond',
  'Global Bonds (USD Hedged)': 'GlobalBondHedged',
  'Short-Term Investment Grade': 'ShortInvBond',
  'Corporate Bonds': 'CorpBond',
  'Long-Term Corporate Bonds': 'LongCorpBond',
  'High Yield Corporate Bonds': 'HighYield',
  'Short-Term Tax-Exempt': 'ShortTaxExempt',
  'Intermediate-Term Tax-Exempt': 'InterTaxExempt',
  'Long-Term Tax-Exempt': 'LongTaxExempt',
  'REIT': 'REIT',
  'Gold': 'Gold',
  'Precious Metals': 'PreciousMetals',
  'Commodities': 'Commodities',
}


export async function getMonteCarloSimulation(initialAmountInput: number, withdrawAmountInput: number, periodInYearsInput: number) {

  let mode = 1;
  let initialAmount = 1000000;
  let adjustmentType = 2;
  let importFile;
  let adjustmentAmount = 45000;
  let inflationAdjusted = true;
  let adjustmentPercentage = 4.0;
  let rollingAveragePeriods = 3;
  let smoothingRate = 75;
  let frequency = 4;
  let lifeExpectancyModel = 0;
  let currentAge = 70;
  let years = 30;
  let taxTreatment = false;
  let investmentHorizon = 1;
  let incomeTax = 37.0;
  let capitalGainsTax = 20.0;
  let dividendTax = 20.0
  let affordableCareActTax = 3.8;
  let stateTax = 0.0;
  let simulationModel = 1;
  let timeSeries = 1;
  let riskFreeRate = 5.3;
  let historicalVolatility = true;
  let historicalCorrelations = true;
  let correlationsFile;
  let fullHistory = true;
  let startYear = 1972;
  let endYear = 2023;
  let bootstrapModel = 1;
  let bootstrapMinYears = 1;
  let bootstrapMaxYears = 20;
  let circularBootstrap = true;
  let distribution = 1;
  let dof = 30;
  let meanReturn = 7.0;
  let volatility = 12.0;
  let sequenceStressTest = 0;
  let inflationModel = 1;
  let inflationMean = 4.0;
  let inflationVolatility = 3.0;
  let rebalanceType = 1;
  let customIntervals = false;
  let percentileList = '10, 25, 50, 75, 90';
  let returnList = '0, 2.5, 5, 7.5, 10, 12.5';


  // Portfolio type 1=Asset Classes, 2=Tickers
  mode = valueMap['Asset Classes'];
  initialAmount = initialAmountInput;
  adjustmentType = valueMap['Withdraw fixed amount periodically'];
  adjustmentAmount = withdrawAmountInput;
  inflationAdjusted = valueMap['No'];

  frequency = valueMap['Annually']; //Withdrawal Frequency: 2=Monthly, 3=Quarterly, 4=Annually
  years = periodInYearsInput;// Simulation Period in Years
  taxTreatment = valueMap['Pre-tax Returns']; // Tax Treatment: Pre-tax Returns, After-tax Returns
  if (taxTreatment) {
    const investmentHorizon = valueMap['Perpetual'] // Investment Horizon: 1=Simulated Period, 2=Perpetual
    const incomeTax = 37; //Federal Income Tax
    const capitalGainsTax = 20; //Capital Gains Tax
    const dividendTax = 20; //Dividend Tax
    const affordableCareActTax = 3.8; // Affordable Care Act Tax
    const stateTax = 0; //State Income Tax
  }

  simulationModel = valueMap['Historical Returns']; // Simulation Model: 1=Historical Returns, 2=Statistical Returns, 3=Parameterized Returns, 4=Forecasted Returns

  sequenceStressTest = valueMap['No Adjustments'];
  rebalanceType = valueMap['No Rebalancing']; // Rebalance Type: 0=No Rebalancing, 1=Rebalance Annually, 2=Rebalance semi-annually, 3=Rebalance quarterly, 4=Rebalance monthly

  const response = await fetch(`${process.env.NEXT_PUBLIC_URL}api/portfoliosettings`, { method: 'GET' });
  if (!response.ok) throw new Error('Failed to fetch portfolio settings');
  const existingSettings = await response.json();
  const { assetAllocations, allocationAmounts } = existingSettings;


  let assetString = generateQueryString(assetAllocations, allocationAmounts);
  // use the variable to create a url string
  const baseUrl = 'https://www.portfoliovisualizer.com/monte-carlo-simulation?s=y';
  // construct the url string using the variables
  const url = baseUrl +
    '&adjustmentType=' + adjustmentType +
    '&smoothingRate=' + smoothingRate +
    '&historicalVolatility=' + historicalVolatility +
    '&volatility=' + volatility +
    '&investmentHorizon=' + investmentHorizon +
    '&endYear=' + endYear +

    '&frequency=' + frequency +
    '&mode=' + mode +
    '&inflationAdjusted=' + inflationAdjusted +
    '&inflationVolatility=' + inflationVolatility +
    '&sequenceStressTest=' + sequenceStressTest +
    '&inflationMean=' + inflationMean +
    '&startYear=' + startYear +
    '&bootstrapModel=' + bootstrapModel +
    '&inflationModel=' + inflationModel +
    '&taxTreatment=' + taxTreatment +
    '&customIntervals=' + customIntervals +
    '&adjustmentPercentage=' + adjustmentPercentage +
    '&incomeTax=' + incomeTax +
    '&rebalanceType=' + rebalanceType +
    '&capitalGainsTax=' + capitalGainsTax +
    '&dof=' + dof +
    '&circularBootstrap=' + circularBootstrap +
    '&stateTax=' + stateTax +
    '&simulationModel=' + simulationModel +
    '&distribution=' + distribution +
    '&currentAge=' + currentAge +
    '&timeSeries=' + timeSeries +
    '&bootstrapMaxYears=' + bootstrapMaxYears +
    '&historicalCorrelations=' + historicalCorrelations +
    '&dividendTax=' + dividendTax +
    '&returnList=' + returnList +
    '&affordableCareActTax=' + affordableCareActTax +
    '&lifeExpectancyModel=' + lifeExpectancyModel +
    '&bootstrapMinYears=' + bootstrapMinYears +
    '&meanReturn=' + meanReturn +
    '&percentileList=' + percentileList +
    '&rollingAveragePeriods=' + rollingAveragePeriods +
    '&fullHistory=' + fullHistory + '&' + 
    assetString +
    '&initialAmount=' + initialAmount +
    '&adjustmentAmount=' + adjustmentAmount +
    '&years=' + years;

  let testURL = 'https://www.portfoliovisualizer.com/monte-carlo-simulation?s=y&adjustmentType=2&smoothingRate=75&historicalVolatility=true&volatility=12&investmentHorizon=1&endYear=2023&frequency=4&mode=1&inflationAdjusted=true&inflationVolatility=3&sequenceStressTest=0&inflationMean=4&startYear=1972&bootstrapModel=1&inflationModel=1&taxTreatment=false&customIntervals=false&adjustmentPercentage=4&incomeTax=37&rebalanceType=1&capitalGainsTax=20&dof=30&circularBootstrap=true&stateTax=0&simulationModel=1&distribution=1&currentAge=70&timeSeries=1&bootstrapMaxYears=20&historicalCorrelations=true&dividendTax=20&returnList=0,2.5,5,7.5,10,12.5&affordableCareActTax=3.8&lifeExpectancyModel=0&bootstrapMinYears=1&meanReturn=7&percentileList=10,25,50,75,90&rollingAveragePeriods=3&fullHistory=true&asset1=LargeCapGrowth&allocation1_1=80&asset2=LargeCapBlend&allocation2_1=10&asset3=MidCapBlend&allocation3_1=10&asset4=undefined&allocation4_1=0&asset5=MidCapGrowth&allocation5_1=0&asset6=MidCapValue&allocation6_1=0&asset7=LargeCapValue&allocation7_1=0&asset8=LargeCapGrowth&allocation8_1=0&asset9=TotalStockMarket&allocation9_1=0&asset10=ShortTreasury&allocation10_1=0' + '&initialAmount=' + initialAmountInput + '&adjustmentAmount=' + withdrawAmountInput + '&years=' + periodInYearsInput;

  try {

    const response = await fetch(`https://api.apify.com/v2/actor-tasks/flZGkNknEPgSz9V1k/run-sync-get-dataset-items/`, {
      method: 'post',
      body: JSON.stringify({
        'url': url,
      }),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer apify_api_IyxytYGIfOEpJfylFJkPxNaETpzRvF1eUqX0`,
      },
    });
    if (!response.ok) {
      throw new Error(`Error fetching Monte Carlo Simulation: ${response.statusText}`);
    }
    const contentText = await response.text();
    const parsedResponse = JSON.parse(contentText);
    if (!Array.isArray(parsedResponse) || parsedResponse.some(item => typeof item !== 'object')) {
      console.error("Invalid response structure:", parsedResponse);
      return [];
    }

    return parsedResponse;

  } catch (error) {
    if (error instanceof Error) {
      console.log('Error calling Apify API: ' + error.toString());
      return error;
    } else {
      console.log('Unknown error occurred');
      return new Error('Unknown error occurred');
    }
  }
}

// export function get50thPercentileDataFromResponse(responseData: any) {
//   let fiftyPercentileData;

//   // Iterate through the responseData items
//   responseData.some((item: { seriesData: any[]; }) => {
//     // Check if the item has seriesData
//     if (item.seriesData && item.seriesData.length > 0) {
//       // Look for the object with name '50th Percentile' within seriesData
//       const seriesObj = item.seriesData.find(series => series.name === "50th Percentile");

//       // If found, assign its data to fiftyPercentileData and break the loop
//       if (seriesObj) {
//         fiftyPercentileData = seriesObj.data;
//         return true; // Break the loop
//       }
//     }
//     return false; // Continue the loop if not found
//   });

//   if (fiftyPercentileData) {
//     console.log("50th Percentile Data:", fiftyPercentileData);
//   } else {
//     console.log("50th percentile data not found in the response data.");
//   }
//   return fiftyPercentileData;
// }

export function get50thPercentileDataFromResponse(responseData: any) {

  console.log('responseData', responseData);
  // Check if responseData is an array
  if (!Array.isArray(responseData)) {
    console.error("Invalid response data; expected an array.");
    return null;
  }

  let fiftyPercentileData;

  // Iterate through the responseData items
  responseData.some((item: { seriesData: any[]; }) => {
    // Check if the item has seriesData
    if (item.seriesData && item.seriesData.length > 0) {
      // Look for the object with name '50th Percentile' within seriesData
      const seriesObj = item.seriesData.find(series => series.name === "50th Percentile");

      // If found, assign its data to fiftyPercentileData and break the loop
      if (seriesObj) {
        fiftyPercentileData = seriesObj.data;
        return true; // Break the loop
      }
    }
    return false; // Continue the loop if not found
  });

  if (fiftyPercentileData) {
    console.log("50th Percentile Data:", fiftyPercentileData);
  } else {
    console.log("50th percentile data not found in the response data.");
  }

  return fiftyPercentileData;
}


function generateQueryString(allocations: string[], amounts: number[]): string {
  const totalAllocation = amounts.reduce((acc, amount) => acc + amount, 0);
  if (totalAllocation !== 100) {
    throw new Error("Total allocation must be 100%");
  }
  let queryString = '';
  for (let i = 0; i < allocations.length; i++) {
    const assetKey = `asset${i + 1}`;
    const allocationKey = `allocation${i + 1}_1`;
    const assetValue = allocations[i] || 'undefined';
    const allocationValue = amounts[i].toString();

    queryString += `${queryString ? '&' : ''}${assetKey}=${encodeURIComponent(assetValue)}&${allocationKey}=${encodeURIComponent(allocationValue)}`;
  }
  return queryString;
}
