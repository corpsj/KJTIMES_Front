import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();
  const supabase = createClient();

  // 1. 상태 업데이트
  const { error } = await supabase
    .from("press_releases")
    .update({
      status: "published",
      processed_at: new Date().toISOString(),
    })
    .eq("id", body.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // 2. (TODO) 외부 API 전송 로직
  // await fetch('https://kjtimes.co.kr/api/news/receive', { ... })

  return NextResponse.json({ success: true });
}
