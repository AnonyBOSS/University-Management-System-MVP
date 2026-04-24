import { AuthForm } from "@/components/auth/AuthForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up — UniManage",
  description: "Create your account for the university management system",
};

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-700 via-primary-600 to-primary-800 items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 rounded-full bg-white/20 blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 rounded-full bg-white/10 blur-3xl" />
        </div>
        <div className="relative text-white max-w-md">
          <h2 className="text-4xl font-bold mb-4">Join UniManage</h2>
          <p className="text-primary-200 text-lg leading-relaxed">
            Get started with your university account. Access courses, submit assignments, and connect with your professors.
          </p>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-surface-50">
        <AuthForm mode="signup" />
      </div>
    </div>
  );
}
