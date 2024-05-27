import { NextApiRequest, NextApiResponse } from "next";
import mongoose from 'mongoose';
import { z } from "zod";
import { connectMongo } from "@/utils/dbConnect";
import { RMDModel } from "@/models/rmd.model";
import RMDTable from "@/components/Constants/RMDTable";
// This function handles incoming requests to the API endpoint.
export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    await connectMongo(); // Ensure the MongoDB connection is established.

    const { method } = req;

    switch (method) {
        case 'GET':
            getRMDData(req, res);
            break;
        case 'POST':
            saveRMDData(req, res);
            break;
        case 'PUT':
            break;
        case 'DELETE':
            break;
        default:
            res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
            res.status(405).end(`Method ${method} Not Allowed`);
    }
}

async function getRMDData(req: NextApiRequest, res: NextApiResponse) {
    try {
        let rmdData = await RMDModel.find();

        // If there is no data, initialize with default values
        if (!rmdData.length) {
            const defaultRmdData = [
                { age: 72, percentage: 27.4 },
                { age: 73, percentage: 26.5 },
                { age: 74, percentage: 25.5 },
                { age: 75, percentage: 24.6 },
                { age: 76, percentage: 23.7 },
                { age: 77, percentage: 22.9 },
                { age: 78, percentage: 22 },
                { age: 79, percentage: 21.1 },
                { age: 80, percentage: 20.2 },
                { age: 81, percentage: 19.4 },
                { age: 82, percentage: 18.5 },
                { age: 83, percentage: 17.7 },
                { age: 84, percentage: 16.8 },
                { age: 85, percentage: 16 },
                { age: 86, percentage: 15.2 },
                { age: 87, percentage: 14.4 },
                { age: 88, percentage: 13.7 },
                { age: 89, percentage: 12.9 },
                { age: 90, percentage: 12.2 },
                { age: 91, percentage: 11.5 },
                { age: 92, percentage: 10.8 },
                { age: 93, percentage: 10.1 },
                { age: 94, percentage: 9.5 },
                { age: 95, percentage: 8.9 },
                { age: 96, percentage: 8.4 },
                { age: 97, percentage: 7.8 },
                { age: 98, percentage: 7.3 },
                { age: 99, percentage: 6.8 },
                { age: 100, percentage: 6.4 },
                { age: 101, percentage: 6 },
                { age: 102, percentage: 5.6 },
                { age: 103, percentage: 5.2 },
                { age: 104, percentage: 4.9 },
                { age: 105, percentage: 4.6 },
                { age: 106, percentage: 4.3 },
                { age: 107, percentage: 4.1 },
                { age: 108, percentage: 3.9 },
                { age: 109, percentage: 3.7 },
                { age: 110, percentage: 3.5 },
                { age: 111, percentage: 3.4 },
                { age: 112, percentage: 3.3 },
                { age: 113, percentage: 3.1 },
                { age: 114, percentage: 3 },
                { age: 115, percentage: 2.9 },
                { age: 116, percentage: 2.8 },
                { age: 117, percentage: 2.7 },
                { age: 118, percentage: 2.5 },
                { age: 119, percentage: 2.3 },
                { age: 120, percentage: 2 }
            ];
            rmdData = await RMDModel.insertMany(defaultRmdData);
        }
        res.status(200).json(rmdData);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

async function saveRMDData(req: NextApiRequest, res: NextApiResponse) {
    try {
        await connectMongo();
        const {rmdValues} = req.body;
        if (!Array.isArray(rmdValues)) {
            return res.status(400).json({ error: 'rmdDataArray must be an array' });
        }

        // Assume each age is unique identifier, so we use `age` instead of the non-existent `individual`
        for (const eachData of rmdValues) {
            // Upsert logic
            await RMDModel.findOneAndUpdate(
                { age: eachData.age },
                eachData, // The data to insert/update
                { upsert: true, new: true } // Options: create if not exist, return the updated document
            );
        }
        res.status(200).json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}