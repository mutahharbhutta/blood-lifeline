import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface MatchNotificationRequest {
  donorEmail: string;
  donorName: string;
  patientName: string;
  bloodType: string;
  hospital: string;
  urgency: string;
  contactNumber?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { donorEmail, donorName, patientName, bloodType, hospital, urgency, contactNumber }: MatchNotificationRequest = await req.json();

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8f9fa; margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #dc2626, #b91c1c); color: white; padding: 30px; text-align: center; }
          .header h1 { margin: 0; font-size: 24px; }
          .content { padding: 30px; }
          .urgency-badge { display: inline-block; background: ${urgency === 'Emergency' ? '#dc2626' : '#f59e0b'}; color: white; padding: 6px 16px; border-radius: 20px; font-size: 14px; font-weight: 600; margin-bottom: 20px; }
          .info-card { background: #f8f9fa; border-radius: 12px; padding: 20px; margin: 20px 0; }
          .info-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e9ecef; }
          .info-row:last-child { border-bottom: none; }
          .info-label { color: #6b7280; font-size: 14px; }
          .info-value { color: #111827; font-weight: 600; }
          .blood-type { font-size: 32px; font-weight: bold; color: #dc2626; text-align: center; background: #fee2e2; padding: 20px; border-radius: 12px; margin: 20px 0; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #6b7280; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🩸 BloodLink Lahore</h1>
            <p>You've been matched with a blood request!</p>
          </div>
          <div class="content">
            <span class="urgency-badge">${urgency} Request</span>
            
            <p>Dear <strong>${donorName}</strong>,</p>
            
            <p>A patient needs your help! Your blood type matches a current request. Your donation could save a life.</p>
            
            <div class="blood-type">
              Blood Type Needed: ${bloodType}
            </div>
            
            <div class="info-card">
              <div class="info-row">
                <span class="info-label">Patient Name</span>
                <span class="info-value">${patientName}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Hospital</span>
                <span class="info-value">${hospital}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Urgency Level</span>
                <span class="info-value">${urgency}</span>
              </div>
              ${contactNumber ? `
              <div class="info-row">
                <span class="info-label">Contact Number</span>
                <span class="info-value">${contactNumber}</span>
              </div>
              ` : ''}
            </div>
            
            <p>Please contact the hospital or the provided number as soon as possible if you can donate.</p>
            
            <p style="color: #6b7280; font-size: 14px;">
              Thank you for being a hero. Your willingness to donate blood makes a real difference in people's lives.
            </p>
          </div>
          <div class="footer">
            <p>BloodLink Lahore - Connecting Donors, Saving Lives</p>
            <p>© 2024 BloodLink. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "BloodLink Lahore <onboarding@resend.dev>",
        to: [donorEmail],
        subject: `🩸 Urgent: Blood Donation Request Match - ${bloodType}`,
        html: emailHtml,
      }),
    });

    const data = await emailResponse.json();
    console.log("Match notification sent successfully:", data);

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending match notification:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
