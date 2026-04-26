import { getClassroom } from "@/actions/classrooms";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { formatTime } from "@/lib/utils";
import { notFound } from "next/navigation";
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

  // Build time blocks for the visual timeline
  const bookings = (classroom.bookings || []) as {
    id: string;
    start_time: string;
    end_time: string;
    purpose: string | null;
    booker?: { full_name: string };
  }[];

  return (
    <div className="max-w-3xl space-y-6 animate-fade-in">
      <Breadcrumbs items={[
        { label: "Classrooms", href: "/classrooms" },
        { label: classroom.name },
      ]} />

      <Card>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-surface-900 dark:text-white">{classroom.name}</h1>
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
              className="rounded-lg border border-surface-300 dark:border-surface-600 bg-white dark:bg-surface-800 text-surface-800 dark:text-surface-200 px-3 py-1.5 text-sm focus:border-primary-500 focus:outline-none"
            />
            <button type="submit" className="px-3 py-1.5 rounded-lg bg-primary-600 text-white text-sm hover:bg-primary-700 transition-colors">
              View
            </button>
          </form>
        </CardHeader>

        {/* Visual timeline */}
        {bookings.length > 0 ? (
          <div className="space-y-4">
            {/* Timeline bar */}
            <div className="relative h-14 rounded-lg bg-surface-100 dark:bg-surface-700 overflow-hidden">
              {/* Hour markers */}
              {Array.from({ length: 13 }, (_, i) => i + 7).map((hour) => (
                <div
                  key={hour}
                  className="absolute top-0 bottom-0 border-l border-surface-200 dark:border-surface-600"
                  style={{ left: `${((hour - 7) / 13) * 100}%` }}
                >
                  <span className="absolute -top-5 left-0 text-[9px] text-surface-400 -translate-x-1/2">
                    {hour}:00
                  </span>
                </div>
              ))}
              {/* Booking blocks */}
              {bookings.map((booking, i) => {
                const [sh, sm] = booking.start_time.split(":").map(Number);
                const [eh, em] = booking.end_time.split(":").map(Number);
                const startMin = sh * 60 + sm - 7 * 60;
                const endMin = eh * 60 + em - 7 * 60;
                const totalMin = 13 * 60;
                const left = Math.max(0, (startMin / totalMin) * 100);
                const width = Math.min(100 - left, ((endMin - startMin) / totalMin) * 100);
                const colors = [
                  "bg-primary-400/80 dark:bg-primary-500/60",
                  "bg-emerald-400/80 dark:bg-emerald-500/60",
                  "bg-amber-400/80 dark:bg-amber-500/60",
                  "bg-rose-400/80 dark:bg-rose-500/60",
                ];
                return (
                  <div
                    key={booking.id}
                    className={`absolute top-1 bottom-1 rounded-md ${colors[i % colors.length]} flex items-center px-2 overflow-hidden`}
                    style={{ left: `${left}%`, width: `${width}%`, minWidth: "40px" }}
                    title={`${formatTime(booking.start_time)} - ${formatTime(booking.end_time)}: ${booking.purpose || "Booked"}`}
                  >
                    <span className="text-[10px] font-medium text-white truncate">
                      {booking.booker?.full_name || "Booked"}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Booking list */}
            <div className="space-y-2">
              {bookings.map((booking) => (
                <div key={booking.id} className="flex items-center justify-between p-3 rounded-lg bg-surface-50 dark:bg-surface-800">
                  <div>
                    <p className="font-medium text-surface-800 dark:text-surface-200">
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
