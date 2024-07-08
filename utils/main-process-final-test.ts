// util/main-process-test.ts
import { connectMongo } from "@/utils/dbConnect";
import { getDateComponents, calculateAge, getState } from './utils';
import { getOSSForSeveralFiledDate } from './openSocialSecurity';
import { ApplicantData } from '@/types/backend.type';
import { ifError } from 'assert';
import { getInterestRate } from "./zerocouponbond";
import { get50thPercentileDataFromResponse, getMonteCarloSimulation } from "./portfolio-visualizer";
import { array } from "zod";


export async function mainProcessForFinalTest() {
    console.log("Start main process for final test...");
    try {
        const token = '0xff';
        const calculatedResults = await calculateAndStore(token);
        if (!calculatedResults.success) {
            return { success: false, error: 'Unknown error occurred during processing the answers.' };
        } else {
            const firstName = 'Jae';
            const toEmail = 'uo0901576@gmail.com';
            const link = await generateLink(token)
            const emailResponse = await fetch(`${process.env.NEXT_PUBLIC_URL}api/send-result-email`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ toEmail, userName: firstName, link })
            });
            if (!emailResponse.ok) {
                console.log('Email Response for result was not ok.');
                return { success: false, error: 'Failed to send result email' };
            }
            const emailData = await emailResponse.json();

            if (emailData.success) {
                console.log('Email for result sent successfully.');
                return { success: true, message: 'Email for result sent successfully.' };

            } else {
                console.log('Unknown error occurred during sending email for result.');
                return { success: false, error: 'Unknown error occurred during sending email for result.' };
            }
        }
    }
    catch (error) {
        console.error('Error processing answers:', error);
        return { success: false, error: 'Unknown error occurred during sending email for result.' };
    }

}

/*------Fetch RMD Data-------*/
let loadedRMDValues: { age: number; percentage: number; }[] = [];
async function fetchRMDSettings() {
    const responseForRMD = await fetch(`${process.env.NEXT_PUBLIC_URL}api/rmdsettings`);
    if (!responseForRMD.ok) throw new Error(`HTTP error! Status: ${responseForRMD.status}`);
    loadedRMDValues = await responseForRMD.json();
}
function getRMDPercentage(ageToLookup: number): number {
    const rmdMap = loadedRMDValues.reduce((map, item) => {
        map[item.age] = item.percentage;
        return map;
    }, {} as { [x: string]: any });

    // Return the percentage or 0 if undefined
    return rmdMap[ageToLookup] ?? 0;
}
/*------Fetch RMD Data-------*/

/*------Fetch Various Rate-------*/
let variousRateData: any = null;
async function fetchVariousRateSettings() {
    const responseForVariousRate = await fetch(`${process.env.NEXT_PUBLIC_URL}api/variousratesettings`, { method: 'GET' });
    if (!responseForVariousRate.ok) throw new Error('Failed to fetch portfolio settings');
    variousRateData = await responseForVariousRate.json();
    console.log("variousRateData", variousRateData);
}
/*------Fetch Various Rate-------*/

/*------Fetch IRMAA Settings-------*/
let loadedPremiums: any = null;
async function fetchIRMAASettings() {
    const responseForIRMAA = await fetch(`${process.env.NEXT_PUBLIC_URL}api/irmaasettings`);
    if (!responseForIRMAA.ok) throw new Error(`HTTP error! Status: ${responseForIRMAA.status}`);
    loadedPremiums = await responseForIRMAA.json();
}

