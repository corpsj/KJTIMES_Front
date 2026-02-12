import { NextResponse } from "next/server";
import { createServiceClient } from "@/utils/supabase/server";
import { sanitizeHtmlServer } from "@/utils/sanitize";
import { NF_CATEGORY_MAP } from "@/constants/news-factory";

const WEBHOOK_SECRET = process.env.NEWS_RECEIVE_SECRET;

interface NfWebhookArticle {
  id: string;
  title: string;
  content: string;
  summary?: string;
  category?: string;
  source?: string;
  source_url?: string;
  images?: string[];
  published_at?: string;
  processed_at?: string;
}

interface NfWebhookPayload {
  subscription_id: string;
  subscription_name?: string;
  articles: NfWebhookArticle[];
  delivered_at: string;
}

export async function POST(request: Request) {
  if (!WEBHOOK_SECRET) {
    return NextResponse.json(
      { error: "NEWS_RECEIVE_SECRET 환경 변수가 설정되지 않았습니다." },
      { status: 503 }
    );
  }

  const webhookSecret = request.headers.get("x-webhook-secret");
  const authBearer = request.headers.get("authorization");
  const isAuthed =
    webhookSecret === WEBHOOK_SECRET ||
    authBearer === `Bearer ${WEBHOOK_SECRET}`;

  if (!isAuthed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as NfWebhookPayload;

    if (!Array.isArray(body.articles) || body.articles.length === 0) {
      return NextResponse.json(
        { error: "Missing or empty articles array" },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();
    const results: Array<{ nf_id: string; local_id?: string; error?: string }> = [];

    for (const art of body.articles) {
      if (!art.title || !art.content) {
        results.push({ nf_id: art.id, error: "Missing title or content" });
        continue;
      }

      const sanitized = sanitizeHtmlServer(art.content);
      const categorySlug = NF_CATEGORY_MAP[art.category || ""] || "society";
      const { data: categoryRow } = await supabase
        .from("categories")
        .select("id")
        .eq("slug", categorySlug)
        .single();

      const plainText = sanitized
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim();
      const excerpt = plainText.slice(0, 160);

      const { data, error } = await supabase
        .from("articles")
        .insert({
          title: art.title,
          content: sanitized,
          summary: art.summary || excerpt,
          excerpt,
          category_id: categoryRow?.id || null,
          status: "pending_review",
          updated_at: new Date().toISOString(),
        })
        .select("id")
        .single();

      if (error) {
        results.push({ nf_id: art.id, error: error.message });
      } else {
        results.push({ nf_id: art.id, local_id: data.id });
      }
    }

    const imported = results.filter((r) => r.local_id).length;
    const failed = results.filter((r) => r.error).length;

    return NextResponse.json({
      success: true,
      imported,
      failed,
      results,
    });
  } catch (err) {
    console.error("News Receive API Error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
