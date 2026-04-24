// ============================================================
// Database type definitions — mirrors the Supabase schema
// ============================================================

export type UserRole = "student" | "professor" | "admin";
export type CourseType = "core" | "elective";
export type EnrollmentStatus = "enrolled" | "dropped";

// --- Profiles ---
export interface Profile {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  created_at: string;
}

// --- Courses ---
export interface Course {
  id: string;
  title: string;
  description: string | null;
  code: string;
  type: CourseType;
  professor_id: string | null;
  max_capacity: number;
  schedule: string | null;
  created_at: string;
  // Joined fields
  professor?: Profile;
  enrollment_count?: number;
}

// --- Enrollments ---
export interface Enrollment {
  id: string;
  student_id: string;
  course_id: string;
  status: EnrollmentStatus;
  enrolled_at: string;
  // Joined fields
  course?: Course;
  student?: Profile;
}

// --- Assignments ---
export interface Assignment {
  id: string;
  course_id: string;
  title: string;
  description: string | null;
  due_date: string;
  max_score: number;
  created_at: string;
  // Joined fields
  course?: Course;
  submission?: Submission;
}

// --- Submissions ---
export interface Submission {
  id: string;
  assignment_id: string;
  student_id: string;
  content: string | null;
  file_url: string | null;
  submitted_at: string;
  // Joined fields
  student?: Profile;
  assignment?: Assignment;
  grade?: Grade;
}

// --- Grades ---
export interface Grade {
  id: string;
  submission_id: string;
  graded_by: string;
  score: number;
  feedback: string | null;
  graded_at: string;
}

// --- Classrooms ---
export interface Classroom {
  id: string;
  name: string;
  building: string;
  capacity: number;
  created_at: string;
}

// --- Bookings ---
export interface Booking {
  id: string;
  classroom_id: string;
  booked_by: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  purpose: string | null;
  created_at: string;
  // Joined fields
  classroom?: Classroom;
  booker?: Profile;
}

// --- Messages ---
export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  subject: string;
  body: string;
  is_read: boolean;
  parent_id: string | null;
  created_at: string;
  // Joined fields
  sender?: Profile;
  receiver?: Profile;
}

// --- Announcements ---
export interface Announcement {
  id: string;
  author_id: string;
  title: string;
  body: string;
  created_at: string;
  // Joined fields
  author?: Profile;
}
