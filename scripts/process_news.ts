import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

// Supabase 설정
const SUPABASE_URL = process.env.SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_KEY!;

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false }
});

// Ollama (Local) API 설정
const OPENCLAW_API_URL = "http://localhost:11434/v1/chat/completions";
const MODEL_NAME = "ingu627/exaone4.0:32b"; // 한국어 특화 모델

async function callAI(title: string, content: string) {
  const prompt = `
당신은 30년 경력의 베테랑 사회부 기자입니다. 아래 보도자료를 바탕으로 독자가 읽기 쉬운 뉴스 기사를 작성하세요.

**지침:**
1. **역피라미드 구성:** 가장 중요한 핵심 내용을 첫 문단에 배치하세요.
2. **객관적 어조:** "밝혔다", "전했다", "알려졌다" 등의 건조하고 명확한 문체를 사용하세요.
3. **헤드라인:** 클릭을 유도하되 낚시성이 없는, 핵심을 찌르는 제목을 3개 제안하세요.
4. **요약:** 기사 상단에 들어갈 3줄 요약을 작성하세요.
5. **카테고리 분류:** [행정, 복지, 문화, 경제, 안전, 기타] 중 하나를 선택하세요.
6. **HTML 포맷:** 본문은 <p>, <b> 태그 등을 사용하여 가독성 있게 작성하세요. (제목 제외)
7. **JSON 출력:** 반드시 JSON 형식으로만 응답하세요. 마크다운 코드블록이나 잡담은 포함하지 마세요.

**보도자료:**
제목: ${title}
내용:
${content}

**응답 형식 (JSON):**
{
  "title": "가장 추천하는 헤드라인 1개",
  "content": "<p>기사 본문 HTML...</p>",
  "summary": "3줄 요약 텍스트",
  "category": "카테고리"
}
`;

  try {
    const response = await fetch(OPENCLAW_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: MODEL_NAME,
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" } // JSON 응답 강제
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenClaw API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    // JSON 파싱 (가끔 마크다운 코드블록이 포함될 수 있음)
    const jsonStr = content.replace(/```json\n|\n```/g, "").trim();
    return JSON.parse(jsonStr);

  } catch (error) {
    console.error("AI Call Failed:", error);
    return null;
  }
}

async function processNews() {
  console.log("Fetching unprocessed news...");
  
  // 1. 처리 대기 중인 기사 조회 (전체)
  const { data: newsList, error } = await supabase
    .from("press_releases")
    .select("*")
    .eq("status", "collected")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("DB Select Error:", error);
    return;
  }

  if (!newsList || newsList.length === 0) {
    console.log("No news to process.");
    return;
  }

  console.log(`Found ${newsList.length} articles. Processing...`);

  for (const news of newsList) {
    console.log(`Processing: ${news.title} (${news.origin_id})`);

    // 2. AI 뉴스 생성
    const result = await callAI(news.title, news.content);
    
    if (!result) {
      console.error(`Failed to generate news for ${news.id}`);
      continue;
    }

    console.log(`AI Generated Title: ${result.title}`);

    // 3. DB 업데이트
    const { error: updateError } = await supabase
      .from("press_releases")
      .update({
        generated_title: result.title,
        generated_content: result.content,
        summary: result.summary,
        category: result.category,
        processed_at: new Date().toISOString(),
        status: "processed"
      })
      .eq("id", news.id);

    if (updateError) {
      console.error("DB Update Error:", updateError);
    } else {
      console.log("Successfully updated DB!");
    }
  }
}

processNews();
