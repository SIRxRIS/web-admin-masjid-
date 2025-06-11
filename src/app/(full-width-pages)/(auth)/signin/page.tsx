import SignInForm from "@/components/auth/SignInForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Web Admin Masjid Jawahiruzzarqa",
  description: "Portal admin terpadu untuk mengelola operasional harian Masjid Jawahiruzzarqa.",
};

export default function SignIn() {
  return <SignInForm />;
}
