export { mailConfig } from "./config";
export { fetchInbox, fetchMessage } from "./imap";
export type { MailMessage, MailDetail } from "./imap";
export { sendMail, replyMail } from "./smtp";
export type { SendMailOptions } from "./smtp";
