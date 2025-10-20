"use client";
import UserMetaCard from "@/components/user-profile/UserMetaCard";
import UserAddressCard from "@/components/user-profile/UserAddressCard";

export default function ProfileClient() {
  return (
    <div className="space-y-6">
      <UserMetaCard />
      <UserAddressCard />
    </div>
  );
}