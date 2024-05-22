import { useEffect, useState, useContext, useMemo } from 'react';
import { useRouter } from 'next/router';
import { useSession } from "next-auth/react";
import { User } from "next-auth"
import Image from 'next/image';
import Link from 'next/link';
import shortid from 'shortid';
import Swal from 'sweetalert2';
import { UserCircle } from "phosphor-react"
import {
    WindowIcon,
    ChevronRightIcon,
    ChevronLeftIcon,
    ChevronDoubleLeftIcon,
    ChevronDoubleRightIcon,
    ArrowLongUpIcon,
    ArrowLongDownIcon,
} from "@heroicons/react/20/solid";
import {
    PencilSquareIcon,
    TrashIcon,
    FaceFrownIcon
} from "@heroicons/react/24/outline";
import { useTable, usePagination, useSortBy } from "react-table";
import UserImage from '@/public/static/images/user.svg'
import PageBanner from "@/components/PageBanner";
import Spinner from '@/components/Spinner';
import { formatDate } from '@/utils/utils';

const FormsTable = ({
    data,
    columns,
    initialState,
    clickRecord,
    deleteRecord,
}: {
    data: any[],
    columns: any[],
    initialState: any,
    clickRecord?: Function,
    deleteRecord?: Function,
}) => {
    const { data: session, status } = useSession();
    const user = session?.user as User;
    // Memos
    const dataList = useMemo(() => data, []);
    const columnList = useMemo(() => columns, []);
    const stateValue = useMemo(() => [initialState], []);

    // Use the state and functions returned from useTable to build your UI
    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        prepareRow,
        page,
        canPreviousPage,
        canNextPage,
        pageOptions,
        pageCount,
        gotoPage,
        nextPage,
        previousPage,
        setPageSize,
        state: { pageIndex, pageSize }
    }: any = useTable(
        {
            columns: columnList,
            data: data,
            initialState: stateValue[0]
        },
        useSortBy,
        usePagination
    );

    const handleClick = (id: string) => {
        if (clickRecord) {
            clickRecord(id)
        }
    }

    const handleDelete = (id: string) => {
        if (deleteRecord) {
            deleteRecord(id)
        }
    }

    return (
        <div className="overflow-x-auto">
            <table {...getTableProps()} className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                    {headerGroups.map((headerGroup: any) => (
                        <tr {...headerGroup.getHeaderGroupProps()} key={shortid()}>
                            {headerGroup.headers.map((column: any) => (
                                <th
                                    {...column.getHeaderProps(column.getSortByToggleProps())}
                                    scope="col"
                                    className={
                                        column.isSorted ? column.isSortedDesc ? 'px-4 py-3 desc flex' : 'px-4 py-3 asc flex' : 'px-4 py-3'
                                    }
                                    key={shortid()}
                                >
                                    <div className="flex items-center">
                                        {column.render("Header")}
                                        {
                                            !column.disableSortBy && (
                                                <div className="pl-2 flex">
                                                    <ArrowLongUpIcon className={`w-4 h-4 ${column.isSorted && !column.isSortedDesc ? 'text-primary-cyan dark:text-primary-cyan' : 'text-gray-400 dark:text-white'}`} />
                                                    <ArrowLongDownIcon className={`w-4 h-4 -ml-2 ${column.isSorted && column.isSortedDesc ? 'text-primary-cyan dark:text-primary-cyan' : 'text-gray-400 dark:text-white'}`} />
                                                </div>
                                            )
                                        }
                                    </div>
                                </th>
                            ))}
                        </tr>
                    ))}
                </thead>
                <tbody {...getTableBodyProps()}>
                    {
                        page.map((row: any, i: number) => {
                            prepareRow(row);
                            return (
                                <tr {...row.getRowProps()} className={`${i % 2 == 1 ? 'bg-gray-50 dark:bg-gray-700' : 'bg-white dark:bg-gray-800'} border-b dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700`} key={shortid()}>
                                    {row.cells.map((cell: any) => {
                                        return (
                                            <td {...cell.getCellProps()} className={`px-4 py-2 font-medium text-gray-900 whitespace-nowrap dark:text-white h-10`} key={shortid()}>
                                                {
                                                    cell.column.id == 'action' ?
                                                        <div className="flex items-center gap-x-2">
                                                            <PencilSquareIcon
                                                                className="w-5 h-5 text-green-500 cursor-pointer"
                                                                data-tooltip-id={"action-tool-tip"}
                                                                data-tooltip-content={'Edit'}
                                                                data-tooltip-place="bottom"
                                                                onClick={() => handleClick(cell.value)}
                                                            />
                                                            <TrashIcon
                                                                className="w-5 h-5 text-red-500 cursor-pointer"
                                                                data-tooltip-id={"action-tool-tip"}
                                                                data-tooltip-content={'Delete'}
                                                                data-tooltip-place="bottom"
                                                                onClick={() => handleDelete(cell.value)}
                                                            />
                                                        </div>
                                                        :
                                                        cell.column.id == 'author' ?
                                                            <div className='flex items-center gap-x-2'>
                                                                {/* <Image src={row.original.authorImage ? row.original.authorImage : UserImage} alt={cell.value ?? 'User image'} width={35} height={35} className='rounded-full w-[35px] min-w-[35px] h-[35px] object-cover' /> */}
                                                                <UserCircle size={32} color="#50858B" />Author name
                                                            </div>
                                                            : cell.render("Cell")
                                                }
                                            </td>
                                        );
                                    })}
                                </tr>
                            );
                        })
                    }
                </tbody>
            </table>
            {
                page.length == 0 && (
                    <div className='w-full flex items-center justify-center py-2'>
                        <FaceFrownIcon className='w-8 h-8 mr-1' /> No Forms
                    </div>
                )
            }
            <nav className="flex flex-col items-start justify-between p-4 space-y-3 md:flex-row md:items-center md:space-y-0" aria-label="Table navigation">
                <div className="flex items-center gap-x-2">
                    <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                        Page
                        <span className="font-semibold text-gray-900 dark:text-white"> {pageIndex + 1} </span>
                        of
                        <span className="font-semibold text-gray-900 dark:text-white"> {pageOptions.length}</span>
                    </span>

                    <select
                        value={pageSize}
                        onChange={(e) => {
                            setPageSize(Number(e.target.value));
                        }}
                        className="flex items-center justify-center h-full py-1.5 px-3 leading-tight text-gray-500 bg-white rounded-lg border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white focus:outline-none"
                    >
                        {[10, 20, 30, 40, 50].map((pageSize) => (
                            <option key={pageSize} value={pageSize} className="flex items-center justify-center h-full py-1.5 px-3 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">
                                Show {pageSize}
                            </option>
                        ))}
                    </select>
                </div>

                <ul className="inline-flex items-stretch -space-x-px">
                    <li>
                        <button
                            onClick={() => gotoPage(0)}
                            disabled={!canPreviousPage}
                            className={`flex items-center justify-center h-full py-1.5 px-3 ml-0 text-gray-500 bg-white rounded-l-lg border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white ${!canPreviousPage && 'cursor-not-allowed'}`}
                        >
                            <span className="sr-only">Previous</span>
                            <ChevronDoubleLeftIcon className="w-5 h-5" />
                        </button>
                    </li>
                    <li>
                        <button
                            onClick={() => previousPage()}
                            disabled={!canPreviousPage}
                            className={`flex items-center justify-center h-full py-1.5 px-3 ml-0 text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white ${!canPreviousPage && 'cursor-not-allowed'}`}
                        >
                            <ChevronLeftIcon className="w-5 h-5" />
                        </button>
                    </li>
                    <li>
                        <input
                            type="number"
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm ml-1 focus:outline-none focus:ring-primary-cyan focus:border-primary-cyan block w-20 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-white dark:focus:border-white" placeholder=""
                            value={pageIndex + 1}
                            onChange={(e) => {
                                const page = e.target.value ? Number(e.target.value) - 1 : 0;
                                gotoPage(page);
                            }}
                        />
                    </li>
                    <li>
                        <button
                            onClick={() => nextPage()}
                            disabled={!canNextPage}
                            className={`flex items-center justify-center h-full py-1.5 px-3 ml-1 text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white ${!canNextPage && 'cursor-not-allowed'}`}
                        >
                            <ChevronRightIcon className="w-5 h-5" />
                        </button>
                    </li>
                    <li>
                        <button
                            onClick={() => gotoPage(pageCount - 1)}
                            disabled={!canNextPage}
                            className={`flex items-center justify-center h-full py-1.5 px-3 leading-tight text-gray-500 bg-white rounded-r-lg border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white ${!canNextPage && 'cursor-not-allowed'}`}
                        >
                            <span className="sr-only">Next</span>
                            <ChevronDoubleRightIcon className="w-5 h-5" />
                        </button>
                    </li>
                </ul>
            </nav>
        </div>
    );
};

