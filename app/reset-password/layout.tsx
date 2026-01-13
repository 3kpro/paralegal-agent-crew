import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reset Password | XELORA",
  description: "Create a new password for your XELORA account.",
  robots: {
    index: false,
    follow: true,
  },
  alternates: {
    canonical: "https://xelora.app/reset-password",
  },
};

export default function ResetPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