function findPremium(type = 'individual', income = 0, part = 'partB') {
    // Helper function to check if income falls within the specified range
    const isInIncomeRange = (incomeRange: string, income: number) => {
        if (incomeRange.includes('or less')) {
            const upperLimit = parseInt(incomeRange.replace(/[$,]+| or less/g, ''), 10);
            // console.log(`Checking if ${income} <= ${upperLimit}`);
            return income <= upperLimit;
        }

        if (incomeRange.includes('+')) {
            const lowerLimit = parseInt(incomeRange.replace(/[$,]+|\+/g, ''), 10);
            // console.log(`Checking if ${income} >= ${lowerLimit}`);
            return income >= lowerLimit;
        }

        const [lowStr, highStr] = incomeRange.split(' - ');
        const low = parseInt(lowStr.replace(/[$,]+/g, ''), 10);
        const high = highStr ? parseInt(highStr.replace(/[+$,]+/g, ''), 10) : Infinity;

        // console.log(`Checking if ${income} between ${low} and ${high}`);
        return income >= low && income <= high;
    };

    // Find the corresponding bracket based on income and type (individual or joint)
    const premiumInfo = loadedPremiums.find((premium: { [x: string]: string }) => {
        const incomeRange = premium[type];
        return isInIncomeRange(incomeRange, income);
    });

    // Extract the correct Part B or Part D premium
    if (premiumInfo) {
        return parseFloat(premiumInfo[part].replace('$', ''));
    } else {
        throw new Error('No matching premium information found for the given criteria.');
    }
}
/*------Fetch IRMAA Settings-------*/

/*------Fetch Portfolio Setting Data-------*/
let PvDatas: any = null;
async function fetchPortfolioSettings() {
    const responseForPV = await fetch(`${process.env.NEXT_PUBLIC_URL}api/portfoliosettings`, { method: 'GET' });
    if (!responseForPV.ok) throw new Error('Failed to fetch portfolio settings');
    PvDatas = await responseForPV.json();
    console.log("inflationOption", PvDatas.inflationOption);
}
/*------Fetch Portfolio Setting Data-------*/

/*------Fetch User Input Data For Testing-------*/
let testingData: any = null;
async function fetchInputDataForTesting() {
    const responseForTestingData = await fetch('/api/inputfortesting', { method: 'GET' });
    console.log(responseForTestingData);
    if (!responseForTestingData.ok) throw new Error('Failed to fetch input data for testing');
    testingData = await responseForTestingData.json();
}
/*------Fetch User Input Data For Testing-------*/

