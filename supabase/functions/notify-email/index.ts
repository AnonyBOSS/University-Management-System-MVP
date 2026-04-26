// Supabase Edge Function for email notifications
// Deploy with: supabase functions deploy notify-email
//
// This function is triggered by a database webhook on INSERT events for:
// - assignments (new assignment posted)
// - grades (assignment graded)
// - messages (new message received)
//
// Set up webhooks in the Supabase Dashboard → Database → Webhooks → Create Webhook
// Trigger this function's URL for each table's INSERT event.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

serve(async (req: Request) => {
  try {
    const { type, record, table } = await req.json();

    if (type !== "INSERT") return new Response("Ignored", { status: 200 });

    let to = "";
    let subject = "";
    let html = "";

    if (table === "assignments") {
      // New assignment — notify enrolled students
      subject = `New Assignment: ${record.title}`;
      html = `
        <h2>New Assignment Posted</h2>
        <p><strong>${record.title}</strong> has been posted.</p>
        <p>Due date: ${new Date(record.due_date).toLocaleDateString()}</p>
        <p><a href="${Deno.env.get("SITE_URL")}/assignments/${record.id}">View Assignment</a></p>
      `;
      // In production, query enrolled students and send to each
      return new Response(JSON.stringify({ message: "Assignment notification queued" }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    if (table === "grades") {
      // Grade posted — notify student
      subject = "Your assignment has been graded";
      html = `
        <h2>Assignment Graded</h2>
        <p>Your submission has been graded.</p>
        <p>Score: <strong>${record.score}</strong></p>
        ${record.feedback ? `<p>Feedback: ${record.feedback}</p>` : ""}
        <p><a href="${Deno.env.get("SITE_URL")}/grades">View Your Grades</a></p>
      `;
      // In production, look up student email from submission
    }

    if (table === "messages") {
      // New message — notify receiver
      subject = `New message: ${record.subject}`;
      html = `
        <h2>You have a new message</h2>
        <p><strong>${record.subject}</strong></p>
        <p>${record.body}</p>
        <p><a href="${Deno.env.get("SITE_URL")}/messages/${record.sender_id}">Reply</a></p>
      `;
      // In production, look up receiver email
    }

    // Send email via Resend (or any email provider)
    if (RESEND_API_KEY && to) {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: "UniManage <noreply@yourdomain.com>",
          to,
          subject,
          html,
        }),
      });
    }

    return new Response(JSON.stringify({ message: "OK" }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
