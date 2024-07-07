import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import { User } from "next-auth";
import shortid from "shortid";
import {
    WindowIcon,
    CpuChipIcon,
    TableCellsIcon
} from '@heroicons/react/24/outline'

import { navigations } from "@/config/navigations";

export const icons: any[] = [
    <span key={shortid()} className="inline-flex justify-center items-center ml-4"><WindowIcon className='h-5 w-5' /></span>,
    <span key={shortid()} className="inline-flex justify-center items-center ml-4"><CpuChipIcon className='h-5 w-5' /></span>,
    <span key={shortid()} className="inline-flex justify-center items-center ml-4"><TableCellsIcon className='h-5 w-5' /></span>
]

const Sidebar = () => {
    const currentYear = new Date().getFullYear();
    const router = useRouter();
    const { data: session } = useSession();
    const [activeMenu, setActiveMenu] = useState<number>(-1);

    const user = session?.user as User;

    const handleMenuClick = (idx: number) => {
        setActiveMenu(idx);
            router.push(navigations[idx].href);
    };

    useEffect(() => {
        setActiveMenu(-1)
            navigations.map((menu: any, index: number) => {
                if (router.pathname.includes(menu.href)) {
                    setActiveMenu(index);
                }
            });
    }, []);

    return (
        <div className={`fixed flex flex-col left-0 w-14 hover:w-64 md:w-64 dark:bg-gray-900 bg-secondary-cyan-1 h-full text-white dark:text-white transition-all duration-300 border-none z-30 sidebar shadow-lg`}>
            <div className="overflow-y-auto overflow-x-hidden flex flex-col justify-between flex-grow">
                <ul className="flex flex-col pb-4 space-y-1">
                    <li>
                        <div className={`flex items-center justify-start md:justify-center pl-3 w-14 md:w-64 h-14`}>
                            <a className='flex items-center gap-x-2'>
                                <span className='hidden md:block text-[24px] text-white '><strong>Jsocre</strong> MVP</span>
                            </a>
                        </div>
                    </li>
                    {
                        navigations.map((item: any, index: number) => {
                            return (
                                <div key={shortid()}>
                                    <li key={`nav_item_${index}`} className={`md:px-3 ${index == 0 ? 'pt-5' : 'pt-0'}`}>
                                        <a
                                            onClick={() => handleMenuClick(index)}
                                            className={`relative rounded-[15px] cursor-pointer flex flex-row items-center h-11 focus:outline-none dark:hover:bg-gray-600 dark:hover:border-gray-800 hover:bg-primary-cyan ${activeMenu == index ? 'bg-white dark:bg-gray-600 border-secondary-cyan-1 dark:border-gray-800 text-secondary-cyan-1 dark:text-white' : 'border-transparent'} hover:border-secondary-cyan-1 hover:text-white border-l-4 pr-6`}
                                        >
                                            {icons[index]}
                                            <span className="ml-2 text-sm tracking-wide truncate">{item.label}</span>
                                        </a>
                                    </li>
                                </div>
                            )
                        })
                    }
                </ul>
                <p className="mb-0 px-5 py-3 hidden md:block text-center text-xs">Copyright @{currentYear} Company</p>
            </div>
        </div>
    )
}

export default Sidebar;