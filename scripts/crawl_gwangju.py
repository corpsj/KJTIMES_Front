import requests
from bs4 import BeautifulSoup
import json
import re

# 광주광역시청 보도자료 URL
LIST_URL = "https://www.gwangju.go.kr/boardList.do?pageId=www789&boardId=BD_0000000027"
DETAIL_URL_BASE = "https://www.gwangju.go.kr/boardView.do?pageId=www789&boardId=BD_0000000027&seq="

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}

def crawl_gwangju():
    print("Fetching list...")
    try:
        res = requests.get(LIST_URL, headers=HEADERS)
        res.raise_for_status()
    except Exception as e:
        print(f"Failed to fetch list: {e}")
        return

    soup = BeautifulSoup(res.text, "html.parser")
    
    # 목록 테이블 파싱 (구조 추정: table.board_list tbody tr)
    rows = soup.select("table.board_list tbody tr")
    if not rows:
        # 혹시 클래스명이 다를 경우를 대비해 일반적인 table row 선택
        rows = soup.select("table tbody tr")

    results = []

    print(f"Found {len(rows)} rows. Processing top 5...")

    for i, row in enumerate(rows[:5]):
        try:
            # 제목 셀 찾기 (보통 두 번째나 세 번째 td, class='subject'일 수도 있음)
            subject_td = row.select_one(".subject")
            if not subject_td:
                # 제목이 있는 td 찾기 (a 태그가 있는 곳)
                tds = row.select("td")
                for td in tds:
                    if td.find("a"):
                        subject_td = td
                        break
            
            if not subject_td:
                continue

            link = subject_td.find("a")
            title = link.get_text(strip=True)
            href = link.get("href")
            
            # href에서 seq 추출 (예: ?...&seq=12345...)
            seq_match = re.search(r'seq=(\d+)', href)
            if not seq_match:
                continue
            seq = seq_match.group(1)
            
            # 날짜 (보통 마지막이나 그 앞 td)
            date_td = row.select("td")[-2] # 조회수 앞이 날짜인 경우가 많음
            date = date_td.get_text(strip=True)

            print(f"[{i+1}] Fetching detail for: {title} ({date})")
            
            # 상세 페이지 크롤링
            detail_url = f"{DETAIL_URL_BASE}{seq}"
            detail_res = requests.get(detail_url, headers=HEADERS)
            detail_soup = BeautifulSoup(detail_res.text, "html.parser")

            # 본문 추출 (일반적인 보도자료 본문 클래스: board_view_con, view_cont 등)
            content_div = detail_soup.select_one(".board_view_con") or detail_soup.select_one(".view_cont")
            
            content_html = ""
            content_text = ""
            images = []

            if content_div:
                # 불필요한 태그 제거 (script, style)
                for script in content_div(["script", "style"]):
                    script.decompose()
                
                content_html = str(content_div)
                content_text = content_div.get_text("\n", strip=True)

                # 이미지 링크 추출
                for img in content_div.select("img"):
                    src = img.get("src")
                    if src:
                        if not src.startswith("http"):
                            src = "https://www.gwangju.go.kr" + src
                        images.append(src)

            # 결과 저장
            results.append({
                "title": title,
                "date": date,
                "seq": seq,
                "link": detail_url,
                "images": images,
                "content_preview": content_text[:100] + "..."
            })

        except Exception as e:
            print(f"Error processing row {i}: {e}")
            continue

    # 결과 출력
    print(json.dumps(results, indent=2, ensure_ascii=False))

if __name__ == "__main__":
    crawl_gwangju()