const FormList = () => {
    const router = useRouter();

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [forms, setForms] = useState<any[]>([]);
    const [allForms, setAllForms] = useState<any[]>([]);
    const [search, setSearch] = useState<string>('');

    useEffect(() => {
        document.title = `Forms - ${process.env.NEXT_PUBLIC_SITE_TITLE}`;
        getForms();
    }, []);

    const handleSearchChange = (e: any) => {
        setSearch(e.target.value);
        const value = e.target.value;
        handleFilter(allForms, value)
    }

    const getForms = async () => {
        setIsLoading(true)
        const response = await fetch(`/api/forms`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            setIsLoading(false)
            const { err } = await response.json();
        } else {
            const { results } = await response.json();
            setIsLoading(false)
            convertData(results);
        }
    }

    const convertData = async (forms: any[]) => {
        const formList = forms.map((formItem: any) => {
            return {
                name: formItem.name,
                author: formItem.authorName,
                users: formItem.users.length,
                action: formItem._id,
                blocks: formItem.blocks,
                authorImage: formItem.authorImage ?? null,
                createdAt: formatDate(formItem.createdAt)
            }
        });
        setAllForms(formList);
        setForms(formList);
    }

    const handleClick = (id: string) => {
        router.push(`/formcreator/${id}`);
    }

    const handleFilter = (data: any[], searchValue: string) => {
        const searchLowerText = searchValue.toLowerCase();
        let filteredForms: any[] = data.filter((formItem: any) => formItem.name.toLowerCase().includes(searchLowerText));
        setForms(filteredForms);
    }

    const handleDelete = (id: string) => {
        Swal.fire({
            title: 'Delete Form',
            text: `Are you sure to delete this?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, Delete it!',
            cancelButtonText: 'Cancel',
            toast: true,
            allowOutsideClick: false,
            customClass: {
                htmlContainer: 'swal-content-container',
                confirmButton: 'swal-confirm-btn',
                cancelButton: 'swal-cancel-btn',
            }
        }).then(async (result) => {
            if (result.isConfirmed) {
                Swal.fire({
                    title: 'Deleting...',
                    toast: true,
                    showConfirmButton: false,
                    allowOutsideClick: false,
                    backdrop: true,
                    customClass: {
                        htmlContainer: 'swal-content-container',
                        confirmButton: 'swal-confirm-btn',
                        cancelButton: 'swal-cancel-btn',
                    },
                    didOpen: async () => {
                        Swal.showLoading();
                        const deleteResult = await deleteForm(id);
                        Swal.hideLoading();
                        Swal.close()
                        if (deleteResult.success) {
                            const updatedForms = allForms.filter(item => item.action !== id);
                            setAllForms(updatedForms);
                            handleFilter(updatedForms, search)
                            alert('Form was deleted successfully')
                        } else {
                            alert('Form delete was failed')
                        }
                    },
                });
            }
        })
    }

    const deleteForm = async (id: string) => {
        const response = await fetch(`/api/forms/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            const { err } = await response.json();
            console.log("[Error] - Delete Form ", err)
            return { success: false, err: err };
        } else {
            return { success: true };
        }
    };

    const columns = [
        {
            Header: "Name",
            accessor: "name"
        },
        {
            Header: "Author",
            accessor: "author"
        },
        {
            Header: "Users",
            accessor: "users",
            sortType: (rowA: any, rowB: any) => {
                return rowA.original.users.length - rowB.original.users.length;
            }
        },
        {
            Header: "Created At",
            accessor: "createdAt"
        },
        {
            Header: "Action",
            accessor: "action",
            disableSortBy: true
        }
    ];

    const initialState = {
        pageSize: 10,
        pageIndex: 0
    };

    return (
        <>
            {
                isLoading ?
                    <Spinner text={'Loading ...'} /> :
                    <div className='mx-auto'>
                        <PageBanner
                            title={'Form Creator'}
                            description={'The Form Creator allows admins to quickly create user input forms, generate unique URLs.'}
                            icon={<WindowIcon className='w-6 h-6 mr-2 text-primary-cyan' />}
                        />
                        <section className='mt-5'>
                            <div>
                                <div className="relative overflow-hidden bg-white shadow-md dark:bg-gray-800 rounded-[15px]">
                                    <div className="flex flex-col px-4 py-3 space-y-3 lg:flex-row lg:items-center lg:justify-between lg:space-y-0 lg:space-x-4">
                                        <div className="flex items-center flex-1 space-x-4">
                                            <h5>
                                                <span className="text-gray-500">All Forms: </span>
                                                <span className="dark:text-white">{forms.length}</span>
                                            </h5>
                                        </div>
                                        <div className="flex flex-col flex-shrink-0 space-y-3 md:flex-row md:items-center lg:justify-end md:space-y-0 md:space-x-3">
                                            <input
                                                type="text"
                                                placeholder='Search by name...'
                                                className='px-3 py-2 text-sm font-medium border-gray-200 border border-gray-200 text-gray-900 rounded-lg placeholder:text-sm focus:outline-none focus:border-primary-blue focus:ring-primary-blue dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700'
                                                value={search}
                                                name="search"
                                                onChange={handleSearchChange}
                                            />
                                            <button className="flex items-center justify-center text-white bg-primary-cyan hover:bg-secondary-cyan focus:ring-4 focus:ring-primary-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-primary-cyan dark:hover:bg-secondary-cyan focus:outline-none dark:focus:ring-secondary-cyan"
                                                onClick={() => {
                                                    router.push(`/formcreator/create`);
                                                }}>
                                                <svg className="h-3.5 w-3.5 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                                                    <path clipRule="evenodd" fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" />
                                                </svg>
                                                Create
                                            </button>
                                        </div>
                                    </div>
                                    <FormsTable data={forms} columns={columns} initialState={initialState} clickRecord={handleClick} deleteRecord={handleDelete} />
                                </div>
                            </div>
                        </section>
                    </div>
            }
        </>
    )
}

export default FormList;