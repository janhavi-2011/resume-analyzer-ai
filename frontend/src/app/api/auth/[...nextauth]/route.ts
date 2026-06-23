// src/app/api/auth/[...nextauth]/route.ts

import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import axios from "axios";

const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        try {
          const response = await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
            {
              email: credentials.email,
              password: credentials.password,
            }
          );

          const { access_token, user } = response.data;

          return {
            id: user.id,
            email: user.email,
            name: user.full_name,
            accessToken: access_token,
          };
        } catch {
          return null;
        }
      },
    }),
  ],

  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        try {
          // Send Google user to our backend to create/login
          const response = await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL}/auth/oauth`,
            {
              email: user.email,
              full_name: user.name,
              provider: "google",
              provider_id: account.providerAccountId,
            }
          );

          const { access_token } = response.data;
          (user as any).accessToken = access_token;
          return true;
        } catch (error) {
          console.error("OAuth backend error:", error);
          return true; // Still allow sign in, handle token separately
        }
      }
      return true;
    },

    async jwt({ token, user, account }) {
      // Persist the access token in the JWT
      if ((user as any)?.accessToken) {
        (token as any).accessToken = (user as any).accessToken;
      }

      // For Google OAuth, exchange on first sign in
      if (account?.provider === "google" && account?.access_token) {
        try {
          const response = await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL}/auth/oauth`,
            {
              email: token.email,
              full_name: token.name,
              provider: "google",
              provider_id: account.providerAccountId,
            }
          );
          token.accessToken = response.data.access_token;
        } catch { }
      }

      return token;
    },

    async session({ session, token }) {
      // Pass the access token to the session
      (session as any).accessToken = (token as any).accessToken;
      return session;
    },
  },

  pages: {
    signIn: "/login",
  },

  session: {
    strategy: "jwt",
  },

  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };