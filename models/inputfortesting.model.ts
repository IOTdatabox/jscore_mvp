import { number } from "zod";

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the PortfolioSettings schema
const InputForTestingSchema = new Schema({
    // age
    ageSelf: { type: Number, },
    ageSpouse: { type: Number, },
    // income
    incomeSelf: { type: Number, },
    incomeSpouse: { type: Number, },
    incomeDependent: { type: Number, },
    incomeSocialSecurity: { type: Number, },
    incomeSocialSecuritySpouse: { type: Number, },
    incomePension: { type: Number, },
    incomeOther: { type: Number, },    // Annuity Income + Rental Income + Reverse Mortgage Income
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
const InputForTestingModel = mongoose.models.InputForTesting || mongoose.model('InputForTesting', InputForTestingSchema);

// Export the model
export { InputForTestingModel };
