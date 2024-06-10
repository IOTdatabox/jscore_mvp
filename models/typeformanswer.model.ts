const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const answerSchema = new Schema({
    answers: [mongoose.Schema.Types.Mixed] // Stores only answers as an array of mixed types.

});

const AnswerData = mongoose.models.Answer || mongoose.model('Answer', answerSchema);
export { AnswerData }
