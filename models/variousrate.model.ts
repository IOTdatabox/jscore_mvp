import { number } from "zod";

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the PortfolioSettings schema
const VariousRateSchema = new Schema({
    cashRate: { type: Number,},
    expenseRate: { type: Number },
    jAdjustedRate: { type: Number },
});

// Check if the model exists before creating it to avoid recompilation issues in Next.js
const VariousRateModel = mongoose.models.VariousRate || mongoose.model('VariousRate', VariousRateSchema);

// Export the model
export { VariousRateModel };
