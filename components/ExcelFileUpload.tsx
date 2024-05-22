import React, { useState, useEffect } from 'react';
import shortid from 'shortid';
import { XMarkIcon, DocumentPlusIcon } from '@heroicons/react/24/outline';

const ExcelFileUpload = ({
    fileList,
    handleChange
}: {
    fileList: any[] | null,
    handleChange: Function
}) => {
    const [files, setFiles] = useState<any[] | null>(fileList);
    const [fileError, setFileError] = useState<string>('');

    useEffect(() => {
        setFiles(fileList);
    }, [fileList])

    const handleFileChange = (e: any) => {
        if (e.target.files) {
            const filesArray = Array.from(e.target.files);
            const validFiles = filesArray.filter((file: any) => {
                const fileName = file.name.toLowerCase();
                return fileName.endsWith('.xlsx') || fileName.endsWith('.xls') || fileName.endsWith('.csv');
            });

            if (validFiles.length === 0) {
                setFileError('No valid Excel or CSV files uploaded.');
                return;
            }

            setFileError('')
            setFiles(filesArray)
            handleChange(filesArray)
        }
    };

    const removeFile = (file: any) => {
        const updatedFiles = files?.filter(item => item.name !== file.name);
        setFiles(updatedFiles ?? null)
        handleChange(updatedFiles ?? null)
    }

    return (
        <>
            <div className="flex items-center justify-center w-full">
                <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-28 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600">
                    <div className="flex flex-col items-center justify-center pt-3 pb-4">
                        <DocumentPlusIcon className='w-8 h-8 mb-4 text-gray-500 dark:text-gray-400' />
                        <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                            <span className="font-semibold">Click to upload</span>
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">csv, xlsx, xls</p>
                    </div>
                    <input id="dropzone-file" type="file" accept=".xlsx, .xls, .csv" onChange={handleFileChange} className="hidden" name="files[]" multiple={false} />
                </label>
            </div>
            {
                fileError != '' &&
                <span className='text-sm text-red-700'>{fileError}</span>
            }
            {
                files != null && files.length > 0 && (
                    <>
                        {
                            files.map((file: any, index: number) => {
                                return (
                                    <div key={shortid()}>
                                        <div className='flex items-center py-2 justify-between'>
                                            <p className='text-sm text-gray-700 dark:text-white'>{file.name}</p>
                                            <XMarkIcon className='w-5 h-5 cursor-pointer text-red-500' onClick={() => removeFile(file)} />
                                        </div>
                                    </div>
                                )
                            })
                        }
                    </>
                )
            }
        </>
    );
};

export default ExcelFileUpload;