async function calculateAndStore(token: any) {
    try {
        await fetchVariousRateSettings();
        await fetchRMDSettings();
        await fetchIRMAASettings();
        await fetchPortfolioSettings();
        await fetchInputDataForTesting();
        // Example usage
        const ageToLookup = 100;
        const RMDpercentage = getRMDPercentage(ageToLookup);
        console.log("RMDpercentage", RMDpercentage);

        const individualIncome = 123;
        const jointIncome = 0;
        const premiumType = 'partB';

        const individualPremiumPartB = findPremium('individual', individualIncome, premiumType);
        console.log(`The Part B premium for an individual with an income of $${individualIncome} is ${individualPremiumPartB}`);
        const jointPremiumPartB = findPremium('joint', jointIncome, premiumType);
        console.log(`The Part B premium for a joint filing with an income of $${jointIncome} is ${jointPremiumPartB}`);

        // Mr X
        const ageSelf = testingData.ageSelf;
        console.log('ageSelf', ageSelf);
        const ageSpouse = testingData.ageSpouse;
        console.log('ageSpouse', ageSpouse);
        const totalYears = 2;

        // Cash Flow Sources
        console.log('Income-----------------');
        let incomeSelf = testingData.incomeSelf;
        console.log('income', incomeSelf);
        let incomeSpouse = testingData.incomeSpouse;
        console.log('incomeSpouse', incomeSpouse);
        let incomeDependent = testingData.incomeDependent;
        console.log('incomeDependent', incomeDependent);
        let incomeSocialSecurity = testingData.incomeSocialSecurity;
        console.log('incomeSocialSecurity', incomeSocialSecurity);
        let incomeSocialSecuritySpouse = testingData.incomeSocialSecuritySpouse;
        console.log('incomeSocialSecuritySpouse', incomeSocialSecuritySpouse);
        let incomePension = testingData.incomePension;
        console.log('incomePension', incomePension);
        let incomeOther = testingData.incomeOther;
        console.log('incomeOther', incomeOther);
        let totalIncome;

        // Balances
        console.log('Balance-----------------');
        const balanceCash = testingData.balanceCash;
        console.log('balanceCash', balanceCash);
        const balanceQ = testingData.balanceQ;
        console.log('balanceQ', balanceQ);
        const balanceQSpouse = testingData.balanceQSpouse;
        console.log('balanceQSpouse', balanceQSpouse);
        const balanceNQ = testingData.balanceNQ;
        console.log('balanceNQ', balanceNQ);
        const balanceRoth = testingData.balanceRoth;
        console.log('balanceRoth', balanceRoth);
        const balanceAnnuity = testingData.balanceAnnuity
        console.log('balanceAnnuity', balanceAnnuity);
        const balanceLifeInsurance = testingData.balanceLifeInsurance
        console.log('balanceLifeInsurance', balanceLifeInsurance);
        let sources = [
            { name: 'Cash', balance: balanceCash },
            { name: 'NQ', balance: balanceNQ },
            { name: 'Q', balance: balanceQ },
            { name: 'QSpouse', balance: balanceQSpouse },
            { name: 'Roth', balance: balanceRoth },
            { name: 'Annuity', balance: balanceAnnuity },
            { name: 'LifeInsurance', balance: balanceLifeInsurance },
        ];


        // Expenses
        console.log('Expense-----------------');
        let expenseHousing = testingData.expenseHousing
        console.log('expenseHousing', expenseHousing);
        let expenseTransportation = testingData.expenseTransportation
        console.log('expenseTransportation', expenseTransportation);
        let expenseDaily = testingData.expenseDaily;
        console.log('expenseDaily', expenseDaily);
        let expenseHealth = testingData.expenseHealth;
        console.log('expenseHealth', expenseHealth);
        /* aptc */
        let aptc = 0;
        let householdIncome = incomeSelf + incomeSpouse + incomeDependent + incomeOther
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_URL}api/subsidy`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    state: "MI",
                    zipCode: "48103",
                    householdSize: 3,
                    householdIncome: householdIncome,
                    dependentsCount: 1,
                    applicantDetails:
                        [
                            { age: ageSelf, smoker: false, relationship: "primary", gender: "male" },
                            { age: ageSpouse, smoker: false, relationship: "spouse", gender: "female" },
                            { age: 15, smoker: false, relationship: "dependent", gender: "male" },
                        ],
                }),
            });
            if (!response.ok) {
                throw new Error('Network response was not ok.');
            }
            const subsidyData = await response.json();
            aptc = (subsidyData.subsidy ?? 0) * 12;

        } catch (error) {
            console.error("Error calling /api/subsidy:", error);
        }
        console.log('aptc', aptc)
        /* aptc */

        let irmaa = findPremium('joint', householdIncome, 'partB') * 12;
        console.log('irmaa', irmaa);
        let totalExpenses;

        // Arrays Per Year
        let valueOfTotalIncome = [];
        let valueOfTotalExpenses = [];
        let expoentialNoAdjusted = [];
        let expoentialJaeAdjusted = [];
        let valueofTaxableIncome = [];
        let valueofAPTC = [];
        let valueofIRMAA = [];
        let netIncomePerYear;


        // Consts
        const countOfBalances = 7;
        const percentageAdjustedCash = variousRateData.cashRate;
        const percentageAdjustedExpense = variousRateData.expenseRate;
        const jaeExtraInput = variousRateData.jAdjustedRate;
        const taxRateForIncome = variousRateData.taxRateForIncome;
        const taxRateForRoth = variousRateData.taxRateForRoth;
        const taxRateForGains = variousRateData.taxRateForGains;
        let propotionAdjustedExpense = 1 + percentageAdjustedExpense / 100;
        let propotionAdjustedCash = 1 + percentageAdjustedCash / 100;


        console.log('Optimized---------------->>>>>>>>>>>>') // Optimized
        totalIncome = incomeSelf + incomeSpouse + incomeDependent + incomeSocialSecurity + incomeSocialSecuritySpouse + incomePension + incomeOther;
        console.log('totalIncome', totalIncome);
        totalExpenses = expenseHousing + expenseTransportation + expenseDaily + expenseHealth - aptc + irmaa;
        console.log('totalExpense', totalExpenses);

        let portfolioForEachYears = new Array(countOfBalances);
        let withdrawalAmount = new Array(countOfBalances);
        let totalNetWorth = [];
        for (var i = 0; i < countOfBalances; i++) {
            portfolioForEachYears[i] = [];
            withdrawalAmount[i] = [];
            for (var j = 0; j < totalYears; j++) {
                portfolioForEachYears[i][j] = 0;
                withdrawalAmount[i][j] = 0;
            }
            portfolioForEachYears[i][0] = sources[i].balance;
        }

        /* ------------------ Calculate and Fill Coupon Bond ------------------------- */
        // let interpolatedRates = await getInterestRate(totalYears);
        let interpolatedRates = new Array(totalYears).fill(1);
        if (Array.isArray(interpolatedRates)) {
            interpolatedRates.unshift(0);
            for (var i = 0; i <= totalYears; i++) {
                expoentialNoAdjusted.push(Math.pow(1 + interpolatedRates[i] / 200, i * 2));
                expoentialJaeAdjusted.push(Math.pow(1 + (interpolatedRates[i] + jaeExtraInput) / 200, i * 2));
            }
        }
        console.log('expoentialJaeAdjusted', expoentialJaeAdjusted);
        /* ------------------ Calculate and Fill Coupon Bond ------------------------- */

        for (let i = 0; i < totalYears; i++) {
            totalNetWorth[i] = 0;
            valueOfTotalExpenses.push(totalExpenses);
            valueOfTotalIncome.push(totalIncome);
            netIncomePerYear = totalIncome * (1 - taxRateForIncome / 100);
            console.log('netIncomePerYear', netIncomePerYear);

            /* ----------------- Calculate withdrawAmount Per Each Balance during Monte Carlo Simulation ------------------------- */
            if (totalExpenses <= totalIncome) {
                for (var j = 0; j < countOfBalances; j++) {
                    withdrawalAmount[j][i] = 0;
                }
            }
            else {
                let shouldZeroValue = totalExpenses - netIncomePerYear;
                const currentPortfolioForEachYear = portfolioForEachYears.map(portfolio => portfolio[i]);
                const withdrawals = determineWithdrawal(shouldZeroValue, currentPortfolioForEachYear, ageSelf, ageSpouse);
                for (var j = 0; j < countOfBalances; j++) {
                    withdrawalAmount[j][i] = withdrawals[j];
                }
            }
            /* ----------------- Calculate withdrawAmount Per Each Balance during Monte Carlo Simulation ------------------------- */
            for (var j = 0; j < countOfBalances; j++) {
                totalNetWorth[i] += portfolioForEachYears[j][i];
                const response = await getMonteCarloSimulation(Math.floor(portfolioForEachYears[j][i]), Math.floor(withdrawalAmount[j][i]), 1);
                const fiftyPercentileData = await get50thPercentileDataFromResponse(response) ?? [];
                portfolioForEachYears[j][i + 1] = fiftyPercentileData[1] ?? 0;
            }
            totalExpenses *= propotionAdjustedExpense;
            totalIncome *= propotionAdjustedCash;

        }
        let lastNetworth = 0;
        for (var i = 0; i < countOfBalances; i++) {
            lastNetworth += portfolioForEachYears[i][totalYears];
        }
        totalNetWorth.push(lastNetworth);
        console.log('totalNetWorth', totalNetWorth);
        let divisionResults = totalNetWorth.map((value, index) => {
            return expoentialJaeAdjusted[index] !== 0 ? value / expoentialJaeAdjusted[index] : 0;
        });
        console.log('divisionResults', divisionResults)
        let presentValue = divisionResults.reduce((sum, currentValue) => sum + currentValue, 0);
        console.log('Present Value', presentValue);
        try {
            const resultData = {
                questionID: token,
                totalYears: totalYears,
                valueOfTotalIncome: valueOfTotalIncome,
                valueOfTotalExpenses: valueOfTotalExpenses,
                withdrawalAmount: withdrawalAmount,
                portfolioForEachYears: portfolioForEachYears,
                totalNetWorth: totalNetWorth,
                divisionResults: divisionResults,
                presentValue: presentValue
            };
            console.log('resultData', resultData);
            await saveResult(resultData);
            return { success: true, message: 'Result was calculated and stored successfully.' };
        } catch (error) {
            return { success: false, error: 'Unknown error occurred during processing the answers.' };
        }

    }
    catch (error: any) {
        // Log detailed error response from SendGrid
        if (error.response) {
            console.error('ResponseErrorInMainProcess', error.response.body);
        } else {
            console.error(error);
        }
        return { success: false, error: 'Unknown error occurred during processing the answers.' };
    }
}

const generateLink = async (token: String) => {
    const generatedLink: string = `${process.env.NEXT_PUBLIC_URL}result?token=${token}`;
    return generatedLink;
};

const saveResult = async (data: any) => {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_URL}api/result`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.statusText}`);
        }

        const savedResult = await response.json();
        console.log('Saved result:', savedResult);
        return savedResult;
    } catch (error) {
        console.error('Failed to save result:', error);
    }
};


interface PortfolioItem {
    value: number;
    taxRate: number;
}

const determineWithdrawal = (shouldZeroValue: number, portfolioForEachYear: number[], ageSelf: number, ageSpouse: number): number[] => {
    const withdrawalAmount: number[] = new Array(portfolioForEachYear.length).fill(0);
    const taxAmount: number[] = new Array(portfolioForEachYear.length).fill(0);
    taxAmount[0] = variousRateData.taxRateForIncome;    //Cash
    taxAmount[1] = variousRateData.taxRateForGains;     //NQ
    taxAmount[2] = variousRateData.taxRateForIncome;    //Q
    taxAmount[3] = variousRateData.taxRateForIncome;    //QSpouse
    taxAmount[4] = variousRateData.taxRateForRoth;      //Roth
    taxAmount[5] = 0;                                   //Annuity
    taxAmount[6] = 0;                                   //LifeInsurance
    const withdrawQMust = portfolioForEachYear[2] * getRMDPercentage(ageSelf);
    const withdrawQSpouseMust = portfolioForEachYear[3] * getRMDPercentage(ageSpouse);
    const netwithdrawQAllMust = withdrawQMust * (1 - taxAmount[2]) + withdrawQSpouseMust * (1 - taxAmount[3]);
    if (netwithdrawQAllMust >= shouldZeroValue) {
        for (let j = 0; j < portfolioForEachYear.length; j++) {
            withdrawalAmount[j] = 0;
        }
    }
    else {
        let adjustedPortfolioForEachYear = [...portfolioForEachYear];
        adjustedPortfolioForEachYear[2] -= withdrawQMust;
        adjustedPortfolioForEachYear[3] -= withdrawQSpouseMust;
        let portfolioWithTaxRates: PortfolioItem[] = adjustedPortfolioForEachYear.map((value, index) => ({
            value,
            taxRate: taxAmount[index]
        }));
        portfolioWithTaxRates.sort((a, b) => a.taxRate - b.taxRate);
        let reorderedPortfolio: number[] = portfolioWithTaxRates.map(item => item.value);
        let reorderedTaxRates: number[] = portfolioWithTaxRates.map(pair => pair.taxRate);
        console.log('Original Portfolio:', portfolioForEachYear);
        console.log('Adjusted Portfolio:', adjustedPortfolioForEachYear);
        console.log('Reordered Portfolio (by increasing tax rate):', reorderedPortfolio);
        console.log('Tax Amount:', reorderedTaxRates);
        let remaining = shouldZeroValue - netwithdrawQAllMust;
        for (let j = 0; j < reorderedPortfolio.length; j++) {
            if (remaining <= 0) break; // No further withdrawAmount needed
            const maxWithdrawable = remaining / (1 - reorderedTaxRates[j]);
            const withdrawal = Math.min(maxWithdrawable, reorderedPortfolio[j]);
            withdrawalAmount[j] = withdrawal;
            remaining -= withdrawal * (1 - reorderedTaxRates[j]);
        }
    }
    withdrawalAmount[2] = withdrawalAmount[2] + withdrawQMust;
    withdrawalAmount[3] = withdrawalAmount[3] + withdrawQSpouseMust;
    return withdrawalAmount;
};