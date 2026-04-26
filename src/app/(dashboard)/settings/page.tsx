import { getCurrentUser } from "@/actions/auth";
import { redirect } from "next/navigation";
import { SettingsClient } from "./SettingsClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Settings — UniManage",
  description: "Manage your profile settings",
};

export default async function SettingsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return <SettingsClient user={user} />;
}
