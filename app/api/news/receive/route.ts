import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

// KJTIMES Supabase Client (Service Role Key — RLS 우회)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co",
  process.env.SUPABASE_SERVICE_ROLE_KEY || "placeholder-key"
);

const API_SECRET = process.env.NEWS_RECEIVE_SECRET;

// 뉴스팩토리 카테고리 → KJTIMES 카테고리 슬러그 매핑
const CATEGORY_MAP: Record<string, string> = {
  행정: "society",
  복지: "society",
  문화: "culture",
  경제: "economy",
  안전: "society",
  기타: "society",
  정치: "politics",
  사회: "society",
  스포츠: "sports",
  오피니언: "opinion",
};

export async function POST(request: Request) {
  // 1. 인증 확인
  if (!API_SECRET) {
    console.error("NEWS_RECEIVE_SECRET is not configured");
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }

  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${API_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { title, content, summary, category, source, source_url } = body;

    // 2. 유효성 검사
    if (!title || !content) {
      return NextResponse.json(
        { error: "Missing required fields: title, content" },
        { status: 400 }
      );
    }

    // 3. 카테고리 슬러그 → category_id 조회
    const categorySlug = CATEGORY_MAP[category] || "society";
    const { data: categoryRow } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", categorySlug)
      .single();

    // 4. articles 테이블에 pending_review 상태로 저장
    const plainText = content
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    const excerpt = plainText.slice(0, 160);

    const { data, error } = await supabase
      .from("articles")
      .insert({
        title,
        content,
        summary: summary || excerpt,
        excerpt,
        category_id: categoryRow?.id || null,
        status: "pending_review",
        updated_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (error) {
      console.error("DB Insert Error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      id: data.id,
      status: "pending_review",
    });
  } catch (error) {
    console.error("News Receive API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
