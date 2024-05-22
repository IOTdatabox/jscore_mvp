import NextAuth from 'next-auth';

declare module 'next-auth' {
    interface User {
        id?: string | null | undefined,
        _id: string | null,
        name: string | null | undefined,
        image: string | null | undefined,
        email: string | null | undefined,
        orgId: string | null | undefined,
        managingOrgId: string | null | undefined,
        role: string | null | undefined,
        password: string | null | undefined,
        phoneNumber?: string | null,
        isEmailVerified: boolean | false,
        isEmailNotifyEnabled: boolean | false,
        is2faEnabled: boolean | false,
        is2faDone: boolean | false,
        isRememberDevice: boolean | false,
        rememberExpireTime: Date,
        notifications: Array<any> | [] | null | undefined
    }
}