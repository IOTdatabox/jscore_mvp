// util/main-process.ts
import sgMail from '@sendgrid/mail';
import { connectMongo } from "@/utils/dbConnect";

import { getSubsidy } from '@/utils/subsidy';
import { getDateComponents, calculateAge, getState } from './utils';
import { getOSSForSeveralFiledDate } from './openSocialSecurity';
import { ApplicantData } from '@/types/backend.type';
import { ifError } from 'assert';
sgMail.setApiKey(process.env.SENDGRID_API_KEY as string);
const EMAIL_FROM_ADDRESS = process.env.EMAIL_FROM_ADDRESS ?? "";
const SENDGRID_TEMPLATE_ID_RESULT = process.env.SENDGRID_TEMPLATE_ID_RESULT ?? "";

interface Answer {
    question: string;
    answer: any; // Change this to a more specific type if possible
}

interface AnswersMap {
    [key: string]: any; // Change this to a more specific type if applicable
}

function mapAnswers(answersArray: Answer[]): AnswersMap {
    const answersMap: AnswersMap = {};

    for (const { question, answer } of answersArray) {
        let normalizedQuestion: string = question.trim();
        // Remove unwanted characters or perform other normalization steps as needed
        normalizedQuestion = normalizedQuestion.replace('*', ''); // Example of removing asterisks

        // Map array answers and single-item answers differently if required
        if (Array.isArray(answer)) {
            answersMap[normalizedQuestion] = answer.map(item => item.hasOwnProperty('label') ? item.label : item);
        } else {
            answersMap[normalizedQuestion] = answer;
        }
    }
    return answersMap;
}


export async function mainProcess(answer: any) {
    console.log("Start main process...");
    try {
        const token = generateRandomToken();
        const answerObj = mapAnswers(answer.answers);
        const calculatedResults = await calculateAndStore(token, answerObj);
        if (!calculatedResults.success) {
            return { success: false, error: 'Unknown error occurred during processing the answers.' };
        } else {

            const firstName = answerObj['First name'] ?? 'Not provided';
            const toEmail = answerObj['Email'] ?? 'Not provided';
            console.log("userName", firstName);
            console.log("toEmail", toEmail);
            const link = await generateLink(token)
            const emailResponse = await sendEmailForResult(toEmail, firstName, link);
            if (emailResponse.success) {
                console.log('Email for result sent successfully.');
                return { success: true, message: 'Email for result sent successfully.' };

            } else {
                return { success: false, error: 'Unknown error occurred during sending email for result.' };
                console.log('Unknown error occurred during sending email for result.');
            }
        }
    }
    catch (error) {
        console.error('Error processing answers:', error);
        return { success: false, error: 'Unknown error occurred during sending email for result.' };
    }

}

