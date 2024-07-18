// util/main-process-test.ts
import { connectMongo } from "@/utils/dbConnect";
import { getDateComponents, calculateAge, getState } from './utils';
import { getOSSForSeveralFiledDate } from './openSocialSecurity';
import { ApplicantData } from '@/types/backend.type';
import { ifError } from 'assert';
import { getInterestRate } from "./zerocouponbond";
import { get50thPercentileDataFromResponse, getMonteCarloSimulation, getTimeWeightedRateOfReturnNominal } from "./portfolio-visualizer";
import { array } from "zod";
const EMAIL_TO_ADDRESS = process.env.NEXT_PUBLIC_EMAIL_TO_ADDRESS ?? "";

function generateRandomToken() {
    const characters =
        'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const tokenLength = 32;
    let token = '';

    for (let i = 0; i < tokenLength; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        token += characters.charAt(randomIndex);
    }
    return token;
}

export async function mainProcessForTest() {
    console.log("Start main process for final test...");
    try {
        const token = generateRandomToken();
        const calculatedResults = await calculateAndStore(token);
        if (!calculatedResults.success) {
            const firstName = 'Jae';
            const toEmail = EMAIL_TO_ADDRESS;
            console.log('toEmail', toEmail);
            const errorMessage = calculatedResults.error;
            const emailResponse = await fetch(`${process.env.NEXT_PUBLIC_URL}api/send-result-failed-email`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ toEmail, userName: firstName, errorMessage })
            });
            if (!emailResponse.ok) {
                console.log('Email Response for result failed was not ok.');
                return { success: false, error: 'Failed to send result failed email' };
            }
            return { success: false, error: calculatedResults.error };
        } else {
            const firstName = 'Jae';
            const toEmail = EMAIL_TO_ADDRESS;
            console.log('toEmail', toEmail);
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
    if (!responseForRMD.ok) {
        throw new Error('Failed to fetch RMD settings');
    }
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
    if (!responseForVariousRate.ok) {
        throw new Error('Failed to fetch various rate settings');
    }
    variousRateData = await responseForVariousRate.json();
    console.log("variousRateData", variousRateData);
}
/*------Fetch Various Rate-------*/

/*------Fetch IRMAA Settings-------*/
let loadedPremiums: any = null;
async function fetchIRMAASettings() {
    const responseForIRMAA = await fetch(`${process.env.NEXT_PUBLIC_URL}api/irmaasettings`);
    if (!responseForIRMAA.ok) {
        throw new Error('Failed to fetch IRMAA settings');
    }
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
        return 0;
    }
}
/*------Fetch IRMAA Settings-------*/

/*------Fetch Portfolio Setting Data-------*/
let PvDatas: any = null;
async function fetchPortfolioSettings() {
    const responseForPV = await fetch(`${process.env.NEXT_PUBLIC_URL}api/portfoliosettings`, { method: 'GET' });
    if (!responseForPV.ok) {
        throw new Error('Failed to fetch Portfolio settings');
    }
    PvDatas = await responseForPV.json();
    console.log("inflationOption", PvDatas.inflationOption);
}
/*------Fetch Portfolio Setting Data-------*/

/*------Fetch User Input Data For Testing-------*/
let testingData: any = null;
async function fetchInputDataForTesting() {
    const responseForTestingData = await fetch('/api/inputfortesting', { method: 'GET' });
    console.log(responseForTestingData);
    if (!responseForTestingData.ok) {
        throw new Error('Failed to fetch testing data');
    }
    testingData = await responseForTestingData.json();
}
/*------Fetch User Input Data For Testing-------*/

