// util/main-process.ts
import { connectMongo } from "@/utils/dbConnect";
import { getDateComponents, calculateAge, getState } from './utils';
import { getOSSForSeveralFiledDate } from './openSocialSecurity';
import { ApplicantData } from '@/types/backend.type';
import { ifError } from 'assert';
import { getInterestRate } from "./zerocouponbond";
import { get50thPercentileDataFromResponse, getMonteCarloSimulation } from "./portfolio-visualizer";
interface Answer {
    question: string;
    answer: any; // Change this to a more specific type if possible
}

interface AnswersMap {
    [key: string]: any; // Change this to a more specific type if applicable
}

function normalizeQuestion(question: string): string {
    return question.trim().replace(/[*]/g, ''); // Remove all asterisks
}


function mapAnswers(answersArray: Answer[]): AnswersMap {
    const answersMap: AnswersMap = {};

    for (const { question, answer } of answersArray) {
        const normalizedQuestion = normalizeQuestion(question);

        // Map array answers and single-item answers differently if required
        if (Array.isArray(answer)) {
            answersMap[normalizedQuestion] = answer.map(item =>
                item.hasOwnProperty('label') ? item.label : item
            );
        } else {
            answersMap[normalizedQuestion] = answer;
        }
    }
    return answersMap;
}


export async function mainProcess(answer: any) {
    console.log("Start main process...");
    try {
        const token = answer._id;
        const answerObj = mapAnswers(answer.answers);
        const calculatedResults = await calculateAndStore(answerObj, token);
        if (!calculatedResults.success) {
            return { success: false, error: 'Unknown error occurred during processing the answers.' };
        } else {

            const firstName = answerObj['First name'] ?? 'Not provided';
            const toEmail = answerObj['Email'] ?? 'Not provided';
            console.log("userName", firstName);
            console.log("toEmail", toEmail);
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
            // return { success: true, message: 'Calculation performed successfully.' };
        }
    }
    catch (error) {
        console.error('Error processing answers:', error);
        return { success: false, error: 'Unknown error occurred during sending email for result.' };
    }

}

