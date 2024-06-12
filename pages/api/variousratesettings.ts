import { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
// ... other imports ...
import { BAD_REQUEST_MSG, SERVER_ERR_MSG } from "@/config/constants";
import { connectMongo } from "@/utils/dbConnect";
import { VariousRateModel } from "@/models/variousrate.model";
export default function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const { method } = req;

    switch (method) {
        case 'GET':
            // Handle GET request
            getVariousRate(req, res);
            break;
        case 'POST':
            // Handle POST request specific to Portfolio Settings
            upsertVariousRate(req, res);
            break;
        case 'PUT':
            // Handle PUT request
            break;
        case 'DELETE':
            // Handle DELETE request
            break;
        default:
            res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE'])
            res.status(405).end(`Method ${method} Not Allowed`)
    }
}


async function getVariousRate(req: NextApiRequest, res: NextApiResponse) {
    try {
        await connectMongo();

        const variousRates = await VariousRateModel.findOne();
        console.log("FGSDSFSDFSD");
        if (!variousRates) {
            // If no settings are found, initialize with given values
            const initialValues = {
                cashRate: 2.5,
                expenseRate: 3.5,
                jAdjustedRate: 0.75,
                taxRateForIncome: 30,
                taxRateForRoth: 0,
                taxRateForGains: 20,
            };
            console.log("InitialValues", initialValues);
            const newRates = new VariousRateModel(initialValues);
            await newRates.save();
            res.status(200).json(newRates);
        } else {
            res.status(200).json(variousRates);
        }
    } catch (error) {
        console.error(error); // Log the error for server-side inspection.
        res.status(500).json({ err: SERVER_ERR_MSG });
    }
}

const VariousRatesZodSchema = z.object({
    cashRate: z.number().optional(),
    expenseRate: z.number().optional(),
    jAdjustedRate: z.number().optional(),
    taxRateForIncome: z.number().optional(),
    taxRateForRoth: z.number().optional(),
    taxRateForGains: z.number().optional(),
    
});


async function upsertVariousRate(req: NextApiRequest, res: NextApiResponse) {
    try {
        await connectMongo();
        let inputData;
        try {
            // Validate input data against the Zod schema
            inputData = VariousRatesZodSchema.parse(req.body);
            console.log('Input Data', inputData);
        } catch (err) {
            console.error(err); // Log the specific error for debugging purposes.
            if (err instanceof z.ZodError) {
                return res.status(400).json({
                    err: "Validation failed for portfolio settings",
                    validationErrors: err.errors,
                });
            }
            // If you reach this point, it's not a ZodError, so log and respond accordingly.
            res.status(500).json({ err: 'Internal Server Error' });
        }

        const existingRates = await VariousRateModel.findOne();
        let result;
        if (existingRates) {
            // Update the existing settings document
            result = await VariousRateModel.findByIdAndUpdate(existingRates._id, inputData, {
                new: true
            });
        } else {
            // Create a new settings document since it doesn't exist
            result = await VariousRateModel.create(inputData);
        }
        return res.status(200).json({ success: true, data: result });
    } catch (err) {
        console.error(err); // Log the error for server-side inspection.
        res.status(500).json({ err: 'Internal Server Error' });
    }
}

