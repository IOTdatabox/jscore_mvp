import { useContext, useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useSearchParams } from "next/navigation";
import { Form, useRendererStoreActions } from "@quillforms/renderer-core";
import "@quillforms/renderer-core/build-style/style.css";
import { registerCoreBlocks } from "@quillforms/react-renderer-utils";
import { InformationCircleIcon } from '@heroicons/react/20/solid';

import { EMAIL_REGEX } from '@/config/constants';
import Spinner from '@/components/Spinner';
import { FormItem } from '@/types/quillform.type';
registerCoreBlocks();

const UserForm = () => {
    const params = useSearchParams()!;
    const emailRef = useRef<HTMLInputElement | null>(null)

    const [isChecking, setIsChecking] = useState<boolean>(false)
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [formId, setFormId] = useState<string>('')
    const [email, setEmail] = useState<string>('')
    const [validEmail, setValidEmail] = useState<boolean>(false)
    const [emailFocus, setEmailFocus] = useState<boolean>(false)
    const [errMsg, setErrMsg] = useState<string>('')
    const [statusMsg, setStatusMsg] = useState<string>('')
    const [isEmptyEmail, setIsEmptyEmail] = useState<boolean>(true)
    const [step, setStep] = useState<number>(0);
    const [blocks, setBlocks] = useState<FormItem[]>([]);
    const [name, setName] = useState<string>('');
    const [users, setUsers] = useState<string[]>([]);

    useEffect(() => {
        document.title = `Form - ${process.env.NEXT_PUBLIC_SITE_TITLE}`;
    }, []);

    useEffect(() => {
        setFormId(params.get("id") ?? '');
        if (params.get("email")) {
            const decodedEmail = decodeURIComponent(params.get("email") ?? '');
            setEmail(decodedEmail);
            if (decodedEmail != '') setIsEmptyEmail(false)
        }
    }, [params]);

    useEffect(() => {
        setValidEmail(EMAIL_REGEX.test(email) || email === '')
    }, [email])

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

    const handleNextClick = () => {
        if (email != '' && validEmail) {
            setEmailFocus(false)
            checkEmail()
        } else {
            setErrMsg("Please Input Email")
            setStatusMsg('')
            setEmailFocus(true)
            emailRef.current?.focus();
        }
    }

    const checkEmail = async () => {
        setIsChecking(true);
        const response = await fetch(`/api/forms/${formId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: email
            })
        });

        if (!response.ok) {
            setIsChecking(false);
            const { err } = await response.json();
            setErrMsg(err);
            setStatusMsg('');
        } else {
            setIsChecking(false);
            const { success, err } = await response.json();
            if (success) {
                getFormDetail();
                setStep(1);
                setErrMsg('');
                setStatusMsg(`You can leave feedback to this form.`)
            } else {
                setErrMsg(err)
                setStatusMsg('')
            }
        }
    }

    const handleSubmit = async (data: any) => {
        console.log(data.answers);
    }

    return (
        <section className='bg-white dark:bg-gray-800 text-black dark:text-white'>
            {
                step == 0 ?
                    <div className='flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8'>
                        <div className='sm:mx-auto sm:w-full sm:max-w-sm'>
                            <h2 className='signin'>Form</h2>
                        </div>
                        <div className='sm:mx-auto sm:w-full sm:max-w-sm pt-5'>
                            {errMsg}
                            {statusMsg}
                        </div>

                        <div className='mt-10 sm:mx-auto sm:w-full sm:max-w-sm' >
                            <label htmlFor='email' className='signin'>
                                Email Address
                            </label>
                            <div className='mt-2'>
                                <input
                                    id='email'
                                    ref={emailRef}
                                    onChange={e => {
                                        setEmail(e.target.value)
                                    }}
                                    disabled={!isEmptyEmail}
                                    value={email}
                                    name='email'
                                    type='email'
                                    required
                                    aria-invalid={validEmail ? 'false' : 'true'}
                                    aria-describedby='emailnote'
                                    onFocus={() => setEmailFocus(true)}
                                    onBlur={() => setEmailFocus(false)}
                                    className={validEmail ? 'signin' : 'signinError'}
                                />
                            </div>
                            {
                                !validEmail && emailFocus && email != '' && (
                                    <div className='text-sm mt-2'>
                                        <div
                                            id='emailnote'
                                            className={emailFocus && !validEmail ? 'signin' : 'invisible'}
                                        >
                                            <div className='flex items-center'>
                                                <InformationCircleIcon
                                                    className='block h-6 w-6'
                                                    aria-hidden='true'
                                                />
                                                <div className=' px-2'>
                                                    { } Please include <span aria-label='at symbol'>@</span> in the email address
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )
                            }

                            <div className='mt-4'>
                                <button
                                    onClick={handleNextClick}
                                    disabled={
                                        (!validEmail || isChecking) ? true : false
                                    }
                                    className={(!validEmail || isChecking) ? ' signin-disabled' : 'signin'}>
                                    {isChecking ? <Spinner text='Checking...' size={'6'} /> : 'Continue'}
                                </button>
                            </div>
                        </div>
                    </div>
                    : isLoading ?
                        <Spinner text={'Loading Form...'} /> :
                        <div style={{ width: "100%", height: "calc(100vh)" }}>
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
                                    customCSS: 'rounded-[15px]'
                                }}
                                onSubmit={async (data: any, { completeForm, setIsSubmitting }) => {
                                    await handleSubmit(data)
                                    setIsSubmitting(false);
                                    completeForm()
                                    registerCoreBlocks()
                                }}
                                applyLogic={false}
                            />
                        </div>
            }
        </section>
    );
};

export default UserForm;