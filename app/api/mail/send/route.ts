import { NextRequest, NextResponse } from "next/server";
import { sendMail } from "@/utils/mail";

export async function POST(request: NextRequest) {
  try {
    const { to, subject, text, html, replyTo } = await request.json();
    if (!to || !subject) {
      return NextResponse.json({ success: false, error: "받는 사람과 제목은 필수입니다" }, { status: 400 });
    }
    if (!text && !html) {
      return NextResponse.json({ success: false, error: "본문 내용이 필요합니다" }, { status: 400 });
    }
    const result = await sendMail({ to, subject, text, html, replyTo });
    if (result.success) {
      return NextResponse.json({ success: true, messageId: result.messageId });
    } else {
      return NextResponse.json({ success: false, error: result.error }, { status: 500 });
    }
  } catch (error) {
    console.error("메일 발송 실패:", error);
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : "메일 발송 실패" }, { status: 500 });
  }
}
