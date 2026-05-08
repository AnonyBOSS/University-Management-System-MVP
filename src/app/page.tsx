import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) redirect("/dashboard");

  return (
    <div className="min-h-screen bg-surface-50">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 sm:px-12 py-4 bg-white/80 backdrop-blur-md border-b border-surface-100 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-primary-600 text-white shadow-sm">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
            </svg>
          </div>
          <span className="text-lg font-bold text-surface-900">UniManage</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="px-4 py-2 text-sm font-medium text-surface-600 hover:text-surface-800 transition-colors">
            Sign In
          </Link>
          <Link href="/signup" className="px-5 py-2.5 text-sm font-medium bg-primary-600 text-white rounded-xl hover:bg-primary-700 shadow-sm hover:shadow-md transition-all">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative px-6 sm:px-12 pt-20 pb-28 text-center overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-400/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl" />
        </div>

        <div className="max-w-4xl mx-auto animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-50 text-primary-700 text-sm font-medium mb-6 border border-primary-100">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            Built for modern universities
          </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-surface-900 leading-tight tracking-tight">
            Your University,
            <br />
            <span className="bg-linear-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
              Unified & Simplified
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-surface-500 max-w-2xl mx-auto leading-relaxed">
            Manage courses, assignments, classrooms, and communications — all in one beautiful platform designed for students, professors, and administrators.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup" className="w-full sm:w-auto px-8 py-3.5 text-base font-semibold bg-primary-600 text-white rounded-xl hover:bg-primary-700 shadow-lg shadow-primary-600/25 hover:shadow-xl hover:shadow-primary-600/30 transition-all">
              Start for Free →
            </Link>
            <Link href="/login" className="w-full sm:w-auto px-8 py-3.5 text-base font-semibold text-surface-700 bg-white border border-surface-200 rounded-xl hover:bg-surface-50 shadow-sm transition-all">
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 sm:px-12 py-20 bg-white border-t border-surface-100">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-surface-900">Everything you need</h2>
            <p className="mt-3 text-lg text-surface-500">A complete toolkit for university management.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
            {[
              {
                icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253",
                title: "Course Catalog",
                desc: "Browse, filter, and register for courses. Track enrollment capacity in real-time.",
                color: "primary",
              },
              {
                icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
                title: "Assignments & Grading",
                desc: "Submit assignments with file attachments. Professors grade with detailed feedback.",
                color: "amber",
              },
              {
                icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4",
                title: "Classroom Booking",
                desc: "Find available rooms and reserve them. Non-overlapping bookings enforced automatically.",
                color: "emerald",
              },
              {
                icon: "M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z",
                title: "Messaging",
                desc: "Direct student-professor messaging with conversation threads and read status.",
                color: "rose",
              },
              {
                icon: "M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z",
                title: "Announcements",
                desc: "University-wide announcements from administrators. Never miss important updates.",
                color: "violet",
              },
              {
                icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
                title: "Role-Based Security",
                desc: "Student, professor, and admin roles with database-level security policies.",
                color: "sky",
              },
            ].map((feature, i) => (
              <div key={i} className="group p-6 rounded-2xl border border-surface-200 hover:border-primary-200 bg-white hover:shadow-lg hover:shadow-primary-500/5 transition-all duration-300">
                <div className={`w-12 h-12 rounded-xl bg-${feature.color}-100 text-${feature.color}-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={feature.icon} />
                  </svg>
                </div>
                <h3 className="font-semibold text-surface-900 text-lg mb-2">{feature.title}</h3>
                <p className="text-surface-500 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 sm:px-12 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="p-12 rounded-3xl bg-linear-to-br from-primary-600 to-primary-800 text-white shadow-2xl shadow-primary-600/20">
            <h2 className="text-3xl sm:text-4xl font-bold">Ready to get started?</h2>
            <p className="mt-4 text-primary-200 text-lg">Create your account in seconds. No credit card required.</p>
            <Link href="/signup" className="inline-block mt-8 px-8 py-3.5 bg-white text-primary-700 rounded-xl font-semibold hover:bg-primary-50 shadow-lg transition-all">
              Create Free Account →
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 sm:px-12 py-8 border-t border-surface-200 text-center text-sm text-surface-400">
        <p>© {new Date().getFullYear()} UniManage. Built with Next.js & Supabase.</p>
      </footer>
    </div>
  );
}
