const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the PortfolioSettings schema
const PortfolioSettingsSchema = new Schema({
    inflationOption: { type: String,},
    taxOption: { type: String },
    investmentOption: { type: String },
    returnRiskOption: { type: String },
    rebalancingOption: { type: String },
    federalTax: { type: Number },
    capitalTax: { type: Number },
    dividendTax: { type: Number },
    affordableTax: { type: Number },
    stateTax: { type: Number },
    assetAllocations: [{ type: String }],
    allocationAmounts: [{ type: Number }]
});

// Check if the model exists before creating it to avoid recompilation issues in Next.js
const PortfolioSetting = mongoose.models.PortfolioSetting || mongoose.model('PortfolioSetting', PortfolioSettingsSchema);

// Export the model
export { PortfolioSetting };