async function calculateAndStore(token: string, answerObj: any) {
    try {
        /*------Fetch Various Rate-------*/

        const responseForVariousRate = await fetch(`${process.env.NEXT_PUBLIC_URL}api/variousratesettings`, { method: 'GET' });
        if (!responseForVariousRate.ok) throw new Error('Failed to fetch portfolio settings');
        const variousRateData = await responseForVariousRate.json();
        console.log("variousRateData", variousRateData);
        /*------Fetch Various Rate-------*/

        /*------Fetch RMD Data-------*/
        const responseForRMD = await fetch(`${process.env.NEXT_PUBLIC_URL}api/rmdsettings`);
        if (!responseForRMD.ok) throw new Error(`HTTP error! Status: ${responseForRMD.status}`);
        const loadedRMDValues = await responseForRMD.json();

        const rmdMap = loadedRMDValues.reduce((map: { [x: string]: any; }, item: { age: number; percentage: number; }) => {
            map[item.age] = item.percentage;
            return map;
        }, {});
        const ageToLookup = 100;
        const percentage = rmdMap[ageToLookup];
        console.log(`The RMD percentage for age ${ageToLookup} is ${percentage}%`);

        /*------Fetch RMD Data-------*/

        /*------Fetch IRMAA Data-------*/
        const responseForIRMAA = await fetch(`${process.env.NEXT_PUBLIC_URL}api/irmaasettings`);
        if (!responseForIRMAA.ok) throw new Error(`HTTP error! Status: ${responseForIRMAA.status}`);
        const loadedPremiums = await responseForIRMAA.json();
        try {
            const individualIncome = 0; // Example individual income
            const jointIncome = 0; // Example joint income
            const premiumType = 'partB'; // or 'partD' for Part D premium

            const individualPremiumPartB = findPremium(loadedPremiums, 'individual', individualIncome, premiumType);
            console.log(`The Part B premium for an individual with an income of $${individualIncome} is ${individualPremiumPartB}`);

            const jointPremiumPartB = findPremium(loadedPremiums, 'joint', jointIncome, premiumType);
            console.log(`The Part B premium for a joint filing with an income of $${jointIncome} is ${jointPremiumPartB}`);


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
        const currentAge = calculateAge(answerObj['Your Date Of Birth']);
        const calculationEndAge = 68;
        const totalYears = calculationEndAge - currentAge;
        console.log('currentAge', currentAge);
        const birthDate = getDateComponents(answerObj['Your Date Of Birth']);
        console.log('birthDate', birthDate);
        const birthDateSpouse = getDateComponents(answerObj["Your Spouse's Date Of Birth"]);
        console.log('birthDateSpouse', birthDateSpouse);

        // Cash Flow Sources
        let income = answerObj['Annual Earned Income?'] ?? 0;
        console.log('income', income);
        let incomeSpouse = answerObj["Spouse's Annual Income?"] ?? 0;
        console.log('incomeSpouse', incomeSpouse);
        let socialSecurity: any[][];
        if (answerObj['Do You Currently Receive Social Security benefits?']) {
            socialSecurity = answerObj['Monthly Social Security Amount'] ?? 0;
        }
        else {
            const PIAAmount = answerObj['What Is Your Primary Insured Amount (PIA)'] ?? 0;
            console.log('PIA', PIAAmount);
            socialSecurity = await getOSSForSeveralFiledDate('male', birthDate.month, birthDate.day, birthDate.year, PIAAmount);
        }
        console.log('socialSecurity', socialSecurity);
        let socialSecuritySouse: any[][];
        if (answerObj['Are You Married?']) {
            socialSecuritySouse = answerObj["Your Spouse's Monthly Social Security Amount"] ?? 0;
        }
        else {
            const PIAAmountSpouse = answerObj["What Is Your Spouse's Primary Insured Amount (PIA)"] ?? 0;
            console.log('PIAAmountSpouse', PIAAmountSpouse);
            socialSecuritySouse = await getOSSForSeveralFiledDate('male', birthDateSpouse.month, birthDateSpouse.day, birthDateSpouse.year, PIAAmountSpouse);
        }
        console.log('socialSecuritySouse', socialSecuritySouse);


        const pensionIncome = answerObj["Monthly Pension Amount"] ?? 0;
        console.log('pensionIncome', pensionIncome);
        let interestPreTax;
        const annuityIncome = answerObj["Monthly Annuity Income Amount"] ?? 0;
        const rentalIncome = answerObj["Monthly Rental Income"] ?? 0;
        const mortgageIncome = answerObj["Monthly Reverse Mortgage Payment"] ?? 0;
        const otherCashSources = (annuityIncome + rentalIncome + mortgageIncome) * 12;
        console.log('otherCashSources', otherCashSources);
        let semiTotalCash;
        let totalCash;

        // Balances
        const balanceCash = answerObj["*Cash, Savings, CDs*"] ?? 0;
        console.log('balanceCash', balanceCash);
        const balanceQ = answerObj["*Qualified Fund Balances*"] ?? 0;
        console.log('balanceQ', balanceQ);
        const balanceQSpouse = 0;
        const balanceNQ = answerObj["*Non-Qualified Fund Balances*"] ?? 0;
        console.log('balanceNQ', balanceNQ);
        const balanceRoth = answerObj["Roth IRA Balance"] ?? 0;
        console.log('balanceRoth', balanceRoth);
        const balanceAnnuity = 0;
        const balanceLifeInsurance = 0;

        let totalBalances;

        // Expenses
        let dailyExpenses;
        let housing;
        if (answerObj["Housing"] == 'Own') {
            housing = answerObj["*Mortgage Payment?*"] ?? 0 + answerObj["*Mortgage Monthly Payment?*"] ?? 0;
        }
        else {
            housing = answerObj["*Monthly Rent?*"] ?? 0;
        }
        console.log('housing', housing);
        let transportation;
        if (answerObj["Transportation"] == 'Lease') {
            transportation = answerObj["*Auto Lease Amount?*"] ?? 0;
        }
        else {
            transportation = answerObj["*Auto Loan Principal Balance?*"] ?? 0 + answerObj["*Auto Loan Payment Amount?*"] ?? 0;
        }
        console.log('transportation', transportation);
        let zipCode = answerObj['Your Residential Zip Code'] ?? '00000';
        let householdSize = 1;
        let dependentsCount = 0;
        let applicantDetails: ApplicantData[] = [
            {
                relationship: 'primary',
                gender: 'male',
                age: currentAge,
            },
        ];
        if (birthDateSpouse) {
            householdSize += 1;
            const spouseAge = calculateAge(answerObj["Your Spouse's Date Of Birth"]); // You need to define the getAgeFromBirthDate() function
            applicantDetails.push({
                relationship: 'spouse',
                gender: 'female', // or 'male' depending on your application's requirements
                age: spouseAge,
            });
        }
        const addDependentIfApplicable = (dependentDOBKey: string) => {
            const dob = getDateComponents(answerObj[dependentDOBKey]);
            if (dob) {
                // Assuming you have a way to calculate the age from the date components
                const dependentAge = calculateAge(answerObj[dependentDOBKey]); // Define this function based on your logic to calculate age
                applicantDetails.push({
                    relationship: 'dependent',
                    gender: 'male',
                    age: dependentAge,
                });
                householdSize += 1;
                dependentsCount += 1;
            }
        };

        for (let i = 1; i <= 5; i++) {
            addDependentIfApplicable(`Tax Dependent #${i} Date of Birth`);
        }

        let householdIncome = 0;
        householdIncome = income + incomeSpouse + pensionIncome +
            answerObj['What is the TOTAL amount of taxable income earned by all of your dependents?'] ?? 0;
        try {
            let aptc = getSubsidy(
                zipCode,
                (answerObj['Your Residential Zip Code'] ?? '00000'),
                householdSize,
                householdIncome,
                dependentsCount,
                applicantDetails,
            );
            console.log(`The subsidy amount is ${aptc}`);

        } catch (error) {
            console.error(error);
        }

        let irmaa;
        if (answerObj['Are You Married?']) {
            irmaa = findPremium(loadedPremiums, 'individual', 0, 'partB');
        }
        else {
            irmaa = findPremium(loadedPremiums, 'joint', 0, 'partB');
        }
        console.log('IRMAA', irmaa);
        let totalExpenses;
        let sources = [
            { name: 'Cash', balance: balanceCash },
            { name: 'NQ', balance: balanceNQ },
            { name: 'Q', balance: balanceQ },
            { name: 'QSpouse', balance: balanceQSpouse },
            { name: 'Roth', balance: balanceRoth },
            { name: 'Annuity', balance: balanceAnnuity },
            { name: 'LifeInsurance', balance: balanceLifeInsurance },
        ];

        let withdrawAmount = {
            Cash: 0,
            NQ: 0,
            Q: 0,
            QSpouse: 0,
            Roth: 0,
            Annuity: 0,
            LifeInsurance: 0,
        };

        // Array of Cash
        let valueOfIncome = [];
        let valueOfSocialSecurity = [];
        let valueOfSocialSecuritySpouse = [];
        let valueOfPensionIncome = [];
        let valueOfInterestPreTax = [];
        let valueOfOtherCashSources = [];
        let valueOfTotalCash = [];

        // Array of Expense
        let valueOfDailyExpenses = [];
        let valueOfHousing = [];
        let valueOfTaxes = [];
        let valueOfHealthExpenses = [];
        let valueOfAPTC = [];
        let valueOfIRMAA = [];
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

        console.log('taxRateForGains', taxRateForGains);


        return { success: true, message: 'Result was calculated and stored successfully.' };
    }
    catch (error: any) {
        // Log detailed error response from SendGrid
        if (error.response) {
            console.error('ResponseError', error.response.body);
        } else {
            console.error(error);
        }
        return { success: false, error: 'Unknown error occurred during processing the answers.' };
    }
}

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

const generateLink = async (token: String) => {
    const generatedLink: string = `${process.env.NEXT_PUBLIC_URL}results?token=${token}`;
    return generatedLink;
};

function findPremium(loadedPremiums: any, type = 'individual', income = 0, part = 'partB') {
    // Helper function to check if income falls within the specified range
    const isInIncomeRange = (incomeRange: any, income: number) => {
        const [lowStr, highStr] = incomeRange.split(' - ');
        const low = parseInt(lowStr.replace(/[$,]+/g, ''));
        const high = highStr ? parseInt(highStr.replace(/[+$,]+/g, '')) : Infinity;
        return income >= low && income <= high;
    };

    // Find the corresponding bracket based on income and type (individual or joint)
    const premiumInfo = loadedPremiums.find((premium: { [x: string]: string; }) => {
        const incomeRange = premium[type].replace(' or less', ' - $0'); // Adjust for "or less" cases
        return isInIncomeRange(incomeRange, income);
    });

    // Extract the correct Part B or Part D premium
    if (premiumInfo) {
        return premiumInfo[part];
    } else {
        throw new Error('No matching premium information found for the given criteria.');
    }
}


const sendEmailForResult = async (
    toEmail: string,
    userName: string,
    link: string
) => {
    const msg = {
        to: toEmail, // Recipient email address
        from: {
            email: EMAIL_FROM_ADDRESS,
            name: 'GH2 Benefits',
        },
        templateId: SENDGRID_TEMPLATE_ID_RESULT,
        dynamicTemplateData: {
            subject: `We received your submission successfully.`,
            username: userName,
            link: link,
        },
        isMultiple: false,
    };

    try {
        await sgMail.send(msg);
        console.log('❤❤❤');
        return { success: true, message: 'Email sent successfully' };
    } catch (error: any) {
        // Log detailed error response from SendGrid
        if (error.response) {
            console.error('ResponseError', error.response.body);
        } else {
            console.error(error);
        }
        return { success: false, error: 'Unknown error occurred' };
    }
};