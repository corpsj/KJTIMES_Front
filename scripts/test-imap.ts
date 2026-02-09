import { ImapFlow } from "imapflow";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const user = process.env.MAIL_USER || "";
const pass = process.env.MAIL_PASSWORD || "";

async function testImap() {
  const client = new ImapFlow({
    host: "imappro.zoho.com",
    port: 993,
    secure: true,
    auth: {
      user: user,
      pass: pass,
    },
    logger: false,
  });

  console.log("Connecting to IMAP...");
  try {
    await client.connect();
    console.log("IMAP Connected successfully!");
    await client.logout();
  } catch (error) {
    console.error("IMAP Connection failed:", error);
  }
}

testImap();
