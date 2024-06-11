// pages/api/send-email.js
import type { NextApiRequest, NextApiResponse } from 'next';
import sgMail from '@sendgrid/mail';
import { connectMongo } from "@/utils/dbConnect";
import { AnswerData } from '@/models/typeformanswer.model';
import { BAD_REQUEST_MSG, SERVER_ERR_MSG } from "@/config/constants";


// Set the SendGrid API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY as string);
const EMAIL_FROM_ADDRESS = process.env.EMAIL_FROM_ADDRESS ?? "";
const SENDGRID_TEMPLATE_ID = process.env.SENDGRID_TEMPLATE_ID ?? "";



export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        await connectMongo();
        const answers = req.body.form_response.answers;
        try {
            const answerDoc = new AnswerData({ answers });
            console.log("Constructed AnswerDoc", answerDoc);
            const result = await answerDoc.save();
            if (!result) {
                return res.status(500).json({ success: false, err: SERVER_ERR_MSG });
            } else {
                const userName = answerDoc.answers[6].text;
                const toEmail = answerDoc.answers[9].email;

                console.log("userName", userName);
                console.log("toEmail", toEmail);

                const emailResponse = await sendEmailForSubmission(toEmail, userName);
                if (emailResponse.success) {
                    console.log('Email for submission sent successfully.');
                    
                    return res.status(200).json({
                        success: true,
                        message: emailResponse.message,
                    });
                } else {
                    console.log('Unknown error occurred during sending email for submssion.');
                    return res.status(500).json({ success: false, error: emailResponse.error });
                }
            }
        } catch (error) {
            console.error('Error saving answers:', error);
            res.status(500).json({ success: false, error: 'Failed to save answers' });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}

const sendEmailForSubmission = async (
    toEmail: string,
    userName: string
) => {
    const msg = {
        to: toEmail, // Recipient email address
        from: {
            email: EMAIL_FROM_ADDRESS,
            name: 'GH2 Benefits',
        },
        templateId: SENDGRID_TEMPLATE_ID,
        dynamicTemplateData: {
            subject: `We received your submission successfully.`,
            username: userName,
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
