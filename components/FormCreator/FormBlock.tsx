import Image from 'next/image';
import "@quillforms/renderer-core/build-style/style.css";
import {
    PlusIcon
} from "@heroicons/react/20/solid";

const FormBlock = ({
    icon,
    label,
    type,
    handleAdd
}: {
    icon: any,
    label: string,
    type: string,
    handleAdd: Function
}) => {
    return (
        <div className='flex items-center gap-2'>
            <div className='w-full p-2 flex items-center gap-2 border border-dashed border-primary-yellow rounded-lg cursor-pointer'>
                <Image src={icon} alt='' className='w-6 h-6' /> {label}
            </div>
            <div className='p-2 bg-primary-yellow rounded-lg cursor-default hover:bg-secondary-yellow' onClick={() => handleAdd(type)}>
                <PlusIcon className='w-6 h-6 text-white' />
            </div>
        </div>
    )
}

export default FormBlock;