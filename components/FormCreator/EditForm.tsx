import { useEffect } from 'react';
import {
    WindowIcon
} from "@heroicons/react/20/solid";

import PageBanner from "@/components/PageBanner";
import FormCreator from './FormCreator';

const EditForm = () => {
    useEffect(() => {
        document.title = `Form Create - ${process.env.NEXT_PUBLIC_SITE_TITLE}`;
    }, []);

    return (
        <>
            {
                <div className='mx-auto'>
                    <PageBanner
                        title={'Form Creator'}
                        description={'The Form Creator allows users to quickly create feedback forms, generate unique URLs.'}
                        icon={<WindowIcon className='w-6 h-6 mr-2 text-primary-yellow' />}
                    />
                    <section className='mt-5'>
                        <div>
                            <FormCreator/>
                        </div>
                    </section>
                </div>
            }
        </>
    )
}

export default EditForm;