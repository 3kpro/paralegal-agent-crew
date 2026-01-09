
import NextAuth from "next-auth"
import MicrosoftEntraID from "next-auth/providers/microsoft-entra-id"

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    MicrosoftEntraID({
      clientId: process.env.AUTH_AZURE_AD_ID,
      clientSecret: process.env.AUTH_AZURE_AD_SECRET,
      issuer: `https://login.microsoftonline.com/${process.env.AUTH_AZURE_AD_TENANT_ID}/v2.0`,
      authorization: { params: { scope: "openid profile email offline_access https://management.azure.com/user_impersonation" } },
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token
      }
      return token
    },
    async session({ session, token }) {
      // @ts-expect-error - accessToken is not typed in default session yet
      session.accessToken = token.accessToken
      return session
    },
  },
  secret: process.env.AUTH_SECRET,
})