async function calculateAndStore(answerObj: any, token: any) {
    try {
        /*------Fetch Various Rate-------*/
        console.log(answerObj);
        const responseForVariousRate = await fetch(`${process.env.NEXT_PUBLIC_URL}api/variousratesettings`, { method: 'GET' });
        if (!responseForVariousRate.ok) throw new Error('Failed to fetch portfolio settings');
        const variousRateData = await responseForVariousRate.json();
        console.log("variousRateData", variousRateData);
        /*------Fetch Various Rate-------*/

        /*------Fetch RMD Data-------*/
        const responseForRMD = await fetch(`${process.env.NEXT_PUBLIC_URL}api/rmdsettings`);
        // const responseForRMD = await fetch('/api/rmdsettings');
        if (!responseForRMD.ok) throw new Error(`HTTP error! Status: ${responseForRMD.status}`);
        const loadedRMDValues = await responseForRMD.json();

        const rmdMap = loadedRMDValues.reduce((map: { [x: string]: any; }, item: { age: number; percentage: number; }) => {
            map[item.age] = item.percentage;
            return map;
        }, {});
        const ageToLookup = 100;
        const RMDpercentage = rmdMap[ageToLookup];
        // console.log(`The RMD percentage for age ${ageToLookup} is ${percentage}%`);
        /*------Fetch RMD Data-------*/

        /*------Fetch IRMAA Data-------*/
        const responseForIRMAA = await fetch(`${process.env.NEXT_PUBLIC_URL}api/irmaasettings`);
        if (!responseForIRMAA.ok) throw new Error(`HTTP error! Status: ${responseForIRMAA.status}`);
        const loadedPremiums = await responseForIRMAA.json();
        try {
            const individualIncome = 123; // Example individual income
            const jointIncome = 0; // Example joint income
            const premiumType = 'partB'; // or 'partD' for Part D premium
            const individualPremiumPartB = findPremium(loadedPremiums, 'individual', individualIncome, premiumType);
            // console.log(`The Part B premium for an individual with an income of $${individualIncome} is ${individualPremiumPartB}`);
            const jointPremiumPartB = findPremium(loadedPremiums, 'joint', jointIncome, premiumType);
            // console.log(`The Part B premium for a joint filing with an income of $${jointIncome} is ${jointPremiumPartB}`);

        } catch (error: any) {
            console.error(error.message);
        }
        /*------Fetch IRMAA Data-------*/

        /*------Fetch Portfolio Setting Data-------*/
        const response = await fetch(`${process.env.NEXT_PUBLIC_URL}api/portfoliosettings`, { method: 'GET' });
        if (!response.ok) throw new Error('Failed to fetch portfolio settings');
        const PvDatas = await response.json();
        console.log("inflationOption", PvDatas.inflationOption);
        /*------Fetch Portfolio Setting Data-------*/

        /*------Define Const-------*/
        // Mr X
        const ageSelf = calculateAge(answerObj['Your Date Of Birth']);
        console.log('ageSelf', ageSelf);
        const ageSpouse = calculateAge(answerObj["Your Spouse's Date Of Birth"]);
        console.log('ageSpouse', ageSpouse);
        const birthDate = getDateComponents(answerObj['Your Date Of Birth']);
        console.log('birthDate', birthDate);
        const birthDateSpouse = getDateComponents(answerObj["Your Spouse's Date Of Birth"]);
        console.log('birthDateSpouse', birthDateSpouse);
        const totalYears = 2;

        // Cash Flow Sources
        let incomeSelf = answerObj['Annual Earned Income?'] ?? 0;
        console.log('income', incomeSelf);
        let incomeSpouse = answerObj["Spouse's Annual Income?"] ?? 0;
        console.log('incomeSpouse', incomeSpouse);
        let incomeSocialSecurity = 10000;
        let socialSecurityArray: any[][];

        if (answerObj['Do You Currently Receive Social Security benefits?']) {
            incomeSocialSecurity = answerObj['Monthly Social Security Amount'] ?? 0;
        }
        else {
            const PIAAmount = answerObj['What Is Your Primary Insured Amount (PIA)'] ?? 0;
            console.log('PIA', PIAAmount);
            // try {
            //     socialSecurityArray = await getOSSForSeveralFiledDate('male', birthDate.month, birthDate.day, birthDate.year, PIAAmount);
            //     incomeSocialSecuritySpouse = parseInt(socialSecurityArray[0][0].replace(/[$,]/g, ''));
            // } catch (error) {
            //     console.error('Error fetching social security data:', error);
            // }
            incomeSocialSecurity = 8850;
        }


        let incomeSocialSecuritySpouse = 10000;
        let socialSecuritySouseArray: any[][];
        if (answerObj['Do You Currently Receive Social Security benefits?']) {
            incomeSocialSecuritySpouse = answerObj["Your Spouse's Monthly Social Security Amount"] ?? 0;
        }
        else {
            const PIAAmountSpouse = answerObj["What Is Your Spouse's Primary Insured Amount (PIA)"] ?? 0;
            console.log('PIAAmountSpouse', PIAAmountSpouse);
            try {
                socialSecuritySouseArray = await getOSSForSeveralFiledDate('female', birthDateSpouse.month, birthDateSpouse.day, birthDateSpouse.year, PIAAmountSpouse);
                incomeSocialSecuritySpouse = parseInt(socialSecuritySouseArray[0][0].replace(/[$,]/g, ''));
            } catch (error) {
                console.error('Error fetching social security data:', error);
            }
            // incomeSocialSecuritySpouse = 10260;
        }


        const incomePension = (answerObj["Monthly Pension Amount"] ?? 0) * 12;
        let interestPreTax;
        const incomeAnnuity = answerObj["Monthly Annuity Income Amount"] ?? 0;
        const incomeRental = answerObj["Monthly Rental Income"] ?? 0;
        const incomeMortgate = answerObj["Monthly Reverse Mortgage Payment"] ?? 0;
        const incomeOther = (incomeAnnuity + incomeRental + incomeMortgate) * 12;
        console.log('incomeOther', incomeOther);
        let totalIncome;

        // Balances
        const balanceCash = answerObj["Cash, Savings, CDs"] ?? 0;
        console.log('balanceCash', balanceCash);
        const balanceQ = answerObj["Qualified Fund Balances"] ?? 0;
        console.log('balanceQ', balanceQ);
        const balanceQSpouse = answerObj["Spouse's Qualified Fund Balances"] ?? 0;
        console.log('balanceQSpouse', balanceQSpouse);
        const balanceNQ = answerObj["Non-Qualified Fund Balances"] ?? 0;
        console.log('balanceNQ', balanceNQ);
        const balanceRoth = answerObj["Roth IRA Balance"] ?? 0;
        console.log('balanceRoth', balanceRoth);
        const balanceAnnuity =
            (answerObj['Please find the most recent Fixed Annuity statement, and enter the original amount that you deposited here'] ?? 0) +
            (answerObj['Please find the most recent Deferred Income Annuity statement, and enter the Liquidation Value of your deferred annuity.'] ?? 0) +
            (answerObj['Please find the most recent Variable Annuity statement, and enter the Liquidation Value of your deferred annuity.'] ?? 0);
        console.log('balanceAnnuity', balanceAnnuity);
        const balanceLifeInsurance =
            (answerObj['Please find the most recent Whole Life Insurance statement, and enter the Liquidation Value.'] ?? 0) +
            (answerObj['Please find the most recent Universal Life Insurance statement, and enter the Liquidation Value.'] ?? 0) +
            (answerObj['Please find the most recent Variable Life Insurance statement, and enter the Liquidation Value.'] ?? 0);
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
        let expenseHousing;
        if (answerObj["Housing"] == 'Own') {
            expenseHousing = (answerObj["Mortgage Payment?"] ?? 0) + (answerObj["Mortgage Monthly Payment?"] ?? 0) * 12;
        }
        else {
            expenseHousing = (answerObj["Monthly Rent?"] ?? 0) * 12;
        }
        console.log('expenseHousing', expenseHousing);
        let expenseTransportation;
        if (answerObj["Transportation"] == 'Lease') {
            expenseTransportation = answerObj["Auto Lease Amount?"] ?? 0;
        } else {
            expenseTransportation = (answerObj["Auto Loan Principal Balance?"] ?? 0) + (answerObj["Auto Loan Payment Amount?"] ?? 0) * 12;
        }
        console.log('expenseTransportation', expenseTransportation);

        let expenseDaily = (answerObj['Food, Utilities, Gas'] ?? 0) * 12;
        console.log('expenseDaily', expenseDaily);

        let expenseHealth = (answerObj['Health Insurance Premium'] ?? 0) * 12;
        console.log('expenseHealth', expenseHealth);

        /* aptc */
        let aptc = 0;
        let zipCode: string = String(answerObj['Your Residential Zip Code']) ?? '00000';
        let householdSize = 1;
        let dependentsCount = 0;
        let applicantDetails: ApplicantData[] = [
            {
                relationship: 'primary',
                gender: 'male',
                age: ageSelf,
                smoker: true,
            },
        ];
        if (birthDateSpouse) {
            householdSize += 1;
            const spouseAge = calculateAge(answerObj["Your Spouse's Date Of Birth"]); // You need to define the getAgeFromBirthDate() function
            applicantDetails.push({
                relationship: 'spouse',
                gender: 'female', // or 'male' depending on your application's requirements
                age: spouseAge,
                smoker: true,
            });
        }
        const addDependentIfApplicable = (dependentDOBKey: string) => {
            const dob = getDateComponents(answerObj[dependentDOBKey]);
            if (dob && (!Number.isNaN(dob.year) && !Number.isNaN(dob.month) && !Number.isNaN(dob.day))) {
                console.log('dob', dob);
                // Assuming you have a way to calculate the age from the date components
                const dependentAge = calculateAge(answerObj[dependentDOBKey]); // Define this function based on your logic to calculate age
                applicantDetails.push({
                    relationship: 'dependent',
                    gender: 'male',
                    age: dependentAge,
                    smoker: true,
                });
                householdSize += 1;
                dependentsCount += 1;
            }
        };

        for (let i = 1; i <= 5; i++) {
            addDependentIfApplicable(`Tax Dependent #${i} Date of Birth`);
        }
        let householdIncome = 0;
        let incomeDependent = answerObj['What is the TOTAL amount of taxable income earned by all of your dependents?'] ?? 0;
        householdIncome = incomeSelf + incomeSpouse + incomeDependent + incomePension + incomeSocialSecurity + incomeSocialSecuritySpouse + incomeOther ;
        console.log('householdSize', householdSize);
        console.log('householdIncome', householdIncome);
        console.log('dependentsCount', dependentsCount);
        console.log('applicantDetails', applicantDetails);

        console.log('zipcode', zipCode);

        console.log('state', getState(zipCode));
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_URL}api/subsidy`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    state: getState(zipCode),
                    zipCode: zipCode,
                    householdSize: householdSize,
                    householdIncome: householdIncome,
                    dependentsCount: dependentsCount,
                    applicantDetails: applicantDetails,
                }),
                // body: JSON.stringify({
                //     state: "MI",
                //     zipCode: "48103",
                //     householdSize: 4,
                //     householdIncome: 188800,
                //     dependentsCount: 2,
                //     applicantDetails: [
                //         { age: 60, smoker: true, relationship: "primary", gender: "male" },
                //         { age: 55, smoker: false, relationship: "spouse", gender: "female" },
                //         { age: 8, smoker: false, relationship: "dependent", gender: "male" },
                //         { age: 6, smoker: false, relationship: "dependent", gender: "female" }
                //     ],
                // }),
            });
            if (!response.ok) {
                throw new Error('Network response was not ok.');
            }
            const subsidyData = await response.json();
            aptc = (subsidyData.subsidy ?? 0) * 12;

        } catch (error) {
            console.error("Error calling /api/subsidy:", error);
        }
        /* aptc */

        let irmaa;
        if (answerObj['Are You Married?']) {
            irmaa = findPremium(loadedPremiums, 'joint', householdIncome, 'partB') * 12;
        }
        else {
            irmaa = findPremium(loadedPremiums, 'individual', householdIncome, 'partB') * 12;
        }
        let totalExpenses;

        // Array of Cash
        let valueOfTotalIncome = [];
        // Array of Expense
        let valueOfTotalExpenses = [];

        // Array of Coupon Bond
        let expoentialNoAdjusted = [];
        let expoentialJaeAdjusted = [];

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


        console.log('Optimized') // Optimized
        console.log('incomeSelf', incomeSelf);
        console.log('incomeSpouse', incomeSpouse);
        console.log('incomeSocialSecurity', incomeSocialSecurity);
        console.log('incomeSocialSecuritySpouse', incomeSocialSecuritySpouse);
        console.log('incomePension', incomePension);
        console.log('incomeOther', incomeOther);
        totalIncome = incomeSelf + incomeSpouse + incomeDependent + incomeSocialSecurity + incomeSocialSecuritySpouse + incomePension + incomeOther;
        console.log('totalIncome', totalIncome);
        totalExpenses = expenseHousing + expenseTransportation + expenseDaily + expenseHealth - aptc + irmaa;

        console.log('expenseHousing', expenseHousing);
        console.log('expenseTransportation', expenseTransportation);
        console.log('expenseDaily', expenseDaily);
        console.log('expenseHealth', expenseHealth);
        console.log('aptc', aptc);
        console.log('irmaa', irmaa);
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
        let interpolatedRates = await getInterestRate(totalYears);
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
            totalExpenses *= propotionAdjustedExpense;
            /* ----------------- Calculate withdrawAmount Per Each Balance during Monte Carlo Simulation ------------------------- */
            valueOfTotalIncome.push(totalIncome);
            totalIncome *= propotionAdjustedCash
            if (totalExpenses <= totalIncome) {
                for (var j = 0; j < countOfBalances; j++) {
                    withdrawalAmount[j][i] = 0;
                }
            }
            else {
                let shouldZeroValue = totalExpenses - totalIncome;
                for (var j = 0; j < countOfBalances; j++) {
                    if (shouldZeroValue <= 0) break; // No further withdrawAmount needed
                    const withdrawal = Math.min(shouldZeroValue, portfolioForEachYears[j][i]);
                    withdrawalAmount[j][i] = withdrawal;
                    shouldZeroValue -= withdrawal;
                }
            }
            /* ----------------- Calculate withdrawAmount Per Each Balance during Monte Carlo Simulation ------------------------- */
            for (var j = 0; j < countOfBalances; j++) {
                totalNetWorth[i] += portfolioForEachYears[j][i];
                const response = await getMonteCarloSimulation(Math.floor(portfolioForEachYears[j][i]), Math.floor(withdrawalAmount[j][i]), 1);
                const fiftyPercentileData = await get50thPercentileDataFromResponse(response) ?? [];
                portfolioForEachYears[j][i + 1] = fiftyPercentileData[1] ?? 0;
            }
            console.log('portfolioForEachYears', i, portfolioForEachYears[i]);
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
        await saveResult(resultData);
        return { success: true, message: 'Result was calculated and stored successfully.' };

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

// function generateRandomToken() {
//     const characters =
//         'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
//     const tokenLength = 32;
//     let token = '';

//     for (let i = 0; i < tokenLength; i++) {
//         const randomIndex = Math.floor(Math.random() * characters.length);
//         token += characters.charAt(randomIndex);
//     }
//     return token;
// }

const generateLink = async (token: String) => {
    const generatedLink: string = `${process.env.NEXT_PUBLIC_URL}result?token=${token}`;
    return generatedLink;
};

function findPremium(loadedPremiums: any, type = 'individual', income = 0, part = 'partB') {
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

