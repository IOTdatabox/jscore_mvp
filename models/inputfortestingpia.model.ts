import { number } from "zod";

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the PortfolioSettings schema
const InputForTestingPIASchema = new Schema({
    // age
    ageSelf: { type: Number, },
    ageSpouse: { type: Number, },
    // income
    incomeSelf: { type: Number, },
    incomeSpouse: { type: Number, },
    incomeDependent: { type: Number, },
    incomePension: { type: Number, },
    incomeOther: { type: Number, },    // Annuity Income + Rental Income + Reverse Mortgage Income
    // pia
    pia: { type: Number, },
    piaSpouse: { type: Number, },
    //balance
    balanceCash: { type: Number, },
    balanceQ: { type: Number, },
    balanceQSpouse: { type: Number },
    balanceNQ: { type: Number },
    balanceRoth: { type: Number },
    balanceAnnuity: { type: Number },
    balanceLifeInsurance: { type: Number },
    //expense
    expenseHousing: { type: Number },
    expenseTransportation: { type: Number },
    expenseDaily: { type: Number },
    expenseHealth: { type: Number },

    //retirement age
    retirementAge: { type: Number },
    retirementAgeSpouse: { type: Number },
});

// Check if the model exists before creating it to avoid recompilation issues in Next.js
const InputForTestingPIAModel = mongoose.models.InputForTestingPIA || mongoose.model('InputForTestingPIA', InputForTestingPIASchema);

// Export the model
export { InputForTestingPIAModel };
