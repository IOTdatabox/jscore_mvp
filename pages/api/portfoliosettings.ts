import { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
// ... other imports ...
import { BAD_REQUEST_MSG, SERVER_ERR_MSG } from "@/config/constants";
import { connectMongo } from "@/utils/dbConnect";
import { PortfolioSetting } from "@/models/pv.model"

export default function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const { method } = req;

    switch (method) {
        case 'GET':
            // Handle GET request
            getPortfolioSettings(req, res);
            break;
        case 'POST':
            // Handle POST request specific to Portfolio Settings
            upsertPortfolioSettings(req, res);
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

const PortfolioSettingsZodSchema = z.object({
    inflationOption: z.string().optional(),
    taxOption: z.string().optional(),
    investmentOption: z.string().optional(),
    returnRiskOption: z.string().optional(),
    rebalancingOption: z.string().optional(),
    federalTax: z.number().optional(),
    capitalTax: z.number().optional(),
    dividendTax: z.number().optional(),
    affordableTax: z.number().optional(),
    stateTax: z.number().optional(),
    assetAllocations: z.array(z.string()).optional(),
    allocationAmounts: z.array(z.number()).optional(),
});


async function upsertPortfolioSettings(req: NextApiRequest, res: NextApiResponse) {
    try {
        await connectMongo();
        let inputData;
        try {
            // Validate input data against the Zod schema
            inputData = PortfolioSettingsZodSchema.parse(req.body);
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

        const existingSettings = await PortfolioSetting.findOne();
        let result;
        if (existingSettings) {
            // Update the existing settings document
            result = await PortfolioSetting.findByIdAndUpdate(existingSettings._id, inputData, {
                new: true
            });
        } else {
            // Create a new settings document since it doesn't exist
            result = await PortfolioSetting.create(inputData);
        }

        return res.status(200).json({ success: true, data: result });
    } catch (err) {
        console.error(err); // Log the error for server-side inspection.
        res.status(500).json({ err: 'Internal Server Error' });
    }
}

async function getPortfolioSettings(req: NextApiRequest, res: NextApiResponse) {
    try {
        await connectMongo();

        const settings = await PortfolioSetting.findOne();
        console.log('Setting', settings);
        if (!settings) {
            // If no settings are found, initialize with given values
            const initialValues = {
                inflationOption: 'Yes',
                taxOption: 'Pre-Tax Returns',
                investmentOption: 'Simulated Period',
                returnRiskOption: 'No Adjustments',
                rebalancingOption: 'No rebalancing',
                federalTax: 0,
                capitalTax: 0,
                dividendTax: 0,
                affordableTax: 0,
                stateTax: 0,
                assetAllocations: Array(10).fill("TotalStockMarket"),
                allocationAmounts: Array(10).fill(0)
            };
            const newSettings = new PortfolioSetting(initialValues);
            await newSettings.save();
            res.status(200).json(newSettings);
        } else {
            res.status(200).json(settings);
        }
    } catch (error) {
        console.error(error); // Log the error for server-side inspection.
        res.status(500).json({ err: SERVER_ERR_MSG });
    }
}

