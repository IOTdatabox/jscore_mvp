import { StateAbbr } from "@/types/backend.type";
async function subsidy(state:StateAbbr, zipCode: number, fipCode: number, householdSize: number, householdIncome:number, dependentsCount:number) {
  
    let targetURL = `https://www.healthsherpa.com/api/plans.json?zip_code=${zipCode}&fip_code=${fipCode}&state=${state}&household_size=${householdSize}&household_income=${householdIncome}&dependents_count=0&apply_for_subsidy=true&is_default_scenario=false&custom_usage[usage]=custom&custom_usage[doctor_visits]=0&custom_usage[er_visits]=0&custom_usage[hospital_visits]=0&custom_usage[labs]=0&custom_usage[prescriptions]=0&custom_usage[specialist_visits]=0&off_ex=false&utilization=medium&csr_type=none&sort=premium_asc&hsa=false&easy_pricing=false&all_benefits=false&add_attributes=false&shopping_scenario=finding_plan&health_subsidy_used=0&dental_search=false&v2=true&is_hra_flow=false`
  
    // Object to store applicant data
    var applicantData:any = {};
  
    for (var i = 8; i <= 16 + 4 * dependentsCount; i ++) {
      if (sheet.getRange(`A${i}`).getValue() !== "") {
        if (i !== 8) {
          targetURL = `${targetURL}&applicants[][age]=${applicantData['age']}&applicants[][smoker]=${applicantData['smoker']}&applicants[][age_format]=years&applicants[][relationship]=${applicantData['relationship']}&applicants[][gender]=${applicantData['gender']}&applicants[][utilization]=medium&applicants[][expanded]=true`;
        }
  
        applicantData = {};
        applicantData['relationship'] = sheet.getRange(`A${i}`).getValue().includes('Your') ? 'primary' : sheet.getRange(`A${i}`).getValue().includes('Spouse') ? 'spouse' : 'dependent';
      } else {
        if (sheet.getRange(`B${i}`).getValue() === "Gender") {
          applicantData['gender'] = sheet.getRange(`C${i}`).getValue().toLowerCase();
        } else if (sheet.getRange(`B${i}`).getValue() === "Age") {
          applicantData['age'] = sheet.getRange(`C${i}`).getValue();
        } else if (sheet.getRange(`B${i}`).getValue() === "Smoker") {
          applicantData['smoker'] = sheet.getRange(`C${i}`).getValue() === "Yes";
        }
      }
    }
  
    console.log(targetURL);
  
    const response= await fetch(targetURL, {
      method: 'GET',
      headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token token="403a221d9983e2ab3b92e79ed78ee3fa"`,
      },
    });

    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const result = await response.text();
  
    console.log(result);
  
    return result.eligibility.subsidy;
  }