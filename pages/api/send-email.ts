// pages/api/send-email.js
import sgMail from '@sendgrid/mail';
import { connectMongo } from "@/utils/dbConnect";
import { AnswerData } from '@/models/typeformanswer.model';
import type { NextApiRequest, NextApiResponse } from 'next';
import { BAD_REQUEST_MSG, SERVER_ERR_MSG } from "@/config/constants";


// Set the SendGrid API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY as string);
const EMAIL_FROM_ADDRESS = process.env.EMAIL_FROM_ADDRESS ?? "";
const SENDGRID_TEMPLATE_ID = process.env.SENDGRID_TEMPLATE_ID ?? "";



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

            const toEmail = answerDoc.answers[8].email;
            const userName = answerDoc.answers[5].text;

            const emailResponse = await sendEmailWithLink(toEmail, userName);

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

const sendEmailWithLink = async (
    toEmail: string,
    userName: string
  ) => {
    const msg = {
      to: toEmail, // Recipient email address
      from: {
        email: EMAIL_FROM_ADDRESS,
        name: 'GH2 Benefits',
      }, // Your verified sender address
      templateId: SENDGRID_TEMPLATE_ID,
      dynamicTemplateData: {
        subject: `Here are some insights to improve your dashboard.`,
        username: userName,
      },
      isMultiple: false,
    };
  
    try {
      await sgMail.send(msg);
      console.log('❤❤❤');
      return { success: true, message: 'Email sent successfully' };
    } catch (error) {
      console.error(error);
      return { success: false, error: 'Unknown error occurred' };
      // }
    }
  };

