import * as cheerio from "cheerio";
import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

// Supabase 설정 (bycmqxndlyiocnnsecxb)
const SUPABASE_URL = process.env.SUPABASE_URL || "https://bycmqxndlyiocnnsecxb.supabase.co";
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ5Y21xeG5kbHlpb2NubnNlY3hiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDY1Nzk5OCwiZXhwIjoyMDg2MjMzOTk4fQ.qOr1RWbdJCfPE8c29O4hKPkFtNuOmyuVoI0oU_9LSIc";

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false
  }
});

// 광주광역시청 보도자료 URL
const LIST_URL = "https://www.gwangju.go.kr/boardList.do?pageId=www789&boardId=BD_0000000027";
const DETAIL_URL_BASE = "https://www.gwangju.go.kr/boardView.do?pageId=www789&boardId=BD_0000000027&seq=";

const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
};

async function fetchHtml(url: string) {
  try {
    const res = await fetch(url, { headers: HEADERS });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.text();
  } catch (error) {
    console.error(`Failed to fetch ${url}:`, error);
    return null;
  }
}

async function crawlGwangju() {
  console.log("Fetching list...");
  const listHtml = await fetchHtml(LIST_URL);
  
  if (!listHtml) return;

  const $ = cheerio.load(listHtml);
  
  // div.body_row 태그 확인 (반응형 게시판 구조)
  const $rows = $(".board_list_body .body_row");
  console.log(`Found ${$rows.length} rows. Processing top 5...`);

  // 상위 5개만 처리
  for (let i = 0; i < Math.min(5, $rows.length); i++) {
    const row = $rows[i];
    const $row = $(row);

    try {
      // 제목 셀 찾기 (.subject)
      const $subjectDiv = $row.find(".subject");
      if ($subjectDiv.length === 0) continue;

      const $link = $subjectDiv.find("a");
      const title = $link.text().trim();
      const href = $link.attr("href");

      // href에서 seq 추출
      const seqMatch = href?.match(/seq=(\d+)/);
      if (!seqMatch) continue;
      const seq = seqMatch[1];

      // 날짜 (.date)
      // span.blind 제거 후 텍스트 추출
      $row.find(".date .blind").remove();
      const dateStr = $row.find(".date").text().trim();

      console.log(`[${i + 1}] Fetching detail for: ${title} (${dateStr})`);

      // 상세 페이지 크롤링
      const detailUrl = `${DETAIL_URL_BASE}${seq}`;
      const detailHtml = await fetchHtml(detailUrl);
      
      if (!detailHtml) {
          console.error(`Failed to fetch detail page for seq ${seq}`);
          continue;
      }
      
      const $detail = cheerio.load(detailHtml);

      // 본문 추출
      let $contentDiv = $detail(".board_view_con");
      if ($contentDiv.length === 0) {
          $contentDiv = $detail(".view_cont");
      }

      let contentHtml = "";
      const images: string[] = [];

      if ($contentDiv.length > 0) {
        // 불필요한 태그 제거 (script, style)
        $contentDiv.find("script, style").remove();

        contentHtml = $contentDiv.html() || "";

        // 이미지 링크 추출
        $contentDiv.find("img").each((_, img) => {
          let src = $(img).attr("src");
          if (src) {
            if (!src.startsWith("http")) {
              src = "https://www.gwangju.go.kr" + src;
            }
            images.push(src);
          }
        });
      }

      // 결과 객체 생성
      const item = {
        origin_id: `GWANGJU_${seq}`,
        source: "광주광역시청",
        title: title,
        content: contentHtml, // 전체 HTML 저장
        link: detailUrl,
        images: images,
        published_at: new Date(dateStr).toISOString(), // 날짜 변환
        status: "collected",
      };

      console.log(`[${i + 1}] Saving to DB: ${title}`);

      // Supabase 저장 (Upsert)
      const { error } = await supabase
        .from("press_releases")
        .upsert(item, { onConflict: "origin_id" });

      if (error) {
        console.error(`Failed to save ${title}:`, error);
        console.error(`Error Details:`, JSON.stringify(error, null, 2));
      } else {
        console.log(`Saved successfully!`);
      }

      // 서버 부하 방지 (1초 대기)
      await new Promise(resolve => setTimeout(resolve, 1000));

    } catch (error) {
      console.error(`Error processing row ${i}:`, error);
    }
  }
}

crawlGwangju();
