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
