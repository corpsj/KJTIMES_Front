import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

// KJTIMES Supabase Client (Service Role Key 필요)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co",
  process.env.SUPABASE_SERVICE_ROLE_KEY || "placeholder-key"
);

const API_SECRET = process.env.NEWS_RECEIVE_SECRET || "kjtimes-secret-key-1234";

export async function POST(request: Request) {
  // 1. 인증 확인
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${API_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { title, content, summary, category, images, author } = body;

    // 2. 유효성 검사
    if (!title || !content) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 3. DB 저장
    const { data, error } = await supabase
      .from("articles")
      .insert({
        title,
        content,
        summary,
        category,
        images,
        author: author || "AI Reporter",
        is_published: false, // 기본값: 초안 (검수 후 발행)
      })
      .select()
      .single();

    if (error) {
      console.error("DB Insert Error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, id: data.id });

  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