async function calculateAndStore(token: any) {
    try {
        await fetchVariousRateSettings();
        if (variousRateData == null) {
            return { success: false, error: 'Fetching Various Rate Setting Error' };
        }
        await fetchRMDSettings();
        if (loadedRMDValues == null) {
            return { success: false, error: 'Fetching RMD Setting Error' };
        }
        await fetchIRMAASettings();
        if (loadedPremiums == null) {
            return { success: false, error: 'Fetching IRMAA Setting Error' };
        }
        await fetchPortfolioSettings();
        if (PvDatas == null) {
            return { success: false, error: 'Fetching Portfolio Setting Error' };
        }
        await fetchInputDataForTesting();
        if (testingData == null) {
            return { success: false, error: 'Fetching Testing Data Error' };
        }
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
        let ageSelf = testingData.ageSelf;
        console.log('ageSelf', ageSelf);
        let ageSpouse = testingData.ageSpouse;
        console.log('ageSpouse', ageSpouse);
        const totalYears = 9;

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
        let totalExpenses;
        let semiTotalExpenses;

        // Arrays Per Year
        let valueOfTotalIncome: number[] = new Array(totalYears).fill(0);
        let valueOfTotalExpenses: number[] = new Array(totalYears).fill(0);
        let expoentialNoAdjusted: number[] = new Array(totalYears).fill(0);
        let expoentialJaeAdjusted: number[] = new Array(totalYears).fill(0);
        let valueofTaxableIncome: number[] = new Array(totalYears).fill(0);
        let valueofSocialSecurity: number[] = new Array(totalYears).fill(0);
        let valueofSocialSecuritySpouse: number[] = new Array(totalYears).fill(0);
        let valueofAPTC: number[] = new Array(totalYears).fill(0);
        let valueofIRMAA: number[] = new Array(totalYears).fill(0);
        let netIncomePerYear;


        // Consts
        const countOfBalances = 7;
        const percentageAdjustedCash = variousRateData.cashRate ?? 0;
        const percentageAdjustedExpense = variousRateData.expenseRate ?? 0;
        const jaeExtraInput = variousRateData.jAdjustedRate ?? 0;
        const taxRateForIncome = variousRateData.taxRateForIncome ?? 0;
        const taxRateForRoth = variousRateData.taxRateForRoth ?? 0;
        const taxRateForGains = variousRateData.taxRateForGains ?? 0;
        let propotionAdjustedExpense = 1 + percentageAdjustedExpense / 100;
        let propotionAdjustedCash = 1 + percentageAdjustedCash / 100;


        console.log('Optimized---------------->>>>>>>>>>>>') // Optimized
        totalIncome = incomeSelf + incomeSpouse + incomeDependent + incomeSocialSecurity + incomeSocialSecuritySpouse + incomePension + incomeOther;
        console.log('totalIncome', totalIncome);
        semiTotalExpenses = expenseHousing + expenseTransportation + expenseDaily + expenseHealth;
        console.log('semiTotalExpenses', semiTotalExpenses);

        let portfolioForEachYears = new Array(countOfBalances);
        let withdrawalAmount = new Array(countOfBalances);
        let trrNominal = new Array(countOfBalances);
        let totalNetWorth = [];
        for (var i = 0; i < countOfBalances; i++) {
            portfolioForEachYears[i] = [];
            withdrawalAmount[i] = [];
            trrNominal[i] = [];
            for (var j = 0; j < totalYears; j++) {
                portfolioForEachYears[i][j] = 0;
                withdrawalAmount[i][j] = 0;
                trrNominal[i][j] = '';
            }
            portfolioForEachYears[i][0] = sources[i].balance;
        }

        /* ------------------ Calculate and Fill Coupon Bond ------------------------- */
        // let interpolatedRates = await getInterestRate(totalYears);
        let interpolatedRates = new Array(totalYears).fill(1);
        if (Array.isArray(interpolatedRates)) {
            interpolatedRates.unshift(0);
            for (var i = 0; i <= totalYears; i++) {
                expoentialNoAdjusted[i] = Math.pow(1 + interpolatedRates[i] / 200, i * 2);
                expoentialJaeAdjusted[i] = Math.pow(1 + (interpolatedRates[i] + jaeExtraInput) / 200, i * 2);
            }
        }
        console.log('expoentialJaeAdjusted', expoentialJaeAdjusted);
        /* ------------------ Calculate and Fill Coupon Bond ------------------------- */

        for (let i = 0; i < totalYears; i++) {
            totalNetWorth[i] = 0;
            let taxableIncome = incomeSelf + incomeSpouse + incomeDependent + incomeOther + withdrawalAmount[2][i] + withdrawalAmount[3][i];
            console.log('TaxableIncome', taxableIncome);
            let aptc = 0;
            let irmaa = 0;
            if (ageSelf < 65) {
                /* aptc */
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
                            householdIncome: taxableIncome,
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
                valueofAPTC[i] = aptc;
                valueofIRMAA[i] = 0;
            }
            else {
                irmaa = findPremium('joint', taxableIncome, 'partB') * 12;
                console.log('irmaa', irmaa);
                valueofAPTC[i] = 0;
                valueofIRMAA[i] = irmaa;
            }
            valueofSocialSecurity[i] = incomeSocialSecurity;
            valueofSocialSecuritySpouse[i] = incomeSocialSecuritySpouse;

            totalExpenses = (semiTotalExpenses - aptc + irmaa) * Math.pow(propotionAdjustedExpense, i);
            valueOfTotalExpenses[i] = totalExpenses;
            valueOfTotalIncome[i] = totalIncome;
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
                const [withdrawals, isBalanceInsufficient] = determineWithdrawal(shouldZeroValue, currentPortfolioForEachYear, ageSelf, ageSpouse);
                if (isBalanceInsufficient) {
                    return { success: false, error: `Failed to save result. Balance is not enough from ${i}th year.` };
                }
                for (var j = 0; j < countOfBalances; j++) {
                    withdrawalAmount[j][i] = withdrawals[j];
                }
            }
            /* ----------------- Calculate withdrawAmount Per Each Balance during Monte Carlo Simulation ------------------------- */
            for (var j = 0; j < countOfBalances; j++) {
                totalNetWorth[i] += portfolioForEachYears[j][i];
                if (portfolioForEachYears[j][i] > 1) {
                    const response = await getMonteCarloSimulation(Math.floor(portfolioForEachYears[j][i]), Math.floor(withdrawalAmount[j][i]), 1);
                    const fiftyPercentileData = await get50thPercentileDataFromResponse(response) ?? [];
                    let trrNominalAtFifty = await getTimeWeightedRateOfReturnNominal(response) ?? 0;
                    portfolioForEachYears[j][i + 1] = fiftyPercentileData[1] ?? 0;
                    trrNominal[j][i + 1] = trrNominalAtFifty ?? '';
                }
                else {
                    portfolioForEachYears[j][i + 1] = 0;
                    trrNominal[j][i + 1] = '';
                }
            }
            totalIncome *= propotionAdjustedCash;
            ageSelf += 1;
            ageSpouse += 1;
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
                valueofSocialSecurity: valueofSocialSecurity,
                valueofSocialSecuritySpouse: valueofSocialSecuritySpouse,
                valueofAPTC: valueofAPTC,
                valueofIRMAA: valueofIRMAA,
                withdrawalAmount: withdrawalAmount,
                portfolioForEachYears: portfolioForEachYears,
                trrNominal: trrNominal,
                totalNetWorth: totalNetWorth,
                divisionResults: divisionResults,
                presentValue: presentValue,
                maxF: 0,
            };
            console.log('resultData', resultData);
            const responseSaveResult = await saveResult(resultData);
            if (responseSaveResult == null) {
                return { success: false, error: 'Saving Result Error' };
            }
            return { success: true, message: 'Result was calculated and stored successfully.' };
        } catch (error) {
            console.error('Error saving result:', error);
            return { success: false, error: 'Failed to save result. Please try again later.' };
        }

    }
    catch (error: any) {
        // Log detailed error response from SendGrid
        if (error.response) {
            console.error('ResponseErrorInMainProcess', error.response.body);
        } else {
            console.error('Error during calculation:', error);
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
    originalIndex: number;
}

const determineWithdrawal = (shouldZeroValue: number, portfolioForEachYear: number[], ageSelf: number, ageSpouse: number):
    [number[], boolean] => {
    const withdrawalAmount: number[] = new Array(portfolioForEachYear.length).fill(0);
    const taxAmount: number[] = new Array(portfolioForEachYear.length).fill(0);
    taxAmount[0] = variousRateData.taxRateForIncome;    //Cash
    taxAmount[1] = variousRateData.taxRateForGains;     //NQ
    taxAmount[2] = variousRateData.taxRateForIncome;    //Q
    taxAmount[3] = variousRateData.taxRateForIncome;    //QSpouse
    taxAmount[4] = variousRateData.taxRateForRoth;      //Roth
    taxAmount[5] = 0;                                   //Annuity
    taxAmount[6] = 0;                                   //LifeInsurance
    const withdrawQMust = portfolioForEachYear[2] * getRMDPercentage(ageSelf) / 100;
    const withdrawQSpouseMust = portfolioForEachYear[3] * getRMDPercentage(ageSpouse) / 100;
    const netwithdrawQAllMust = withdrawQMust * (1 - taxAmount[2] / 100) + withdrawQSpouseMust * (1 - taxAmount[3] / 100);
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
            taxRate: taxAmount[index],
            originalIndex: index
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
            console.log('remaining', remaining)
            if (remaining <= 0) break; // No further withdrawAmount needed
            const maxWithdrawable = remaining / (1 - reorderedTaxRates[j] / 100);
            const withdrawal = Math.min(maxWithdrawable, reorderedPortfolio[j]);
            withdrawalAmount[portfolioWithTaxRates[j].originalIndex] = withdrawal;
            remaining -= withdrawal * (1 - reorderedTaxRates[j] / 100);
        }
        if (remaining > 0) {
            console.log('Insufficient Balance');
            return [withdrawalAmount, true]; // Balance is insufficient
        }
    }
    withdrawalAmount[2] = withdrawalAmount[2] + withdrawQMust;
    withdrawalAmount[3] = withdrawalAmount[3] + withdrawQSpouseMust;
    return [withdrawalAmount, false];
};