export type Choice = {
    label: string,
    value: string | number
}

export type ShortText = {
    name: "short-text",
    id: string,
    attributes: {
        required: boolean,
        label: string
    }
};

export type LongText = {
    name: "long-text",
    id: string,
    attributes: {
        required: boolean,
        label: string
    }
};

export type DateField = {
    name: "date",
    id: string,
    attributes: {
        required: boolean,
        label: string
    }
};

export type EmailField = {
    name: "email",
    id: string,
    attributes: {
        required: boolean,
        label: string
    }
};

export type Slider = {
    name: "slider",
    id: string,
    attributes: {
        required: boolean,
        label: string,
        min: number,
        max: number,
        step: number,
        prefix: string,
        suffix: string
    }
};

export type NumberField = {
    name: "number",
    id: string,
    attributes: {
        required: boolean,
        label: string
    }
};

export type DropDown = {
    name: "dropdown",
    id: string,
    attributes: {
        required: boolean,
        label: string,
        choices: Choice[]
    }
}

export type MultipleChoice = {
    name: "multiple-choice",
    id: string,
    attributes: {
        required: boolean,
        label: string,
        multiple: boolean,
        verticalAlign?: boolean,
        choices: Choice[]
    }
}

export type FormItem = ShortText | LongText | NumberField | DropDown | MultipleChoice | EmailField | DateField | Slider;

export const defaultChoice: Choice = {
    label: "",
    value: ""
}

export const defaultInputBlock: ShortText = {
    name: "short-text",
    id: "",
    attributes: {
        required: false,
        label: "Text"
    }
}

export const defaultTextAreaBlock: LongText = {
    name: "long-text",
    id: "",
    attributes: {
        required: false,
        label: "Textarea"
    }
};

export const defaultSliderBlock: Slider = {
    name: "slider",
    id: "",
    attributes: {
        required: false,
        label: "Slider",
        min: 0,
        max: 100,
        step: 1,
        prefix: "",
        suffix: ""
    }
};

export const defaultEmailBlock: EmailField = {
    name: "email",
    id: "",
    attributes: {
        required: false,
        label: "Email"
    }
};

export const defaultDateBlock: DateField = {
    name: "date",
    id: "",
    attributes: {
        required: false,
        label: "Date"
    }
};

export const defaultNumberBlock: NumberField = {
    name: "number",
    id: "",
    attributes: {
        required: false,
        label: "Number"
    }
};

export const defaultDropdownBlock: DropDown = {
    name: "dropdown",
    id: "",
    attributes: {
        required: false,
        label: "Dropdown",
        choices: [{
            label: "Choice 1",
            value: "choice-1"
        }]
    }
}

export const defaultMultichoiceBlock: MultipleChoice = {
    name: "multiple-choice",
    id: "",
    attributes: {
        required: false,
        label: "Multiple Choice",
        multiple: true,
        verticalAlign: false,
        choices: [{
            label: "Choice 1",
            value: "choice-1"
        }]
    }
}