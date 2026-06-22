import { DefaultSession } from "next-auth";
import { DefaultJWT } from "next-auth/jwt";

export interface CustomUser {
  id: string;
  email: string;
  rol: string;
  token: string; // El token de Express backend
}

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: CustomUser & DefaultSession["user"];
  }
  interface User extends CustomUser {}
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string;
    rol: string;
    token: string;
  }
}
