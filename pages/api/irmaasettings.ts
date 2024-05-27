import { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
// ... other imports ...
import { BAD_REQUEST_MSG, SERVER_ERR_MSG } from "@/config/constants";
import { connectMongo } from "@/utils/dbConnect";
import { MedicarePremiumModel } from "@/models/irmaa.model";

export default function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const { method } = req;

    switch (method) {
        case 'GET':
            // Handle GET request
            getMedicarePremiums(req, res);
            break;
        case 'POST':
            // Handle POST request specific to Portfolio Settings
            saveMedicarePremiums(req, res);
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

async function saveMedicarePremiums(req: NextApiRequest, res: NextApiResponse) {
    try {
        await connectMongo();
        const { premiums } = req.body;
        
        // Assume each premium has a unique identifier, e.g., `individual` field is unique
        for (const premium of premiums) {
            // Upsert logic
            await MedicarePremiumModel.findOneAndUpdate(
                { individual: premium.individual }, // The condition to match the document
                premium, // The data to insert/update
                { upsert: true, new: true } // Options: create if not exist, return the updated document
            );
        }
        
        res.status(200).json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server China Error' });
    }
}

async function getMedicarePremiums(req: NextApiRequest, res: NextApiResponse) {
    try {
        await connectMongo();

        // Check if any premiums exist in the database
        const count = await MedicarePremiumModel.countDocuments();
        if (count === 0) {
            // Initializing values since there is no data
            const initialMedicarePremiums = [
                { individual: "$103,000 or less", joint: "$206,000 or less", partB: "$174.70", partD: "Plan Premium" },
                { individual: "$103,001 - $129,000", joint: "$206,001 - $258,000", partB: "$244.60", partD: "$12.90 + Plan Premium" },
                { individual: "$129,001 - $161,000", joint: "$258,001 -$322,000", partB: "$349.40", partD: "$33.50 + Plan Premium" },
                { individual: "$161,001 - $193,000", joint: "$322,001 - $386,000", partB: "$454.20", partD: "$53.80+ Plan Premium" },
                { individual: "$193,001 - $499,999", joint: "$386,001 - $749,000", partB: "$559.00", partD: "$74.20 + Plan Premium" },
                { individual: "$500,000+", joint: "$750,000+", partB: "$594.00", partD: "$81.00 + Plan Premium" },
            ];

            // Insert the initial data into the database
            await MedicarePremiumModel.insertMany(initialMedicarePremiums);
        }

        // Fetch all records after checking/inserting the initial data
        const premiums = await MedicarePremiumModel.find();
        res.status(200).json(premiums);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

