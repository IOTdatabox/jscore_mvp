// util/main-process.ts
import sgMail from '@sendgrid/mail';
import { connectMongo } from "@/utils/dbConnect";

import { getSubsidy } from '@/utils/subsidy';

sgMail.setApiKey(process.env.SENDGRID_API_KEY as string);
const EMAIL_FROM_ADDRESS = process.env.EMAIL_FROM_ADDRESS ?? "";
const SENDGRID_TEMPLATE_ID_RESULT = process.env.SENDGRID_TEMPLATE_ID_RESULT ?? "";

export async function mainProcess(answer: any) {
    console.log("Start main process...");
    try {
        const token = generateRandomToken();
        const calculatedResults = await calculateAndStore(token, answer);
        if (!calculatedResults.success) {
            return { success: false, error: 'Unknown error occurred during processing the answers.' };
        } else {

            const firstNameObj = answer.answers.find((answerObj: { question: string; }) => answerObj.question === 'First name');
            const firstName = firstNameObj ? firstNameObj.answer : 'Not provided';
            const emailObj = answer.answers.find((answerObj: { question: string; }) => answerObj.question === 'Email');
            const toEmail = emailObj ? emailObj.answer : 'Not provided';
            console.log('Answer', answer);
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

async function calculateAndStore(token: string, answer: any) {
    console.log("answer", answer);
    console.log('rateURL', `${process.env.NEXT_PUBLIC_URL}api/variousratesettings`);
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
            const individualIncome = 200000; // Example individual income
            const jointIncome = 500000; // Example joint income
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

async function showSubsidy() {
    const state = 'CA'; // Sample values
    const zipCode = '90210';
    const fipCode = '12345,6789';
    const householdSize = 4;
    const householdIncome = 50000;
    const dependentsCount = 2;
    const applicantDetails = [
        { relationship: 'primary', age: 35, smoker: false, gender: 'male' },
        // Add more applicant details as needed...
    ];

    try {
        const subsidyAmount = await getSubsidy(state, zipCode, fipCode, householdSize, householdIncome, dependentsCount, applicantDetails);
        console.log(`The subsidy amount is ${subsidyAmount}`);
    } catch (error) {
        console.error(error);
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
    console.log(generatedLink, 'generatedLink');
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