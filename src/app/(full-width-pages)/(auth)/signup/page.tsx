import SignUpForm from "@/components/auth/SignUpForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Web Admin Masjid Jawahiruzzarqa",
  description: "Portal admin terpadu untuk mengelola operasional harian Masjid Jawahiruzzarqa.",
  // other metadata
};

export default function SignUp() {
  return <SignUpForm />;
}
