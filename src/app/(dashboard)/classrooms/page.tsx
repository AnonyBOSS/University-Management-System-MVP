import { getClassrooms } from "@/actions/classrooms";
import { Card } from "@/components/ui/Card";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Classrooms — UniManage",
  description: "View and book classrooms",
};

export default async function ClassroomsPage() {
  const { data: classrooms } = await getClassrooms();

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-surface-900">Classrooms</h1>
        <p className="text-surface-500 mt-1">View available classrooms and make reservations.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
        {classrooms.map((room) => (
          <Link key={room.id} href={`/classrooms/${room.id}`}>
            <Card hover className="h-full">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-primary-100 text-primary-600 flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-surface-900">{room.name}</h3>
                  <p className="text-sm text-surface-500">{room.building}</p>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm text-surface-400 pt-3 border-t border-surface-100">
                <span>Capacity: {room.capacity}</span>
                <span className="text-primary-600 font-medium">Book →</span>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
