import { Types } from "mongoose"

export interface GeneratedOrgType {
    name: string,
    parent?: string,
}

export interface GeneratedUserType {
    name: string,
    email: string,
    role: string,
    organization: string,
}

export interface OrgType {
    _id: Types.ObjectId,
    name: string,
}

export interface BulkUserType {
    name: string,
    email: string,
    password: string,
    org: string,
}

export interface ResultType {
    addedOrgs: {
        count: number,
        detail: {
            name: string,
            parent?: string
        }[]
    },
    failedOrgs: {
        count: number,
        detail: {
            name: string,
            parent?: string
            reason: string,
        }[]
    },
    addedUsers: {
        count: number,
        detail: {
            name: string,
            email: string,
        }[]
    },
    failedUsers: {
        count: number,
        detail: {
            name: string,
            email: string,
            reason: string,
        }[]
    }
}