import { useEffect, useState, useContext } from 'react';
import { useRouter } from 'next/router';
import { useSession } from "next-auth/react";
import { User } from "next-auth"
import shortid from 'shortid';
import * as XLSX from 'xlsx';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import { Form } from "@quillforms/renderer-core";
import "@quillforms/renderer-core/build-style/style.css";
import { registerCoreBlocks } from "@quillforms/react-renderer-utils";
import {
    Cog6ToothIcon,
    ChevronLeftIcon,
    XMarkIcon,
} from "@heroicons/react/20/solid";
import {
    FaceFrownIcon
} from "@heroicons/react/24/outline";
import Spinner from '@/components/Spinner';
import {
    FormItem,
    defaultInputBlock,
    defaultNumberBlock,
    defaultDateBlock,
    defaultEmailBlock,
    defaultTextAreaBlock,
    defaultDropdownBlock,
    defaultMultichoiceBlock,
    defaultSliderBlock
} from '@/types/quillform.type';
import InputBlockSvg from '@/public/static/images/form-blocks/text-box.svg';
import NumberBlockSvg from '@/public/static/images/form-blocks/numeric.svg';
import DateBlockSvg from '@/public/static/images/form-blocks/calendar.svg';
import EmailBlockSvg from '@/public/static/images/form-blocks/email.svg';
import SliderBlockSvg from '@/public/static/images/form-blocks/slider.svg';
import TextAreaBlockSvg from '@/public/static/images/form-blocks/edit-text.svg';
import DropDownBlockSvg from '@/public/static/images/form-blocks/dropdown-arrow.svg';
import MultiChoiceBlockSvg from '@/public/static/images/form-blocks/multiple-choice.svg';
import { extractOnlyEmailsFromExcelFile } from '@/utils/utils';
import ExcelFileUpload from '@/components/ExcelFileUpload';
import FormBlock from '@/components/FormCreator/FormBlock';
import EditorBlock from '@/components/FormCreator/EditorBlock';
import EditorBlockDetail from '@/components/FormCreator/EditorBlockDetail';

registerCoreBlocks();

const formBlocks = [
    {
        icon: InputBlockSvg,
        label: "Text",
        type: "short-text"
    },
    {
        icon: NumberBlockSvg,
        label: "Number",
        type: "number"
    },
    {
        icon: DateBlockSvg,
        label: "Date",
        type: "date"
    },
    {
        icon: EmailBlockSvg,
        label: "Email",
        type: "email"
    },
    // {
    //     icon: SliderBlockSvg,
    //     label: "Slider",
    //     type: "slider"
    // },
    {
        icon: TextAreaBlockSvg,
        label: "Textarea",
        type: "long-text"
    },
    {
        icon: DropDownBlockSvg,
        label: "Dropdown",
        type: "dropdown"
    },
    {
        icon: MultiChoiceBlockSvg,
        label: "Multi Choice",
        type: "multiple-choice"
    }
];

