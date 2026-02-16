import { NextRequest, NextResponse } from "next/server";
import { sendMail } from "@/utils/mail";
import { requireAuth } from "@/utils/supabase/auth-check";
import { rateLimit, getClientIp } from "@/utils/rate-limit";

// 메일 발송: 분당 5회 제한
const MAIL_RATE_LIMIT = { limit: 5, windowMs: 60_000 };

export async function POST(request: NextRequest) {
  const auth = await requireAuth();
  if (!auth.authenticated) return auth.response;

  // Rate limiting
  const ip = getClientIp(request);
  const rl = rateLimit(`mail:${ip}`, MAIL_RATE_LIMIT);
  if (!rl.success) {
    return NextResponse.json(
      { success: false, error: "요청이 너무 많습니다. 잠시 후 다시 시도해주세요." },
      { status: 429, headers: { "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } }
    );
  }

  try {
    const { to, subject, text, html, replyTo } = await request.json();
    if (!to || !subject) {
      return NextResponse.json({ success: false, error: "받는 사람과 제목은 필수입니다" }, { status: 400 });
    }
    if (!text && !html) {
      return NextResponse.json({ success: false, error: "본문 내용이 필요합니다" }, { status: 400 });
    }

    // 이메일 헤더 인젝션 방지
    const sanitize = (s: string) => s.replace(/[\r\n]/g, "");
    const safeTo = sanitize(to);
    const safeSubject = sanitize(subject);
    const safeReplyTo = replyTo ? sanitize(replyTo) : undefined;

    const result = await sendMail({ to: safeTo, subject: safeSubject, text, html, replyTo: safeReplyTo });
    if (result.success) {
      return NextResponse.json({ success: true, messageId: result.messageId });
    } else {
      return NextResponse.json({ success: false, error: "메일 발송 실패" }, { status: 500 });
    }
  } catch (error) {
    console.error("메일 발송 실패:", error);
    return NextResponse.json({ success: false, error: "메일 발송 실패" }, { status: 500 });
  }
}
