import { getClassroom } from "@/actions/classrooms";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatTime } from "@/lib/utils";
import { notFound } from "next/navigation";
import Link from "next/link";
import { BookingForm } from "@/components/classrooms/BookingForm";

export default async function ClassroomDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ date?: string }>;
}) {
  const { id } = await params;
  const { date } = await searchParams;
  const selectedDate = date || new Date().toISOString().split("T")[0];
  const { data: classroom } = await getClassroom(id, selectedDate);

  if (!classroom) notFound();

  return (
    <div className="max-w-3xl space-y-6 animate-fade-in">
      <Link href="/classrooms" className="inline-flex items-center gap-1 text-sm text-surface-500 hover:text-surface-700 transition-colors">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        Back to Classrooms
      </Link>

      <Card>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-surface-900">{classroom.name}</h1>
            <p className="text-surface-500 mt-1">{classroom.building} • Capacity: {classroom.capacity}</p>
          </div>
        </div>
      </Card>

      {/* Date selector */}
      <Card>
        <CardHeader>
          <CardTitle>Bookings for {selectedDate}</CardTitle>
          <form className="flex items-center gap-2">
            <input
              type="date"
              name="date"
              defaultValue={selectedDate}
              className="rounded-lg border border-surface-300 px-3 py-1.5 text-sm focus:border-primary-500 focus:outline-none"
            />
            <button type="submit" className="px-3 py-1.5 rounded-lg bg-primary-600 text-white text-sm hover:bg-primary-700 transition-colors">
              View
            </button>
          </form>
        </CardHeader>

        {classroom.bookings && classroom.bookings.length > 0 ? (
          <div className="space-y-2">
            {classroom.bookings.map((booking: { id: string; start_time: string; end_time: string; purpose: string | null; booker?: { full_name: string } }) => (
              <div key={booking.id} className="flex items-center justify-between p-3 rounded-lg bg-surface-50">
                <div>
                  <p className="font-medium text-surface-800">
                    {formatTime(booking.start_time)} — {formatTime(booking.end_time)}
                  </p>
                  <p className="text-sm text-surface-500">{booking.purpose || "No purpose specified"}</p>
                </div>
                <div className="text-right">
                  <Badge variant="primary">{booking.booker?.full_name}</Badge>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-surface-400 py-4 text-center">No bookings for this date. This room is available!</p>
        )}
      </Card>

      {/* Booking form */}
      <Card>
        <CardHeader>
          <CardTitle>Make a Reservation</CardTitle>
        </CardHeader>
        <BookingForm classroomId={classroom.id} selectedDate={selectedDate} />
      </Card>
    </div>
  );
}