const FormCreator = () => {
    const router = useRouter();
    const { data: session, status } = useSession();
    const user = session?.user as User;

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [isExtracting, setIsExtracting] = useState<boolean>(false);
    const [selectedBlockId, setSelectedBlockId] = useState<number>(0);
    const [selectedBlock, setSelectedBlock] = useState<FormItem | null>(null);
    const [blocks, setBlocks] = useState<FormItem[]>([]);
    const [files, setFiles] = useState<any[] | null>(null);
    const [fileError, setFileError] = useState<string>('');
    const [name, setName] = useState<string>('');
    const [nameError, setNameError] = useState<string>('');
    const [users, setUsers] = useState<string[]>([]);
    const [usersError, setUsersError] = useState<string>('');
    const [blockError, setBlockError] = useState<string>('');

    const { id } = router.query;
    let formId = "";
    if (typeof id === "string" && id !== "") {
        formId = id.toString();
    }

    useEffect(() => {
        document.title = `Form Creator - ${process.env.NEXT_PUBLIC_SITE_TITLE}`;
        getFormDetail();
    }, []);

    useEffect(() => {
        readFile();
    }, [files]);

    useEffect(() => {
        if (name != '') {
            setNameError('');
        }
        if (blocks.length > 0) {
            setBlockError('');
        }
        if (users.length > 0) {
            setUsersError('');
        }
    }, [name, blocks, users]);

    const getFormDetail = async () => {
        if (formId == "") {
            return;
        }

        setIsLoading(true);
        const response = await fetch(`/api/forms/${formId}`, {
            method: "GET",
        });

        if (!response.ok) {
            setIsLoading(false);
            const { err } = await response.json();
            console.log("[Error] - Get Form Detail ", err)
        } else {
            const { detail } = await response.json();
            setBlocks(detail.blocks);
            setName(detail.name);
            setUsers(detail.users);
            setIsLoading(false);
        }
    }

    const handleAddBlock = (type: string) => {
        if (isEditing) return;
        let block: FormItem | null = null;
        switch (type) {
            case "short-text":
                block = defaultInputBlock;
                break;
            case "long-text":
                block = defaultTextAreaBlock;
                break;
            case "email":
                block = defaultEmailBlock;
                break;
            case "date":
                block = defaultDateBlock;
                break;
            case "slider":
                block = defaultSliderBlock;
                break;
            case "number":
                block = defaultNumberBlock;
                break;
            case "dropdown":
                block = defaultDropdownBlock;
                break;
            case "multiple-choice":
                block = defaultMultichoiceBlock;
                break;
        }

        if (!block) {
            return;
        }

        const blockId = shortid.generate();
        block = {
            ...block,
            id: blockId
        };
        setBlocks((prev) => [...prev, block]);
    }

    const handleUpdateBlock = (index: number, blockData: FormItem) => {
        let tempBlocks = [...blocks];
        tempBlocks[index] = blockData;
        setBlocks(tempBlocks);
        setIsEditing(false);
        setSelectedBlockId(0);
    }

    const handleDeleteBlock = (index: number) => {
        let tempBlocks = [...blocks]
        tempBlocks.splice(index, 1);
        setBlocks(tempBlocks);
    }

    const handleEditBlock = (index: number) => {
        setSelectedBlockId(index);
        setSelectedBlock(blocks[index]);
        setIsEditing(true);
    }

    const onDragEnd = (result: any) => {
        const { source, destination } = result;
        if (!destination) return;
        if (source.droppableId === 'block-panel' && destination.droppableId === 'editor-panel') {
            handleAddBlock(formBlocks[source.index].type)
            return;
        }

        if (source.droppableId === 'editor-panel' && destination.droppableId === 'editor-panel') {
            const tempBlocks = [...blocks];
            const [reorderedBlock] = tempBlocks.splice(source.index, 1);
            tempBlocks.splice(destination.index, 0, reorderedBlock);
            setBlocks(tempBlocks);
            return;
        }
    };

    const handleNameChange = (e: any) => {
        setName(e.target.value);
    }

    const handleRemoveUser = (index: number) => {
        let tempUsers = [...users]
        tempUsers.splice(index, 1);
        setUsers(tempUsers);
    }

    const updateFiles = (fileList: any[] | null) => {
        setFiles(fileList)
    }

    const readFile = async () => {
        if (files && files.length > 0) {
            setFileError('');
            setIsExtracting(true);
            const reader = new FileReader();
            reader.onload = (e) => {
                if (e.target?.result) {
                    const data = e.target.result as ArrayBuffer;
                    const workbook = XLSX.read(data, { type: 'array' });
                    const sheet = workbook.Sheets[workbook.SheetNames[0]];
                    const sheetData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
                    const emailList = extractOnlyEmailsFromExcelFile(sheetData);
                    setUsers(emailList);
                    setIsExtracting(false);
                } else {
                    setIsExtracting(false);
                }
            };
            reader.readAsArrayBuffer(files[0]);
        } else {
            setUsers([]);
        }
    }

    const handleSaveClick = () => {
        if (name != '' && blocks.length > 0) {
            setNameError('')
            setUsersError('')
            setBlockError('')
            updateForm()
        } else {
            if (name == '') {
                setNameError('Name is required!')
            }
            if (users.length == 0) {
                setUsersError('No users selected!')
            }
            if (blocks.length == 0) {
                setBlockError('Form is empty!')
            }
        }
    }

    const updateForm = async () => {
        setIsSaving(true);
        const method = formId == "" ? "POST" : "PUT";
        const apiUrl = formId == "" ? "/api/forms" : `/api/forms/${formId}`;
        const response = await fetch(apiUrl, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: name,
                users: users,
                blocks: blocks
            })
        });

        if (!response.ok) {
            setIsSaving(false);
            const { err } = await response.json();
        } else {
            setIsSaving(false);
            const { success, result } = await response.json();
        }
    }

    return (
        <>
            {
                isLoading ?
                    <Spinner text={'Loading ...'} /> :
                    <div className='mx-auto'>
                        <section className='mt-5'>
                            <DragDropContext onDragEnd={onDragEnd}>
                                <div>
                                    <div className="relative overflow-hidden bg-white shadow-md dark:bg-gray-800 rounded-[15px] pt-5 pb-5 px-4 ">
                                        <div className='grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 mt-2 gap-1.5'>
                                            <div className='py-2 pb-4 px-4 lg:col-span-1 border border-dashed border-primary-cyan rounded-lg'>
                                                <h1 className='text-md font-bold py-2'>Form Blocks</h1>
                                                <div className='text-primary-cyan mt-2'>
                                                    <Droppable droppableId="block-panel">
                                                        {(provided) => (
                                                            <div ref={provided.innerRef} {...provided.droppableProps} className='space-y-2'>
                                                                {
                                                                    formBlocks.map((block: any, index: number) => {
                                                                        let icon = null;
                                                                        switch (block.type) {
                                                                            case 'short-text':
                                                                                icon = InputBlockSvg;
                                                                                break;
                                                                            case 'long-text':
                                                                                icon = TextAreaBlockSvg;
                                                                                break;
                                                                            case 'email':
                                                                                icon = EmailBlockSvg;
                                                                                break;
                                                                            case 'date':
                                                                                icon = DateBlockSvg;
                                                                                break;
                                                                            case "slider":
                                                                                icon = SliderBlockSvg;
                                                                                break;
                                                                            case 'number':
                                                                                icon = NumberBlockSvg;
                                                                                break;
                                                                            case 'dropdown':
                                                                                icon = DropDownBlockSvg;
                                                                                break;
                                                                            case 'multiple-choice':
                                                                                icon = MultiChoiceBlockSvg;
                                                                                break;
                                                                        }
                                                                        return (
                                                                            <Draggable key={shortid()} draggableId={`form-block-${index.toString()}`} index={index}>
                                                                                {(provided) => (
                                                                                    <div
                                                                                        ref={provided.innerRef}
                                                                                        {...provided.draggableProps}
                                                                                        {...provided.dragHandleProps}
                                                                                    >
                                                                                        <FormBlock icon={icon} label={block.label} type={block.type} handleAdd={handleAddBlock} />
                                                                                    </div>
                                                                                )}
                                                                            </Draggable>
                                                                        )
                                                                    })
                                                                }

                                                                {provided.placeholder}
                                                            </div>
                                                        )}
                                                    </Droppable>
                                                </div>
                                            </div>
                                            <div className='py-2 pb-4 px-4 lg:col-span-1 border border-dashed border-primary-cyan rounded-lg'>
                                                <div className='flex items-center justify-between py-2'>
                                                    <h1 className='text-md font-bold'>Editor</h1>
                                                    <div className='flex items-center gap-1.5'>
                                                        <Cog6ToothIcon className='w-6 h-6 text-primary-cyan hover:text-secondary-cyan' />
                                                        {
                                                            isEditing &&
                                                            <ChevronLeftIcon
                                                                className='w-6 h-6 text-primary-cyan hover:text-secondary-cyan'
                                                                onClick={() => setIsEditing(false)}
                                                            />
                                                        }
                                                    </div>
                                                </div>
                                                <div className='text-primary-cyan mt-2 h-[calc(100%-40px)]'>
                                                    {
                                                        isEditing ?
                                                            <>
                                                                {selectedBlock && <EditorBlockDetail block={selectedBlock} index={selectedBlockId} saveBlock={handleUpdateBlock} />}
                                                            </>
                                                            :
                                                            <div className='h-full'>
                                                                <Droppable droppableId="editor-panel">
                                                                    {(provided) => (
                                                                        <div ref={provided.innerRef} {...provided.droppableProps} className='space-y-2 h-full'>
                                                                            {
                                                                                blocks.map((block: FormItem, index: number) => {
                                                                                    let icon = null;
                                                                                    switch (block.name) {
                                                                                        case 'short-text':
                                                                                            icon = InputBlockSvg;
                                                                                            break;
                                                                                        case 'long-text':
                                                                                            icon = TextAreaBlockSvg;
                                                                                            break;
                                                                                        case 'email':
                                                                                            icon = EmailBlockSvg;
                                                                                            break;
                                                                                        case 'date':
                                                                                            icon = DateBlockSvg;
                                                                                            break;
                                                                                        case "slider":
                                                                                            icon = SliderBlockSvg;
                                                                                            break;
                                                                                        case 'number':
                                                                                            icon = NumberBlockSvg;
                                                                                            break;
                                                                                        case 'dropdown':
                                                                                            icon = DropDownBlockSvg;
                                                                                            break;
                                                                                        case 'multiple-choice':
                                                                                            icon = MultiChoiceBlockSvg;
                                                                                            break;
                                                                                    }
                                                                                    return (
                                                                                        <Draggable key={shortid()} draggableId={`editor-block-${index.toString()}`} index={index}>
                                                                                            {(provided) => (
                                                                                                <div
                                                                                                    ref={provided.innerRef}
                                                                                                    {...provided.draggableProps}
                                                                                                    {...provided.dragHandleProps}
                                                                                                >
                                                                                                    <EditorBlock
                                                                                                        icon={icon}
                                                                                                        text={block.attributes.label}
                                                                                                        index={index}
                                                                                                        type={block.name}
                                                                                                        onDelete={handleDeleteBlock}
                                                                                                        onEdit={handleEditBlock}
                                                                                                    />
                                                                                                </div>
                                                                                            )}
                                                                                        </Draggable>
                                                                                    )
                                                                                })
                                                                            }
                                                                            {provided.placeholder}
                                                                        </div>
                                                                    )}
                                                                </Droppable>
                                                            </div>
                                                    }
                                                </div>
                                            </div>
                                            <div className='py-2 pb-4 px-4 lg:col-span-2 border border-dashed border-primary-cyan rounded-lg'>
                                                <div className='flex items-center justify-between py-2'>
                                                    <h1 className='text-md font-bold'>View</h1>
                                                    <div className='flex items-center gap-1.5'>
                                                        {/* <ArrowsPointingInIcon className='w-6 h-6 text-primary-cyan hover:text-secondary-cyan' />
                                                        <ArrowsPointingOutIcon className='w-6 h-6 text-primary-cyan hover:text-secondary-cyan' /> */}
                                                    </div>
                                                </div>
                                                <div style={{ width: "100%", height: "calc(50vh)", borderRadius: 15 }}>
                                                    {
                                                        blocks.length > 0 &&
                                                        <Form
                                                            formId={1}
                                                            formObj={{
                                                                blocks: blocks,
                                                                settings: {
                                                                    animationDirection: "horizontal",
                                                                    disableWheelSwiping: false,
                                                                    disableNavigationArrows: false,
                                                                    disableProgressBar: false
                                                                },
                                                                theme: {
                                                                    backgroundColor: '#ffffff',
                                                                    buttonsBgColor: "#50858B",
                                                                    logo: {
                                                                        src: ""
                                                                    },
                                                                    answersColor: "#50858B",
                                                                    buttonsFontColor: "#fff",
                                                                    buttonsBorderRadius: 10,
                                                                    errorsFontColor: "#b91c1c",
                                                                    errorsBgColor: "transparent",
                                                                    progressBarFillColor: "#50858B",
                                                                    progressBarBgColor: "#ccc",
                                                                },
                                                                customCSS: 'rounded-[15px] shadow-none'
                                                            }}
                                                            onSubmit={async (data: any, { completeForm, setIsSubmitting }) => {
                                                                console.log("submitted")
                                                            }}
                                                            applyLogic={false}
                                                        />
                                                    }
                                                </div>
                                            </div>
                                        </div>
                                        {
                                            blockError != '' &&
                                            <span className='text-sm text-red-700'>{blockError}</span>
                                        }
                                        <div className='py-4'>
                                            <h1 className='text-md font-bold'>Form Detail</h1>
                                            <div className='grid lg:grid-cols-2 grid-cols-1 gap-4'>
                                                <div>
                                                    <div className='w-full'>
                                                        <h1 className='py-1.5 text-sm font-bold leading-6 text-gray-900 dark:text-white'>
                                                            Form name
                                                        </h1>
                                                        <input
                                                            name="form-name"
                                                            disabled={false}
                                                            type='text'
                                                            value={name}
                                                            onChange={handleNameChange}
                                                            className="mt-2 block p-2 w-full text-sm text-gray-900 bg-white rounded-lg border border-gray-300 focus:ring-primary-cyan focus:border-primary-cyan dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-cyan dark:focus:border-primary-cyan focus:outline-none" placeholder="Please input name ..."
                                                        />
                                                        {
                                                            nameError != '' &&
                                                            <span className='text-sm text-red-700'>{nameError}</span>
                                                        }
                                                    </div>
                                                    <div className='sm:flex sm:items-center sm:justify-between w-full mt-2'>
                                                        <h1 className='py-1.5 text-sm font-bold leading-6 text-gray-900 dark:text-white'>
                                                            Upload File
                                                        </h1>
                                                    </div>
                                                    <div className='mt-2'>
                                                        <ExcelFileUpload handleChange={updateFiles} fileList={files} />
                                                    </div>
                                                    {
                                                        fileError != '' &&
                                                        <span className='text-sm text-red-700'>{fileError}</span>
                                                    }
                                                </div>
                                                <div>
                                                    <div className='sm:flex sm:items-center sm:justify-between w-full'>
                                                        <h1 className='py-1.5 text-sm font-bold leading-6 text-gray-900 dark:text-white'>
                                                            Selected users
                                                        </h1>
                                                    </div>
                                                    {
                                                        usersError != '' &&
                                                        <span className='text-sm text-red-700'>{usersError}</span>
                                                    }
                                                    <div className='mt-2 flex flex-wrap items-center gap-2 text-sm'>
                                                        {
                                                            isExtracting ?
                                                                <Spinner text={'Getting users...'} />
                                                                :
                                                                users.length > 0 ? users.map((email: string, index: number) => (
                                                                    <div key={shortid()} className='w-fit flex items-center gap-2 border p-2 rounded-lg justify-between'>
                                                                        <p className='truncate'>{email}</p>
                                                                        <XMarkIcon
                                                                            className='w-5 h-5 text-red-500 cursor-pointer'
                                                                            onClick={() => handleRemoveUser(index)}
                                                                        />
                                                                    </div>
                                                                )) :
                                                                    <div className='w-full flex items-center justify-center'>
                                                                        <FaceFrownIcon className='w-8 h-8 mr-1' /> No Users
                                                                    </div>
                                                        }
                                                    </div>
                                                </div>
                                            </div>
                                            <div className='mt-4 flex items-center justify-end'>
                                                <button
                                                    className="sm:w-fit w-full flex items-center justify-center text-white bg-primary-cyan hover:bg-secondary-cyan focus:ring-4 focus:ring-primary-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-primary-cyan dark:hover:bg-secondary-cyan focus:outline-none dark:focus:ring-secondary-cyan"
                                                    onClick={handleSaveClick}
                                                >
                                                    {isSaving ? <Spinner text='Saving ...' size={'5'} /> : 'Save'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </DragDropContext>
                        </section>
                    </div>
            }
        </>
    )
}

export default FormCreator;