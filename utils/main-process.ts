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
            const toEmail = answer[8].email;
            const userName = answer[5].text;
            const link = await generateLink(token)
            const emailResponse = await sendEmailForResult(toEmail, userName, link);
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
    console.log ('rateURL', `${process.env.NEXT_PUBLIC_URL}api/variousratesettings`);
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
        console.log("loadedRMDValues", loadedRMDValues);
        /*------Fetch RMD Data-------*/

        /*------Fetch IRMAA Data-------*/
        const responseForIRMAA = await fetch(`${process.env.NEXT_PUBLIC_URL}api/irmaasettings`);
        if (!responseForIRMAA.ok) throw new Error(`HTTP error! Status: ${responseForIRMAA.status}`);
        const loadedPremiums = await responseForIRMAA.json();
        console.log("loadedPremiums", loadedPremiums);
        /*------Fetch IRMAA Data-------*/

        /*------Fetch Portfolio Setting Data-------*/
        const response = await fetch( `${process.env.NEXT_PUBLIC_URL}api/portfoliosettings`, { method: 'GET' });
        console.log(response);
        if (!response.ok) throw new Error('Failed to fetch portfolio settings');
        const PvDatas = await response.json();
        console.log("PvDatas", PvDatas);
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