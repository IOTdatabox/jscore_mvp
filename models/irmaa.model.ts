const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MedicarePremiumSchema = new Schema({
    individual: { type: String, required: true },
    joint: { type: String, required: true },
    partB: { type: String, required: true },
    partD: { type: String, required: true },
});

const MedicarePremiumModel = mongoose.models.MedicarePremium || mongoose.model('MedicarePremium', MedicarePremiumSchema);

export { MedicarePremiumModel };