import nodemailer from "nodemailer";

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (transporter) return transporter;

  const emailServer = process.env.EMAIL_SERVER;
  const emailFrom = process.env.EMAIL_FROM || "noreply@fridaypoolparty.com";

  if (!emailServer) {
    // Development mode - log to console instead of sending
    transporter = {
      sendMail: async (options: any) => {
        console.log("\n📧 [Email Mock] Would send email:");
        console.log("From:", emailFrom);
        console.log("To:", options.to);
        console.log("Subject:", options.subject);
        console.log("Body:", options.text || options.html);
        console.log("---\n");
        return { messageId: "mock-message-id" };
      },
    } as any;
    return transporter;
  }

  // Parse SMTP URL: smtp://user:pass@host:port
  const url = new URL(emailServer);
  const auth = {
    user: url.username,
    pass: url.password,
  };

  transporter = nodemailer.createTransport({
    host: url.hostname,
    port: parseInt(url.port) || 587,
    secure: url.protocol === "smtps:" || parseInt(url.port) === 465,
    auth,
  });

  return transporter;
}

export async function sendEmail({ to, subject, html, text }: EmailOptions) {
  const emailFrom = process.env.EMAIL_FROM || "noreply@fridaypoolparty.com";
  const transport = getTransporter();

  try {
    await transport.sendMail({
      from: emailFrom,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ""), // Strip HTML for text version
    });
  } catch (error) {
    console.error("Failed to send email:", error);
    throw error;
  }
}


