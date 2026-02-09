import nodemailer from "nodemailer";
import { mailConfig } from "./config";

export interface SendMailOptions {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  replyTo?: string;
}

// SMTP 트랜스포터 생성
function createTransporter() {
  return nodemailer.createTransport({
    host: mailConfig.smtp.host,
    port: mailConfig.smtp.port,
    secure: mailConfig.smtp.secure,
    auth: mailConfig.smtp.auth,
  });
}

// 메일 발송
export async function sendMail(options: SendMailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const transporter = createTransporter();

  try {
    const info = await transporter.sendMail({
      from: `"광전타임즈" <${mailConfig.smtp.auth.user}>`,
      to: Array.isArray(options.to) ? options.to.join(", ") : options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
      replyTo: options.replyTo,
    });

    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error) {
    console.error("메일 발송 실패:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "알 수 없는 오류",
    };
  }
}

// 답장 발송
export async function replyMail(
  originalFrom: string,
  originalSubject: string,
  options: Omit<SendMailOptions, "to" | "subject">
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const subject = originalSubject.startsWith("Re:") 
    ? originalSubject 
    : `Re: ${originalSubject}`;

  return sendMail({
    to: originalFrom,
    subject,
    ...options,
  });
}
