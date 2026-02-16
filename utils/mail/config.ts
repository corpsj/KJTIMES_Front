// 메일 설정 (Zoho Mail)
export const mailConfig = {
  imap: {
    host: "imappro.zoho.com",
    port: 993,
    secure: true,
    auth: {
      user: process.env.MAIL_USER || "jebo@kjtimes.co.kr",
      pass: process.env.MAIL_PASSWORD || "",
    },
  },
  smtp: {
    host: "smtppro.zoho.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.MAIL_USER || "jebo@kjtimes.co.kr",
      pass: process.env.MAIL_PASSWORD || "",
    },
  },
};
