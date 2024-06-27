// pages/api/send-submission-email.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import sgMail from '@sendgrid/mail';
import { connectMongo } from "@/utils/dbConnect";
import { AnswerData } from '@/models/typeformanswer.model';
import { BAD_REQUEST_MSG, SERVER_ERR_MSG } from "@/config/constants";
import { mainProcess } from '@/utils/main-process';
import { TypeformResults } from '@/types/backend.type';

// Set the SendGrid API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY as string);
const EMAIL_FROM_ADDRESS = process.env.EMAIL_FROM_ADDRESS ?? "";
const SENDGRID_TEMPLATE_ID = process.env.SENDGRID_TEMPLATE_ID ?? "";


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        await connectMongo();
        // const answers = req.body.form_response.answers;
        const resultAnswers = processFormResponse(req.body.form_response)
        try {
            const answersArray = Object.entries(resultAnswers).map(([question, answer]) => ({ question, answer }));

            // Create a new AnswerData instance
            const answerDoc = new AnswerData({ answers: answersArray });

            const result = await answerDoc.save();
            if (!result) {
                return res.status(500).json({ success: false, err: SERVER_ERR_MSG });
            } else {
                const userName = resultAnswers['First name'];
                const toEmail = resultAnswers.Email;
                if (typeof userName !== 'string' || typeof toEmail !== 'string') {
                    // Handle the error appropriately, maybe log a message or throw an error
                    console.error('userName and toEmail must be strings');
                } else {
                    console.log("userName", userName);
                    console.log("toEmail", toEmail);
                    // const emailResponse = await sendEmailForSubmission(toEmail, userName);
                    // if (emailResponse.success) {
                    //     console.log('Email for submission sent successfully.');
                    //     const mainProcessResponse = await mainProcess(answerDoc);
                    //     if (mainProcessResponse.success) {
                    //         return res.status(200).json({
                    //             success: true,
                    //             message: emailResponse.message,
                    //         });
                    //     }
                    //     else {
                    //         console.log('Unknown error occurred during processing answers.');
                    //         return res.status(500).json({ success: false, error: emailResponse.error });
                    //     }


                    // } else {
                    //     console.log('Unknown error occurred during sending email for submssion.');
                    //     return res.status(500).json({ success: false, error: emailResponse.error });
                    // }

                    console.log('Email for submission sent successfully.');
                    const mainProcessResponse = await mainProcess(answerDoc);
                    if (mainProcessResponse.success) {
                        return res.status(200).json({
                            success: true,
                            message: mainProcessResponse.message,
                        });
                    }
                    else {
                        console.log('Unknown error occurred during processing answers.');
                        return res.status(500).json({ success: false, error: mainProcessResponse.error });
                    }

                }

            }
        } catch (error) {
            console.error('Error saving answers:', error);
            res.status(500).json({ success: false, error: 'Failed to save answers' });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).send(`Method ${req.method} Not Allowed`);
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

function processFormResponse(formResponse: any) {
    // Extracting definitions and answers from the form response
    const definitions = formResponse.definition.fields;
    const answers = formResponse.answers;

    // Setup an object to hold the result
    let results: TypeformResults = {};

    // Define a helper to find the field definition by ID
    function findFieldDefinitionById(id: any) {
        return definitions.find((field: { id: any; }) => field.id === id);
    }

    // Iterate over each answer
    for (const answer of answers) {
        // Find the corresponding field definition
        const fieldDef = findFieldDefinitionById(answer.field.id);

        // If a definition is found, process the answer
        if (fieldDef) {
            let answerValue;

            // Determine the type of the answer and extract the actual value
            switch (answer.type) {
                case 'choice':
                    answerValue = answer.choice.label;
                    break;
                case 'choices':
                    answerValue = answer.choices.labels;
                    break;
                case 'text':
                    answerValue = answer.text;
                    break;
                case 'boolean':
                    answerValue = answer.boolean;
                    break;
                case 'number':
                    answerValue = answer.number;
                    break;
                case 'phone_number':
                    answerValue = answer.phone_number;
                    break;
                case 'email':
                    answerValue = answer.email;
                    break;
                case 'date':
                    answerValue = answer.date;
                    break;
                default:
                    answerValue = null; // Or any other placeholder for unsupported types
                    break;
            }
            // Assign the value to the result object using the title as key
            results[fieldDef.title] = answerValue;
        }
    }
    return results;
}


