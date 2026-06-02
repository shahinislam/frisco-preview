import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials";
import http from "../../../components/utils/http";

export const authOptions = {
    // Configure one or more authentication providers
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET
        }),

        CredentialsProvider({
            name: "Credentials",
            async authorize(credentials, req) {
                const res = await http.post('/login', credentials);
                const user = await res.data;
                // console.log(user)
                if (user.role === 'doctor' && user.status === 1) {
                    return user;
                } else {
                    return null
                }
            },
        })
    ],

    callbacks: {
        signIn: async ({ account, profile, credentials }) => {
            if (account.provider === 'google' && profile.email.endsWith("@ercare24.com")) {
                const data = {
                    name: profile?.name,
                    username: profile?.email,
                    role: "doctor",
                    email: profile?.email,
                    password: "",
                };

                const res = await http.post("/user/google", data);
                const token = res.data;
                profile.doctor_token = token;
                // console.log("Token:::")
                if (profile.email_verified) {
                    profile.doctor_token = token;
                    return true; // Successful Google authentication
                } else {
                    return false; // Google authentication failed
                }
            } else if (account.provider === "credentials" && credentials.status === '1') {
                // Credentials-based authentication logic
                return true; // Use the authorize function from CredentialsProvider
            }

            return false; // Authentication failed
        },

        session: async ({ session, token }) => {
            if (session?.user) {
                session.user.doctor_token = token.doctor_token;
            }
            return session;
        },

        jwt: async ({ user, token, profile }) => {
            if (user) {
                token.doctor_token = user.token;
            }
            if (profile?.doctor_token) {
                token.doctor_token = profile.doctor_token;
            }
            // console.log(profile)
            return token;
        },

        async onError(error, req, res) {
            const statusCode = error.statusCode || 500;
            res.status(statusCode).json({ error: 'error.message' });
        },
    },

    pages: {
        signIn: '/membership-login',
        signOut: '/membership-login',
    },

    session: {
        strategy: 'jwt'
    },

    secret: process.env.JWT_SECRET,
}

export default NextAuth(authOptions)