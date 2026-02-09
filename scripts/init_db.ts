import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

// 주신 정보로 직접 설정
const SUPABASE_URL = "https://ptmrnnionqtfhtgcznxt.supabase.co";
const SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0bXJubmlvbnF0Zmh0Z2N6bnh0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDE4NzcyMSwiZXhwIjoyMDg1NzYzNzIxfQ.deqnY7nbLGLp0m7A2eN1z-5UVen7OsRdNOE7UvLz4PI";

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function initDb() {
  console.log("Initializing database...");

  // SQL 실행 (테이블 생성)
  // rpc()를 사용하거나, rest API로 직접 생성해야 하는데,
  // service_role 키로는 pg_net 등 확장기능이 없으면 SQL 실행이 어려울 수 있음.
  // 다행히 supabase-js의 rpc로 SQL을 실행할 수 있는 함수가 있다면 좋은데, 기본적으론 없음.
  
  // 하지만 Rest API로 테이블 생성은 불가.
  // 대신 'Insert'를 시도해보고 테이블 없으면 에러남.
  
  // 가장 확실한 방법: SQL Editor에서 실행해야 하지만, 
  // 여기서는 '이미 테이블이 있다고 가정'하고 데이터 넣는 테스트를 먼저 해보거나,
  // 또는 DDL을 실행할 수 있는 방법(pg library + connection string)을 써야 함.
  
  // 아, Supabase 대시보드 접근 권한이 있다면 브라우저로 하는 게 맞습니다.
  // 하지만 성주님이 "내 컴퓨터의 모든 권한"을 주셨으니, 
  // 여기서는 일단 크롤러 코드에 DB 저장 로직을 넣고 실행해 봅니다.
  // (테이블이 없으면 에러가 날 테니 그때 대처하겠습니다.)
  
  console.log("Checking connection...");
  const { data, error } = await supabase.from('press_releases').select('*').limit(1);
  
  if (error) {
    console.error("Error connecting to table 'press_releases':", error.message);
    if (error.code === '42P01') { // undefined_table
        console.log("Table does not exist. Please create it in Supabase Dashboard SQL Editor:");
        console.log(`
create table press_releases (
  id uuid default gen_random_uuid() primary key,
  origin_id text unique not null,
  source text not null,
  title text not null,
  content text,
  link text,
  images text[],
  published_at timestamp with time zone,
  status text default 'collected',
  created_at timestamp with time zone default now()
);
        `);
    }
  } else {
    console.log("Table 'press_releases' exists. Ready to go!");
  }
}

initDb();
