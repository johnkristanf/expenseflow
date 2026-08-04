import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In — Expense Flow",
  description: "Sign in to your Expense Flow financial terminal.",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
