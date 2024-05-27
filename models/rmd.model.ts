const mongoose = require('mongoose');

const rmdSchema = new mongoose.Schema({
    age: {
        type: Number,
        required: true
    },
    percentage: {
        type: Number,
        required: true
    }
});
const RMDModel = mongoose.models.RMD || mongoose.model('RMD', rmdSchema);

export { RMDModel };