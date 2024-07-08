import { NextApiRequest, NextApiResponse } from 'next';
import { connectMongo } from '@/utils/dbConnect';
import { ResultData } from '@/models/result.model';

// Define the main handler
export default function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const { method } = req;

    switch (method) {
        case 'GET':
            getResult(req, res);
            break;
        case 'POST':
            saveResult(req, res);
            break;
        case 'PUT':
            // Handle PUT request if needed
            break;
        case 'DELETE':
            // Handle DELETE request if needed
            break;
        default:
            res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
            res.status(405).send(`Method ${method} Not Allowed`);
    }
}

// Function to handle GET requests
async function getResult(req: NextApiRequest, res: NextApiResponse) {
    const { id: questionID } = req.query;

    if (!questionID) {
        return res.status(400).json({ err: 'ID parameter is required' });
    }

    try {
        await connectMongo();
        const result = await ResultData.findOne({ "results.questionID": questionID });
        if (!result) {
            return res.status(404).json({ err: 'Document not found' });
        }
        res.status(200).json(result);
    } catch (error) {
        console.error(error); // Log the error for server-side inspection.
        res.status(500).json({ err: 'Internal Server Error' });
    }
}

// Function to handle POST requests
async function saveResult(req: NextApiRequest, res: NextApiResponse) {
    const { questionID, totalYears, valueOfTotalIncome, valueOfTotalExpenses, withdrawalAmount, 
        portfolioForEachYears, totalNetWorth, divisionResults, presentValue } = req.body;
    console.log('Inside Saveresult', questionID);
    if (!questionID || !totalYears || !valueOfTotalIncome || !valueOfTotalExpenses || !withdrawalAmount ||
        !portfolioForEachYears|| !totalNetWorth || !divisionResults || !presentValue ) {
            console.log('Missing required fields')
        return res.status(400).json({ err: 'Missing required fields' });
    }
    try {
        await connectMongo();
        const newEntry = {
            questionID,
            totalYears,
            valueOfTotalIncome,
            valueOfTotalExpenses,
            withdrawalAmount,
            portfolioForEachYears,
            totalNetWorth,
            divisionResults,
            presentValue
        };
        const newResult = new ResultData({ results: [newEntry] });
        await newResult.save();
        res.status(200).json(newResult);
    } catch (error) {
        console.error(error); // Log the error for server-side inspection.
        res.status(500).json({ err: 'Internal Server Error' });
    }
}


// const getResult = async (id) => {
//     try {
//       const response = await fetch(`/api/result?id=${id}`, {
//         method: 'GET',
//         headers: {
//           'Content-Type': 'application/json'
//         }
//       });
  
//       if (!response.ok) {
//         throw new Error(`Error: ${response.statusText}`);
//       }
  
//       const result = await response.json();
//       console.log('Fetched result:', result);
//       return result;
//     } catch (error) {
//       console.error('Failed to fetch result:', error);
//     }
//   };
