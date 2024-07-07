import { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
// ... other imports ...
import { BAD_REQUEST_MSG, SERVER_ERR_MSG } from "@/config/constants";
import { connectMongo } from "@/utils/dbConnect";
import { InputForTestingModel } from "@/models/inputfortesting.model";
export default function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const { method } = req;

    switch (method) {
        case 'GET':
            // Handle GET request
            getInputForTesting(req, res);
            break;
        case 'POST':
            // Handle POST request specific to Portfolio Settings
            upsertInputForTesting(req, res);
            break;
        case 'PUT':
            // Handle PUT request
            break;
        case 'DELETE':
            // Handle DELETE request
            break;
        default:
            res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE'])
            res.status(405).send(`Method ${method} Not Allowed`)
    }
}


async function getInputForTesting(req: NextApiRequest, res: NextApiResponse) {
    try {
        await connectMongo();
        const inputfortesting = await InputForTestingModel.findOne();
        if (!inputfortesting) {
            // If no settings are found, initialize with given values
            const initialValues = {
                // age
                ageSelf: 67,
                ageSpouse: 63,
                // income
                incomeSelf: 150000,
                incomeSpouse: 45000,
                incomeDependent: 10000,
                incomeSocialSecurity: 10000,
                incomeSocialSecuritySpouse: 8000,
                incomePension: 6000,
                incomeOther: 12000,
                //balance
                balanceCash: 200000,
                balanceQ: 250000,
                balanceQSpouse: 120000,
                balanceNQ: 150000,
                balanceRoth: 20000,
                balanceAnnuity: 30000,
                balanceLifeInsurance: 40000,
                //expense
                expenseHousing: 36000,
                expenseTransportation: 9600,
                expenseDaily: 180000,
                expenseHealth: 20000,
            };
            console.log("InitialValues", initialValues);
            const newInput = new InputForTestingModel(initialValues);
            await newInput.save();
            res.status(200).json(newInput);
        } else {
            res.status(200).json(inputfortesting);
        }
    } catch (error) {
        console.error(error); // Log the error for server-side inspection.
        res.status(500).json({ err: SERVER_ERR_MSG });
    }
}

const InputForTestingZodSchema = z.object({
    ageSelf: z.number().optional(),
    ageSpouse: z.number().optional(),
    incomeSelf: z.number().optional(),
    incomeDependent: z.number().optional(),
    incomeSpouse: z.number().optional(),
    incomeSocialSecurity: z.number().optional(),
    incomeSocialSecuritySpouse: z.number().optional(),
    incomePension: z.number().optional(),
    incomeOther: z.number().optional(),

    balanceCash: z.number().optional(),
    balanceQ: z.number().optional(),
    balanceQSpouse: z.number().optional(),
    balanceNQ: z.number().optional(),
    balanceRoth: z.number().optional(),
    balanceAnnuity: z.number().optional(),
    balanceLifeInsurance: z.number().optional(),

    expenseHousing: z.number().optional(),
    expenseTransportation: z.number().optional(),
    expenseDaily: z.number().optional(),
    expenseHealth: z.number().optional(),

});


async function upsertInputForTesting(req: NextApiRequest, res: NextApiResponse) {
    try {
        await connectMongo();
        let inputData;
        try {
            // Validate input data against the Zod schema
            inputData = InputForTestingZodSchema.parse(req.body);
            console.log('Input Data', inputData);
        } catch (err) {
            console.error(err); // Log the specific error for debugging purposes.
            if (err instanceof z.ZodError) {
                return res.status(400).json({
                    err: "Validation failed for input for testing date upsert",
                    validationErrors: err.errors,
                });
            }
            // If you reach this point, it's not a ZodError, so log and respond accordingly.
            res.status(500).json({ err: 'Internal Server Error' });
        }

        const existingInputData = await InputForTestingModel.findOne();
        let result;
        if (existingInputData) {
            // Update the existing settings document
            result = await InputForTestingModel.findByIdAndUpdate(existingInputData._id, inputData, {
                new: true
            });
        } else {
            // Create a new settings document since it doesn't exist
            result = await InputForTestingModel.create(inputData);
        }
        return res.status(200).json({ success: true, data: result });
    } catch (err) {
        console.error(err); // Log the error for server-side inspection.
        res.status(500).json({ err: 'Internal Server Error' });
    }
}

