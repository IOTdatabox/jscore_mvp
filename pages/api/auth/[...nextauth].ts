import NextAuth from "next-auth";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { ObjectId } from "mongodb";

import clientPromise from "@/utils/mongodb";

export const authOptions: NextAuthOptions = {
    session: {
        strategy: "jwt",
        maxAge: 60 * 60 * 24, // 24 hours
        // maxAge: 60 * 1, // 1 min
    },
    secret: process.env.NEXTAUTH_SECRET!,
    providers: [
        CredentialsProvider({
            name: "Credentials",
            id: "credentials",
            credentials: {
                email: {
                    label: "email",
                    type: "email",
                    placeholder: "email@example.com",
                },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials, req) {
                return null;
            },
        }),
    ],
    pages: {
        signIn: "/",
        error: "/",
    },
    callbacks: {
        async jwt({ token, user }: any) {
            if (user) {
                token.user = user;
            }
            return token;
        },
        session: async ({ session, token }: any) => {
            
            return session;
        },
    },
};

export default NextAuth(authOptions);