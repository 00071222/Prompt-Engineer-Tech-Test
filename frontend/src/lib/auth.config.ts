import type { NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import api from "@/lib/axios";

export const authConfig = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        try {
          const response = await api.post("/auth/login", {
            email: credentials.email,
            password: credentials.password
          });
          
          if (response.data && response.data.token) {
            return {
              id: response.data.user.id,
              email: response.data.user.email,
              rol: response.data.user.rol,
              token: response.data.token
            };
          }
          return null;
        } catch (error) {
          return null;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id ?? '';
        token.rol = user.rol ?? '';
        token.token = user.token ?? '';
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.rol = token.rol;
        session.user.token = token.token;
      }
      return session;
    }
  },
  pages: {
    signIn: "/login",
  }
} satisfies NextAuthConfig;
