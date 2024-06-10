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

        const answers = req.body.form_response.answers;


        try {
            const answerDoc = new AnswerData({ answers });
            console.log("Constructed AnswerDoc", answerDoc);
            const result = await answerDoc.save();
            if (!result) {
                return res.status(500).json({ success: false, err: SERVER_ERR_MSG });
            } else {
                return res.status(200).json({ success: true, data: result });
            }
          } catch (error) {
            console.error('Error saving answers:', error);
            res.status(500).json({ error: 'Failed to save answers' });
          }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
