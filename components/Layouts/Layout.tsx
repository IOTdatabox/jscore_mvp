import React from "react";
import { ReactNode, useEffect } from "react";
import Sidebar from "@/components/Layouts/Sidebar";

const Layout = ({
    noHeader,
    children,
}: {
    noHeader?: boolean,
    children: ReactNode,
}) => {
    useEffect(() => {
        document.title = `${process.env.NEXT_PUBLIC_SITE_TITLE}`;
    }, []);
    return (
        <div className="min-h-screen flex flex-col flex-auto flex-shrink-0 antialiased bg-light-cyan dark:bg-gray-700 text-black dark:text-white">
            <Sidebar />
            <main className={`h-full ml-14 mt-5 mb-10 md:ml-64`}>
                <div className={`px-[10px] sm:px-10 py-5 h-full`}>
                    {children}
                </div>
            </main>
        </div>
    );
};

export default Layout;