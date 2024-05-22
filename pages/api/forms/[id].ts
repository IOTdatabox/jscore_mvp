import { NextApiRequest, NextApiResponse } from "next";
import { Session, getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import { User } from "next-auth"
import { Types } from "mongoose";
import { z } from "zod";

import { BAD_REQUEST_MSG, SERVER_ERR_MSG } from "@/config/constants";
import { connectMongo } from "@/utils/dbConfig";
import { zodObjectId } from "@/utils/utils";
import { Form } from "@/models/form.model";

export default function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const { method } = req

    switch (method) {
        case 'GET':
            // Handle GET request
            getForm(req, res);
            break
        case 'POST':
            // Handle POST request
            checkValidUser(req, res);
            break
        case 'PUT':
            // Handle PUT request
            updateForm(req, res);
            break
        case 'DELETE':
            // Handle DELETE request
            deleteForm(req, res);
            break
        default:
            res.setHeader('Allow', ['GET', 'POST', 'DELETE', 'PUT'])
            res.status(405).end(`Method ${method} Not Allowed`)
    }
}

async function getForm(req: NextApiRequest, res: NextApiResponse) {
    try {
        const session: Session | null = await getServerSession(req, res, authOptions);
        const userSession = session?.user as User;

        const querySchema = z.object({
            id: zodObjectId,
        })
        const queryZodResponse = querySchema.safeParse(req.query);

        if (!queryZodResponse.success) {
            const { errors } = queryZodResponse.error;
            console.error("[Server Error] - Bad Request: ", errors);
            return res.status(400).json({ err: BAD_REQUEST_MSG });
        }

        const { id } = queryZodResponse.data;

        await connectMongo();

        const formId = new Types.ObjectId(id?.toString());
        const form = await Form.findById(formId);
        if (form) {
            res.status(200).json({ detail: form });
        } else {
            res.status(500).json({ err: SERVER_ERR_MSG });
        }
    } catch (err) {
        res.status(500).json({ err: SERVER_ERR_MSG });
    }
}

async function updateForm(req: NextApiRequest, res: NextApiResponse) {
    try {
        const querySchema = z.object({
            id: zodObjectId,
        })

        const queryZodResponse = querySchema.safeParse(req.query);

        if (!queryZodResponse.success) {
            const { errors } = queryZodResponse.error;
            console.error("[Server Error] - Bad Request: ", errors);
            return res.status(400).json({ err: BAD_REQUEST_MSG });
        }

        const { id } = queryZodResponse.data;

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

        const formId = new Types.ObjectId(id.toString())
        const { name, users, blocks } = bodyZodResponse.data;
        const result = await Form
            .updateOne(
                { _id: formId },
                {
                    $set: {
                        name: name,
                        users: users,
                        blocks: blocks
                    }
                });

        if (!result.matchedCount) {
            res.status(500).json({ success: false, err: SERVER_ERR_MSG });
        } else {
            res.status(200).json({ success: true });
        }
    } catch (err) {
        console.error("[Server Error] - Update Form ", err)
        res.status(500).json({ err: SERVER_ERR_MSG });
    }
}

async function checkValidUser(req: NextApiRequest, res: NextApiResponse) {
    try {
        const querySchema = z.object({
            id: zodObjectId,
        })

        const queryZodResponse = querySchema.safeParse(req.query);

        if (!queryZodResponse.success) {
            const { errors } = queryZodResponse.error;
            console.error("[Server Error] - Bad Request: ", errors);
            return res.status(400).json({ err: BAD_REQUEST_MSG });
        }

        const { id } = queryZodResponse.data;

        const bodySchema = z.object({
            email: z.string().email()
        })

        const bodyZodResponse = bodySchema.safeParse(req.body);

        if (!bodyZodResponse.success) {
            const { errors } = bodyZodResponse.error;
            console.error("[Server Error] - Bad Request: ", errors);
            return res.status(400).json({ err: BAD_REQUEST_MSG });
        }

        const formId = new Types.ObjectId(id.toString())
        const { email } = bodyZodResponse.data;
        const form = await Form.findById(formId);

        if (!form) {
            res.status(500).json({ err: 'Not found matched form' });
            return;
        } else {
            if (!form.users.includes(email)) {
                res.status(500).json({ err: `You don't have access to this form` });
                return;
            }

            res.status(200).json({ success: true, err: null });
        }
    } catch (err) {
        console.error("[Server Error] - Check Email Valid of Form ", err)
        res.status(500).json({ err: SERVER_ERR_MSG });
    }
}

async function deleteForm(req: NextApiRequest, res: NextApiResponse) {
    try {
        const querySchema = z.object({
            id: zodObjectId,
        })
        const queryZodResponse = querySchema.safeParse(req.query);
        if (!queryZodResponse.success) {
            const { errors } = queryZodResponse.error;
            console.error("[Server Error] - Bad Request: ", errors);
            return res.status(400).json({ err: BAD_REQUEST_MSG });
        }
        const { id } = queryZodResponse.data;

        await connectMongo();
        const formId = new Types.ObjectId(id?.toString());
        const result = await Form
            .deleteOne({ _id: formId });

        if (!result.acknowledged) {
            res.status(500).json({ err: SERVER_ERR_MSG });
        } else {
            res.status(200).json({ success: true });
        }
    } catch (err) {
        res.status(500).json({ err: SERVER_ERR_MSG });
    }
}