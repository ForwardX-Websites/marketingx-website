/**
 * Cloudflare Pages Function — Contactformulier
 *
 * Verwerkt formulier-submissies:
 * 1. Honeypot check (spam)
 * 2. reCAPTCHA v3 verificatie
 * 3. Email versturen via Resend
 *
 * Environment variables (instellen in Cloudflare dashboard):
 * - RESEND_API_KEY: je Resend API key
 * - RECIPIENT_EMAIL: email waar formulieren naartoe gaan
 * - RECAPTCHA_SECRET_KEY: reCAPTCHA v3 secret key
 */

export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const formData = await request.formData();

    // 1. Honeypot check — als dit veld gevuld is, is het een bot
    const honeypot = formData.get("website");
    if (honeypot) {
      // Doe alsof het gelukt is (geeft bot geen feedback)
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 2. Formulier data ophalen
    const name = formData.get("name")?.trim();
    const email = formData.get("email")?.trim();
    const phone = formData.get("phone")?.trim() || "Niet opgegeven";
    const message = formData.get("message")?.trim();
    const recaptchaToken = formData.get("recaptcha_token");

    // Validatie
    if (!name || !email || !message) {
      return new Response(
        JSON.stringify({ success: false, error: "Vul alle verplichte velden in." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // 3. reCAPTCHA v3 verificatie
    if (env.RECAPTCHA_SECRET_KEY && recaptchaToken) {
      const recaptchaResponse = await fetch(
        "https://www.google.com/recaptcha/api/siteverify",
        {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: `secret=${env.RECAPTCHA_SECRET_KEY}&response=${recaptchaToken}`,
        }
      );

      const recaptchaResult = await recaptchaResponse.json();

      if (!recaptchaResult.success || recaptchaResult.score < 0.5) {
        return new Response(
          JSON.stringify({ success: false, error: "Verificatie mislukt. Probeer het opnieuw." }),
          { status: 403, headers: { "Content-Type": "application/json" } }
        );
      }
    }

    // 4. Email versturen via Resend
    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Website Formulier <formulier@resend.dev>",
        to: [env.RECIPIENT_EMAIL],
        subject: `Nieuw contactformulier: ${name}`,
        reply_to: email,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #1a1a2e; border-bottom: 2px solid #e94560; padding-bottom: 10px;">
              Nieuw bericht via contactformulier
            </h2>
            <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #495057; width: 120px;">Naam</td>
                <td style="padding: 8px 0;">${escapeHtml(name)}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #495057;">E-mail</td>
                <td style="padding: 8px 0;"><a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #495057;">Telefoon</td>
                <td style="padding: 8px 0;">${escapeHtml(phone)}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #495057; vertical-align: top;">Bericht</td>
                <td style="padding: 8px 0; white-space: pre-wrap;">${escapeHtml(message)}</td>
              </tr>
            </table>
            <p style="margin-top: 30px; font-size: 12px; color: #adb5bd;">
              Verzonden via het contactformulier op de website.
            </p>
          </div>
        `,
      }),
    });

    if (!resendResponse.ok) {
      const error = await resendResponse.text();
      console.error("Resend error:", error);
      return new Response(
        JSON.stringify({ success: false, error: "Er ging iets mis bij het versturen. Probeer het later opnieuw." }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, message: "Bedankt! Uw bericht is verstuurd." }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );

  } catch (err) {
    console.error("Form handler error:", err);
    return new Response(
      JSON.stringify({ success: false, error: "Er ging iets mis. Probeer het later opnieuw." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

// HTML escaping om XSS te voorkomen
function escapeHtml(text) {
  const map = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}
