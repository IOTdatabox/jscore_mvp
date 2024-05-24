// models/Response.js

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserInputSchema = new Schema({
    userEmail: {
        type: String,
        required: true // You can make this required if all responses must have an email.
    },
    answers: {
        type: Map,
        of: new Schema({
            value: Schema.Types.Mixed,
            isValid: Boolean,
            isAnswered: Boolean,
            isPending: Boolean,
            validationErr: Schema.Types.Mixed,
            isCorrectIncorrectScreenDisplayed: Boolean,
            isLocked: Boolean,
            blockName: String,
        }, { _id: false }) // _id is set to false to prevent Mongoose from creating default ids for subdocuments
    }
});

const UserInputData = mongoose.models.UserInputData || mongoose.model('UserInputData', UserInputSchema);
export { UserInputData }
