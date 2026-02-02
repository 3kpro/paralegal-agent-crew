import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Forgot Password | XELORA",
  description: "Reset your XELORA account password. Enter your email to receive a password reset link.",
  robots: {
    index: false,
    follow: true,
  },
  alternates: {
    canonical: "https://getxelora.com/forgot-password",
  },
};

export default function ForgotPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
