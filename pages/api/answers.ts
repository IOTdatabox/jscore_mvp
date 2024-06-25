import { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
// ... other imports ...
import { BAD_REQUEST_MSG, SERVER_ERR_MSG } from "@/config/constants";
import { connectMongo } from "@/utils/dbConnect";
import { AnswerData } from "@/models/typeformanswer.model";
export default function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const { method } = req;

    switch (method) {
        case 'GET':
            // Handle GET request
            getAnswer(req, res);
            break;
        case 'POST':
            // Handle POST request specific to Portfolio Settings
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


async function getAnswer(req: NextApiRequest, res: NextApiResponse) {
    const { id } = req.query;
    if (!id) {
        return res.status(400).json({ err: 'ID parameter is required' });
    }

    try {
        await connectMongo();
        const answer = await AnswerData.findById(id);
        if (!answer) {
            return res.status(404).json({ err: 'Document not found' });
        }
        res.status(200).json(answer);
    } catch (error) {
        console.error(error); // Log the error for server-side inspection.
        res.status(500).json({ err: SERVER_ERR_MSG });
    }
}