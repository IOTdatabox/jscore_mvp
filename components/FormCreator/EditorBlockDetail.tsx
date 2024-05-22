import { useState, useEffect } from 'react';
import {
    PlusIcon,
    MinusIcon
} from "@heroicons/react/20/solid";

import {
    FormItem,
    Choice,
    defaultChoice
} from '@/types/quillform.type';
import { convertToSlug } from '@/utils/utils';

const EditorBlockDetail = ({
    block,
    index,
    saveBlock
}: {
    block: FormItem,
    index: number,
    saveBlock: Function
}) => {
    const [isRequired, setIsRequired] = useState<boolean>(block.attributes.required);
    const [label, setLabel] = useState<string>(block.attributes.label);
    const [choices, setChoices] = useState<Choice[]>(block.name == 'multiple-choice' || block.name == 'dropdown' ? block.attributes?.choices : []);
    const [labelError, setLabelError] = useState<string>('');
    const [choiceError, setChoiceError] = useState<string>('');

    useEffect(() => {
        setIsRequired(block.attributes.required);
        setLabel(block.attributes.label);
        setChoices(block.name == 'multiple-choice' || block.name == 'dropdown' ? block.attributes?.choices : []);
    }, [block]);

    const handleRequiredChange = (e: any) => {
        setIsRequired(e.target.value == 0);
    }

    const handleLabelChange = (e: any) => {
        setLabel(e.target.value);
        if (e.target.value != '') {
            setLabelError('');
        }
    }

    const handleChoiceLabelChange = (e: any, index: number) => {
        const choiceLabel = e.target.value;
        const choiceValue = convertToSlug(choiceLabel);
        let tempChoices = [...choices];
        tempChoices[index].label = choiceLabel;
        tempChoices[index].value = choiceValue;
        setChoices(tempChoices);
    }

    const handleAddChoice = () => {
        let newChoice = { ...defaultChoice };
        newChoice.label = `Choice ${choices.length + 1}`;
        newChoice.value = convertToSlug(newChoice.label);
        let tempChoices = [...choices, newChoice];
        setChoices(tempChoices);
        setChoiceError('');
    }

    const handleDeleteChoice = (index: number) => {
        let tempChoices = [...choices]
        tempChoices.splice(index, 1);
        setChoices(tempChoices);
    }

    const completeSaveBlock = () => {
        setLabelError('');
        setChoiceError('');
        const updatedBlock = {
            ...block,
            attributes: {
                ...block.attributes,
                label: label,
                required: isRequired,
                choices: choices
            }
        }
        saveBlock(index, updatedBlock);
    }

    const handleSaveBlock = () => {
        const filteredChoices = choices.filter(choice => choice.label != '');
        console.log(((block.name == 'multiple-choice' || block.name == 'dropdown') && choices.length > 0 && filteredChoices.length > 0 && choices.length == filteredChoices.length))

        if (block.name == 'multiple-choice' || block.name == 'dropdown') {
            if (label != '' && choices.length > 0 && filteredChoices.length > 0 && choices.length == filteredChoices.length) {
                completeSaveBlock();
            } else {
                if (label == '') {
                    setLabelError('Label is required!');
                } else {
                    setLabelError('');
                }

                if (choices.length == 0) {
                    setChoiceError('At least one choice is required!');
                    return;
                }

                if (filteredChoices.length != choices.length) {
                    setChoiceError('Pleaes input choice labels!');
                }
            }
        } else {
            if (label != '') {
                completeSaveBlock();
            } else {
                if (label == '') {
                    setLabelError('Label is required!');
                } else {
                    setLabelError('');
                }
            }
        }
    }

    return (
        <div className='space-y-2.5'>
            <div className="flex items-center gap-3 w-full group">
                <label htmlFor="message" className="block text-sm font-medium text-gray-900 dark:text-white">
                    Label
                </label>
                <input
                    name="block-label"
                    disabled={false}
                    type='text'
                    value={label}
                    onChange={handleLabelChange}
                    className="block p-2.5 w-full text-sm text-gray-900 bg-white rounded-lg border border-gray-300 focus:ring-primary-cyan focus:border-primary-cyan dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-cyan dark:focus:border-primary-cyan focus:outline-none" placeholder="Please input label ..."
                />
            </div>
            {
                labelError != '' &&
                <span className='text-sm text-red-700'>{labelError}</span>
            }
            <div className='flex items-center justify-start gap-3'>
                <label className='block text-sm font-medium text-gray-900 dark:text-white py-2.5'>
                    Required
                </label>
                <label className="relative flex items-center cursor-pointer">
                    <input
                        type="checkbox"
                        disabled={false}
                        name="block-required"
                        value={isRequired ? 1 : 0}
                        checked={isRequired}
                        onChange={handleRequiredChange}
                        className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-0 peer-focus:ring-primary-cyan dark:peer-focus:ring-primary-cyan rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-cyan"></div>
                </label>
            </div>
            <div className='pb-4 justify-start gap-3'>
                {
                    (block.name == 'multiple-choice' || block.name == 'dropdown') && (
                        <>
                            <div className='mt-2 space-y-2'>
                                {
                                    choices.map((item: Choice, index: number) => {
                                        return (
                                            <div className='flex items-center gap-2'>
                                                <input
                                                    name={`choice-${index}`}
                                                    disabled={false}
                                                    type='text'
                                                    value={item.label}
                                                    onChange={(e) => handleChoiceLabelChange(e, index)}
                                                    className="block p-2.5 w-full text-sm text-gray-900 bg-white rounded-lg border border-gray-300 focus:ring-primary-cyan focus:border-primary-cyan dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-cyan dark:focus:border-primary-cyan focus:outline-none" placeholder={`Choice ${index + 1}`}
                                                />
                                                <MinusIcon className='w-6 h-6 text-red-500' onClick={() => handleDeleteChoice(index)} />
                                            </div>
                                        )
                                    })
                                }
                            </div>
                            {
                                choiceError != '' &&
                                <span className='text-sm text-red-700'>{choiceError}</span>
                            }
                            <button className='w-full p-2 border border-primary-cyan rounded-lg cursor-pointer flex items-center justify-center mt-2' onClick={handleAddChoice}>
                                <PlusIcon className='w-6 h-6 text-primary-cyan' /> Choice
                            </button>
                        </>
                    )
                }
            </div>
            <div className='flex items-center justify-end'>
                <button onClick={handleSaveBlock} className="flex items-center justify-center text-white bg-primary-cyan hover:bg-secondary-cyan focus:ring-4 focus:ring-primary-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-primary-cyan dark:hover:bg-secondary-cyan focus:outline-none dark:focus:ring-secondary-cyan">
                    Save
                </button>
            </div>
        </div>
    )
}

export default EditorBlockDetail;