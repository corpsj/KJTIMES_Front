// 메일 설정 (Zoho Mail)

function getMailCredentials() {
  const user = process.env.MAIL_USER;
  const pass = process.env.MAIL_PASSWORD;
  if (!user || !pass) {
    throw new Error("MAIL_USER 및 MAIL_PASSWORD 환경변수가 설정되지 않았습니다.");
  }
  return { user, pass };
}

export const mailConfig = {
  imap: {
    host: "imappro.zoho.com",
    port: 993,
    secure: true,
    get auth() {
      return getMailCredentials();
    },
  },
  smtp: {
    host: "smtppro.zoho.com",
    port: 465,
    secure: true,
    get auth() {
      return getMailCredentials();
    },
  },
};
