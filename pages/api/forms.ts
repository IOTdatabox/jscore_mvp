import { NextApiRequest, NextApiResponse } from "next";
import { Session, getServerSession } from "next-auth";
import { authOptions } from "./auth/[...nextauth]";
import { User } from "next-auth"
import { Types } from "mongoose";
import { z } from "zod";

import { BAD_REQUEST_MSG, SERVER_ERR_MSG } from "@/config/constants";
import { connectMongo } from "@/utils/dbConnect";
import { Form } from "@/models/form.model";

export default function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const { method } = req

    switch (method) {
        case 'GET':
            // Handle GET request
            getForms(req, res);
            break
        case 'POST':
            // Handle POST request
            createForm(req, res);
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

async function getForms(req: NextApiRequest, res: NextApiResponse) {
    try {
        await connectMongo();
        const forms = await Form.find();
        console.log(forms);
        res.status(200).json({ results: forms });
    } catch (err) {
        console.error("[Server Error] - Get Forms", err);
        res.status(500).json({ err: SERVER_ERR_MSG });
    }
}

async function createForm(req: NextApiRequest, res: NextApiResponse) {
    try {
        await connectMongo();

        const bodySchema = z.object({
            name: z.string().min(1),
            users: z.array(
                z.string().email()
            ),
            blocks: z.array(z.any())
        })
        const bodyZodResponse = bodySchema.safeParse(req.body);
        if (!bodyZodResponse.success) {
            const { errors } = bodyZodResponse.error;
            console.error("[Server Error] - Bad Request: ", errors);
            return res.status(400).json({ err: BAD_REQUEST_MSG });
        }
        const { name, users, blocks } = bodyZodResponse.data;
        const formId = new Types.ObjectId();
        let form = {
            _id: formId,
            name: name,
            author: new Types.ObjectId(),
            users: users,
            blocks: blocks
        }

        console.log(form.blocks[0].attributes);
        console.log(form);
        const newForm = new Form(form);
        const result = await newForm.save();
        if (!result) {
            return res.status(500).json({ success: false, err: SERVER_ERR_MSG });
        } else {
            return res.status(200).json({ success: true, result: form });
        }
    } catch (err) {
        res.status(500).json({ err: SERVER_ERR_MSG });
    }
}