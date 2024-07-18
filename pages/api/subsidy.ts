// File: /pages/api/fetchSubsidy.ts

import { NextApiRequest, NextApiResponse } from 'next';
import { ApplicantData } from "@/types/backend.type";

type SubsidyResponse = {
  eligibility: {
    subsidy: number;
  }
}

async function getSubsidy(
  state: string,
  zipCode: string,
  householdSize: number,
  householdIncome: number,
  dependentsCount: number,
  applicantDetails: ApplicantData[]
): Promise<number> {
  const baseURL = `https://www.healthsherpa.com/api/plans.json`;

  // Construct applicants query param
  const applicantsQuery = applicantDetails.map((applicant) => {
    return `&applicants[][age]=${applicant.age}&applicants[][smoker]=${applicant.smoker ? 'true' : 'false'}&applicants[][age_format]=years&applicants[][relationship]=${applicant.relationship}&applicants[][gender]=${applicant.gender}&applicants[][utilization]=medium&applicants[][expanded]=true`;
  }).join('');

  // Construct the final URL with all parameters
  let targetURL = `${baseURL}?zip_code=${zipCode}&state=${state}&household_size=${householdSize}&household_income=${householdIncome}&dependents_count=${dependentsCount}&apply_for_subsidy=true&is_default_scenario=false&custom_usage[usage]=custom&custom_usage[doctor_visits]=0&custom_usage[er_visits]=0&custom_usage[hospital_visits]=0&custom_usage[labs]=0&custom_usage[prescriptions]=0&custom_usage[specialist_visits]=0&off_ex=false&utilization=medium&csr_type=none&sort=premium_asc&hsa=false&easy_pricing=false&all_benefits=false&add_attributes=false&shopping_scenario=finding_plan&health_subsidy_used=0&dental_search=false&v2=true&is_hra_flow=false${applicantsQuery}`;
  console.log('subsidy target url', targetURL);
  try {
    const response = await fetch(targetURL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token token="403a221d9983e2ab3b92e79ed78ee3fa"`,
      },
    });

    if (!response.ok) {
      throw new Error('Network response was not ok.');
    }

    const result: SubsidyResponse = await response.json();

    return result.eligibility.subsidy;

  } catch (error) {
    console.error("There was an error fetching the subsidy data:", error);
    throw error;
  }
}

function isError(error: any): error is Error {
  return error && typeof error.message === "string";
}


export default async function handler(req: NextApiRequest, res: NextApiResponse) {

  console.log("Inside subsidy API");
  if (req.method === 'POST') {
    const { state, zipCode, householdSize, householdIncome, dependentsCount, applicantDetails }: {
      state: string,
      zipCode: string,
      householdSize: number,
      householdIncome: number,
      dependentsCount: number,
      applicantDetails: ApplicantData[]
    } = req.body;


    try {
      const subsidy = await getSubsidy(state, zipCode, householdSize, householdIncome, dependentsCount, applicantDetails);
      res.status(200).json({ subsidy });
    } catch (error) {
      if (isError(error)) {
        res.status(500).json({ error: error.message });
      } else {
        res.status(500).json({ error: "An unknown error occurred" });
      }
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).send(`Method ${req.method} Not Allowed`);
  }
}
