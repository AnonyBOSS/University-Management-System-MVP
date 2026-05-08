import { AuthForm } from "@/components/auth/AuthForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login — UniManage",
  description: "Sign in to your university management portal",
};

export default function LoginPage() {
  return (
    <div className="flex min-h-screen">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-linear-to-br from-primary-700 via-primary-600 to-primary-800 items-center justify-center p-12 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 rounded-full bg-white/20 blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 rounded-full bg-white/10 blur-3xl" />
        </div>
        <div className="relative text-white max-w-md">
          <h2 className="text-4xl font-bold mb-4">University Management System</h2>
          <p className="text-primary-200 text-lg leading-relaxed">
            A unified platform for students, professors, and administrators to manage courses, assignments, classrooms, and communications.
          </p>
          <div className="mt-8 flex gap-3">
            <div className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-2 text-sm">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              Courses
            </div>
            <div className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-2 text-sm">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              Grades
            </div>
            <div className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-2 text-sm">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              Messages
            </div>
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-surface-50 dark:bg-surface-900">
        <AuthForm mode="login" />
      </div>
    </div>
  );
}
