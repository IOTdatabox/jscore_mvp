import { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
// ... other imports ...
import { BAD_REQUEST_MSG, SERVER_ERR_MSG } from "@/config/constants";
import { connectMongo } from "@/utils/dbConnect";
import { InputForTestingPIAModel } from "@/models/inputfortestingpia.model";
export default function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const { method } = req;

    switch (method) {
        case 'GET':
            // Handle GET request
            getInputForTestingPIA(req, res);
            break;
        case 'POST':
            // Handle POST request specific to Portfolio Settings
            upsertInputForTestingPIA(req, res);
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

async function getInputForTestingPIA(req: NextApiRequest, res: NextApiResponse) {
    try {
        await connectMongo();
        const inputfortesting = await InputForTestingPIAModel.findOne();
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
                incomePension: 6000,
                incomeOther: 12000,
                //pia
                pia: 3000,
                piaSpouse: 1500,
                //balance
                balanceCash: 200000,
                balanceQ: 250000,
                balanceQSpouse: 120000,
                balanceNQ: 150000,
                balanceRoth: 20000,
                balanceAnnuity: 30000,
                balanceLifeInsurance: 40000,

                useOtherSourcesOption: 'Yes',
                //expense
                expenseHousing: 36000,
                expenseTransportation: 9600,
                expenseDaily: 180000,
                expenseHealth: 20000,

                //retirement age
                retirementAge: 1000,
                retirementAgeSpouse: 1000,

            };
            console.log("InitialValues", initialValues);
            const newInput = new InputForTestingPIAModel(initialValues);
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
    incomePension: z.number().optional(),
    incomeOther: z.number().optional(),

    pia: z.number().optional(),
    piaSpouse: z.number().optional(),

    balanceCash: z.number().optional(),
    balanceQ: z.number().optional(),
    balanceQSpouse: z.number().optional(),
    balanceNQ: z.number().optional(),
    balanceRoth: z.number().optional(),
    balanceAnnuity: z.number().optional(),
    balanceLifeInsurance: z.number().optional(),

    useOtherSourcesOption: z.string().optional(),

    expenseHousing: z.number().optional(),
    expenseTransportation: z.number().optional(),
    expenseDaily: z.number().optional(),
    expenseHealth: z.number().optional(),

    retirementAge: z.number().optional(),
    retirementAgeSpouse: z.number().optional()
});


async function upsertInputForTestingPIA(req: NextApiRequest, res: NextApiResponse) {
    try {
        await connectMongo();
        console.log('********************');
        let inputData;
        try {
            // Validate input data against the Zod schema
            inputData = InputForTestingZodSchema.parse(req.body);
            console.log('Input Data PIA', inputData);
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

        const existingInputData = await InputForTestingPIAModel.findOne();
        let result;
        if (existingInputData) {
            // Update the existing settings document
            result = await InputForTestingPIAModel.findByIdAndUpdate(existingInputData._id, inputData, {
                new: true
            });
        } else {
            // Create a new settings document since it doesn't exist
            result = await InputForTestingPIAModel.create(inputData);
        }
        return res.status(200).json({ success: true, data: result });
    } catch (err) {
        console.error(err); // Log the error for server-side inspection.
        res.status(500).json({ err: 'Internal Server Error' });
    }
}

