const PageBanner = ({
    title,
    description,
    icon
}: {
    title?: string,
    description?: string,
    icon?: React.ReactElement
}) => {
    return (
        <div className='sm:flex sm:items-center pt-5 pb-5 px-4 bg-white dark:bg-gray-800 rounded-[15px] shadow-lg'>
            <div className='sm:flex-auto'>
                <h1 className='flex items-center text-lg font-semibold leading-6 text-gray-900 dark:text-white'>
                    {icon} {title}
                </h1>
                <p className='mt-2 text-sm text-gray-700 dark:text-white'>
                    {description}
                </p>
            </div>
        </div>
    );
};

export default PageBanner;