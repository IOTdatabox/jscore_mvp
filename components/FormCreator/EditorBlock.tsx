import Image from 'next/image';
import {
    PencilSquareIcon,
    XMarkIcon
} from "@heroicons/react/20/solid";

import DragDropMarkSvg from '@/public/static/images/dnd-marker.svg';

const EditorBlock = ({
    icon,
    text,
    index,
    type,
    onDelete,
    onEdit
}: {
    icon: any,
    text: string,
    index: number,
    type: string,
    onDelete: Function,
    onEdit: Function
}) => {
    return (
        <div className='flex items-center gap-2'>
            <div>
                <Image src={DragDropMarkSvg} alt='Drag' className='w-6 h-6' />
            </div>
            <div className='w-full p-2 flex items-center gap-2 border border-primary-yellow rounded-lg cursor-pointer'>
                <Image src={icon} alt='' className='w-6 h-6' /> {text}
            </div>
            <div className='p-0.5 cursor-default' onClick={() => onEdit(index)}>
                <PencilSquareIcon className='w-5 h-5 text-green-500' />
            </div>
            <div className='p-0.5 cursor-default' onClick={() => onDelete(index)}>
                <XMarkIcon className='w-5 h-5 text-red-500' />
            </div>
        </div>
    )
}

export default EditorBlock