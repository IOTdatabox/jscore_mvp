const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const resultSchema = new Schema({
    results: [mongoose.Schema.Types.Mixed]

});

const ResultData = mongoose.models.Result || mongoose.model('Result', resultSchema);
export { ResultData }
