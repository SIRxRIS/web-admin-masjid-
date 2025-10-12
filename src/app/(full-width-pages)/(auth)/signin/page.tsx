import SignInForm from "@/components/auth/SignInForm";
import { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Web Admin Masjid Jawahiruzzarqa",
  description: "Portal admin terpadu untuk mengelola operasional harian Masjid Jawahiruzzarqa.",
};

export default function SignIn() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignInForm />
    </Suspense>
  );
}
