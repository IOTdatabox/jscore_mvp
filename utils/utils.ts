import moment from 'moment';
import { Types } from 'mongoose';
import { customAlphabet } from 'nanoid';
import { z } from "zod";

export const formatDateWithType = (date: Date, type: string) => {
    return moment(date).format(type);
};

export function classNames(...classes: any) {
    return classes.filter(Boolean).join(' ')
}

export function formatDate(dateString: string): string {
    const date = new Date(dateString);
    const year = date.getUTCFullYear();
    const month = date.getUTCMonth() + 1;
    const day = date.getUTCDate();
    const formattedDate = `${month}/${day}/${year}`;
    return formattedDate;
}

export function formatDateWithTime(dateString: string): string {
    const months: { [key: number]: string } = {
        0: '01', 1: '02', 2: '03', 3: '04', 4: '05', 5: '06',
        6: '07', 7: '08', 8: '09', 9: '10', 10: '11', 11: '12'
    };

    const date = new Date(dateString);
    const month = months[date.getMonth()];
    const day = ('0' + date.getDate()).slice(-2);
    const year = date.getFullYear().toString();

    let hours = date.getHours();
    const minutes = ('0' + date.getMinutes()).slice(-2);
    const amPm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    const formattedHours = ('0' + hours).slice(-2);
    const formatDateWithTime = `${month}/${day}/${year} ${formattedHours}:${minutes} ${amPm}`;
    return formatDateWithTime;
}

export function dateDiff(date1: string, date2: string) {
    const fromDate = new Date(date1);
    const toDate = new Date(date2);
    const diff = Math.abs(toDate.getTime() - fromDate.getTime());
    const diffSeconds = Math.floor(diff / 1000);
    const diffMinutes = Math.floor(diff / (1000 * 60));
    const diffHours = Math.floor(diff / (1000 * 60 * 60));
    const diffDays = Math.floor(diff / (1000 * 60 * 60 * 24));
    const diffMonths =
        (toDate.getMonth() + 1) -
        (fromDate.getMonth() + 1) +
        12 * (toDate.getFullYear() - fromDate.getFullYear());

    const fromYear = fromDate.getFullYear();
    const toYear = toDate.getFullYear();
    let diffYears = toYear - fromYear;

    // Adjust for fractional year
    if (toDate < fromDate || (toDate.getMonth() === fromDate.getMonth() && toDate.getDate() < fromDate.getDate())) {
        diffYears--;
    }

    let result = diffSeconds > 1 ? diffSeconds + ' seconds ago' : diffSeconds + ' second ago';

    if (diffYears > 0) {
        result = diffYears > 1 ? diffYears + ' years ago' : diffYears + ' year ago';
        result = formatDate(date2);
    } else if (diffMonths > 0) {
        result = diffMonths > 1 ? diffMonths + ' months ago' : diffMonths + ' month ago';
        result = formatDate(date2);
    } else if (diffDays > 0) {
        result = diffDays > 1 ? diffDays + ' days ago' : diffDays + ' day ago';
        if (diffDays > 7) {
            result = formatDate(date2);
        }
    } else if (diffHours > 0) {
        result = diffHours > 1 ? diffHours + ' hours ago' : diffHours + ' hour ago';
    } else if (diffMinutes > 0) {
        result = diffMinutes > 1 ? diffMinutes + ' minutes ago' : diffMinutes + ' minute ago';
    }

    return result;
}

export const isEmpty = (obj: any) => {
    return Object.getOwnPropertyNames(obj).length === 0;
};

export const formatFileSize = (size: number) => {
    if (size > 1024 * 1024) {
        return (size / 1024 / 1024).toFixed(2) + " MB"
    } else if (size > 1024) {
        return (size / 1024).toFixed(2) + " KB"
    } else if (size <= 1024) {
        return size + " B"
    }
}

export const generateVerificationCode = () => {
    const alphabet = '0123456789';
    const generate = customAlphabet(alphabet, 6);
    return generate();
}

export const zodObjectId = z.string().refine(value => Types.ObjectId.isValid(value), {
    message: 'Invalid ObjectID',
});

export const getFileInfoFromName = (name: string) => {
    const parts = name.split('***');
    return {
        patientId: parts[0],
        fileName: parts[2]
    }
}

export const convertToSlug = (text: string) => {
    return text.toLowerCase().replace(/\s+/g, '-');
}

export const extractOnlyEmailsFromExcelFile = (sheetData: any) => {
    const emailPattern = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
    const emails = sheetData.flatMap((row: any) =>
        row.filter((cell: any) => emailPattern.test(cell))
    );
    return emails;
};
