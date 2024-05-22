import mongoose, { Schema, model, models, Types, SchemaTypes } from 'mongoose';
import { FormItem, Choice } from '@/types/quillform.type';

interface IForm {
    name: string,
    author: Types.ObjectId,
    users: string[],
    blocks: FormItem[]
}

const ChoiceSchema = new Schema<Choice>(
    {
        label: {
            type: String,
            required: true
        },
        value: {
            type: String,
            required: true
        }
    },
    {
        _id: false
    }
);

const FormItemSchema = new Schema<FormItem>(
    {
        name: {
            type: String,
            required: true
        },
        id: {
            type: String,
            required: true
        },
        attributes: {
            required: {
                type: Boolean,
                required: true
            },
            label: {
                type: String,
                required: true
            },
            multiple: {
                type: Boolean,
                required: false
            },
            verticalAlign: {
                type: Boolean,
                required: false
            },
            choices: {
                type: [ChoiceSchema],
                required: false
            },
            min: {
                type: Number,
                required: false
            },
            max: {
                type: Number,
                required: false
            },
            step: {
                type: Number,
                required: false
            },
            prefix: {
                type: String,
                required: false
            },
            suffix: {
                type: String,
                required: false
            }
        }
    },
    {
        _id: false
    }
);

const formSchema = new Schema<IForm>(
    {
        name: {
            type: String,
            required: true,
        },
        author: {
            type: SchemaTypes.ObjectId,
            ref: 'User',
            required: true
        },
        users: {
            type: [String],
            required: true
        },
        blocks: {
            type: [FormItemSchema],
            required: true
        }
    },
    {
        timestamps: true,
    }
)

const FormModel = () => mongoose.model<IForm>('Form', formSchema, 'forms')
const Form = mongoose.models.Form as mongoose.Model<IForm, {}> || FormModel();
export { Form }