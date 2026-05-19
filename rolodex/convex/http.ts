import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";

const http = httpRouter();

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

http.route({
  path: "/submit-contact",
  method: "OPTIONS",
  handler: httpAction(async () => {
    return new Response(null, { status: 200, headers: corsHeaders });
  }),
});

http.route({
  path: "/submit-contact",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const body = await request.json();
      const { name, email, org, service, message } = body;

      if (!name || !email) {
        return new Response(JSON.stringify({ error: "Name and email are required." }), {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }

      const contactId = await ctx.runMutation(api.contacts.create, {
        name,
        email,
        company: org || undefined,
        source: "Website Contact Form",
        tags: service ? [service] : undefined,
      });

      if (message) {
        const serviceLabel = service ? `Service interest: ${service}\n\n` : "";
        await ctx.runMutation(api.notes.create, {
          contactId,
          body: `${serviceLabel}${message}`,
        });
      }

      // Send email notification
      const resendKey = process.env.RESEND_API_KEY;
      if (resendKey) {
        const serviceMap: Record<string, string> = {
          adr: "Alternative Dispute Resolution",
          retreats: "Holistic Retreats",
          circles: "Restorative Circles",
          wenden: "Wendon Project (Community)",
          sound: "Sound Therapy",
          unsure: "Not sure yet",
        };
        const serviceLabel = serviceMap[service] ?? service ?? "Not specified";

        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${resendKey}`,
          },
          body: JSON.stringify({
            from: "Sunset Resolutions <onboarding@resend.dev>",
            to: "sunsetresolute@gmail.com",
            subject: `New enquiry from ${name}`,
            html: `
              <h2>New enquiry from your website</h2>
              <table style="font-family:sans-serif;font-size:15px;line-height:1.6;border-collapse:collapse;width:100%">
                <tr><td style="padding:6px 12px;font-weight:600;width:140px">Name</td><td style="padding:6px 12px">${name}</td></tr>
                <tr style="background:#f9f9f9"><td style="padding:6px 12px;font-weight:600">Email</td><td style="padding:6px 12px"><a href="mailto:${email}">${email}</a></td></tr>
                ${org ? `<tr><td style="padding:6px 12px;font-weight:600">Organisation</td><td style="padding:6px 12px">${org}</td></tr>` : ""}
                <tr style="background:#f9f9f9"><td style="padding:6px 12px;font-weight:600">Service</td><td style="padding:6px 12px">${serviceLabel}</td></tr>
                <tr><td style="padding:6px 12px;font-weight:600;vertical-align:top">Message</td><td style="padding:6px 12px;white-space:pre-wrap">${message}</td></tr>
              </table>
              <p style="font-family:sans-serif;font-size:13px;color:#888;margin-top:24px">This contact has been saved to your Rolodex automatically.</p>
            `,
          }),
        });
      }

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    } catch {
      return new Response(JSON.stringify({ error: "Something went wrong." }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }
  }),
});

export default http;
