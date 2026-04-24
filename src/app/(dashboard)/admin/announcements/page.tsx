import { getAnnouncements } from "@/actions/announcements";
import { getCurrentUser } from "@/actions/auth";
import { redirect } from "next/navigation";
import { AdminAnnouncementsClient } from "./AdminAnnouncementsClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Manage Announcements — UniManage",
  description: "Admin announcement management",
};

export default async function AdminAnnouncementsPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") redirect("/dashboard");

  const { data: announcements } = await getAnnouncements();

  return <AdminAnnouncementsClient announcements={announcements} />;
}
