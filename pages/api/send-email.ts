// pages/api/send-email.js
import sgMail from '@sendgrid/mail';
import { connectMongo } from "@/utils/dbConnect";
import { AnswerData } from '@/models/typeformanswer.model';
import type { NextApiRequest, NextApiResponse } from 'next';
import { BAD_REQUEST_MSG, SERVER_ERR_MSG } from "@/config/constants";


// Set the SendGrid API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY as string);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        // Extract the form submission data sent via Typeform webhook
        console.log("Answer", req.body.form_response.answers);

        await connectMongo();

        const { answers } = req.body.form_response.answers;


        try {
            const answerDoc = new AnswerData({ answers });
            console.log("AnswerDoc", answerDoc);
            const result = await answerDoc.save();
            if (!result) {
                return res.status(500).json({ success: false, err: SERVER_ERR_MSG });
            } else {
                return res.status(200).json({ success: true, data: result });
            }
            res.status(200).json({ message: 'Answers saved successfully' });
          } catch (error) {
            console.error('Error saving answers:', error);
            res.status(500).json({ error: 'Failed to save answers' });
          }

        // // You will need to replace 'email_field_id' with the actual ID of your email field from Typeform
        // const userEmail : string = formResponse.answers.find((answer: { field: { id: string; }; }) => answer.field.id === 'email_field_id').email;

        // // Define the email message
        // const msg = {
        //     to: userEmail,
        //     from: process.env.EMAIL_FROM_ADDRESS ?? "whaydigital@gmail.com", // Use the email address verified with SendGrid
        //     templateId: 'd-9b4542b5f2434f5aa06b86bc96012f52',
        //     dynamicTemplateData: {
        //       subject: 'Here are some insights to improve your dashboard.',
        //       username: 'XXX',
        //     },
        // };

        // try {
        //     await sgMail.send(msg);
        //     console.log(`Email sent to ${userEmail}`);
        //     res.status(200).json({ message: 'Email sent' });
        // } catch (error: unknown) { // Explicitly declare error as unknown
        //     console.error('Error sending email:', error);

        //     // Type guard to check if 'error' has a 'response' property
        //     if (typeof error === "object" && error !== null && "response" in error) {
        //         // Now TypeScript knows that 'error' is an object with a 'response' property
        //         const axiosError = error as { response: { body: string } };
        //         console.error(axiosError.response.body);
        //     }
        // }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
