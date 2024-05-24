import { NextApiRequest, NextApiResponse } from "next";
import { Session, getServerSession } from "next-auth";
import { authOptions } from "./auth/[...nextauth]";
import { User } from "next-auth"
import { Types } from "mongoose";
import { z } from "zod";

import { BAD_REQUEST_MSG, SERVER_ERR_MSG } from "@/config/constants";
import { connectMongo } from "@/utils/dbConnect";
import { UserInputData } from "@/models/userinput.model";

export default function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const { method } = req

    switch (method) {
        case 'GET':
            // Handle GET request
            break
        case 'POST':
            // Handle POST request
            storeUserInput(req, res);
            break
        case 'PUT':
            // Handle PUT request
            break
        case 'DELETE':
            // Handle DELETE request
            break
        default:
            res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE'])
            res.status(405).end(`Method ${method} Not Allowed`)
    }
}

async function storeUserInput(req: NextApiRequest, res: NextApiResponse) {
    try {
        await connectMongo();
        const AnswerSchema = z.object({
            value: z.any(), // Since the type is mixed, consider more specific validation if applicable.
            isValid: z.boolean(),
            isAnswered: z.boolean(),
            isPending: z.boolean(),
            validationErr: z.any(), // Again, tailor this to expected types if not truly any type.
            isCorrectIncorrectScreenDisplayed: z.boolean(),
            isLocked: z.boolean(),
            blockName: z.string(),
        });

        const UserInputDataSchema = z.object({
            userEmail: z.string().email(),
            answers: z.record(AnswerSchema) // Assumes keys are strings and values follow the AnswerSchema.
        });

        const inputData = UserInputDataSchema.parse(req.body);
        const newUserInputData = new UserInputData(inputData);
        const result = await newUserInputData.save();
        if (!result) {
            return res.status(500).json({ success: false, err: SERVER_ERR_MSG });
        } else {
            return res.status(200).json({ success: true, data: result });
        }
    } catch (err) {
        if (err instanceof z.ZodError) {
            // This error is specifically from Zod; it's a validation failure.
            return res.status(400).json({
                err: "Validation failed for user input data",
                validationErrors: err.errors,
            });
        }
        // For all other kinds of errors:
        console.error(err); // Log the error for server-side inspection.
        res.status(500).json({ err: 'Internal Server Error' });
    }
}