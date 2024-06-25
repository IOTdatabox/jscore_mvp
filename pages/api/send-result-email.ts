// pages/api/sendEmail.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY as string);
const EMAIL_FROM_ADDRESS = process.env.EMAIL_FROM_ADDRESS ?? "";
const SENDGRID_TEMPLATE_ID_RESULT = process.env.SENDGRID_TEMPLATE_ID_RESULT ?? "";

export default async function handler(req : NextApiRequest, res : NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, message: 'Method Not Allowed' });
    }

    const { toEmail, userName, link } = req.body;

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
        console.log('Email sent');
        return res.status(200).json({ success: true, message: 'Email sent successfully' });
    } catch (error: any) {
        // Log detailed error response from SendGrid
        if (error.response) {
            console.error('ResponseError', error.response.body);
        } else {
            console.error(error);
        }
        return res.status(500).json({ success: false, error: 'Unknown error occurred' });
    }
}
