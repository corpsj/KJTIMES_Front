import axios from "axios";

const TOKEN = "sbp_7055e5f3200252e0b5c53a8c07838c2b3dc921a3";
const PROJECT_REF = "ptmrnnionqtfhtgcznxt";

const SQL = `
alter table press_releases 
add column if not exists generated_title text,
add column if not exists generated_content text,
add column if not exists summary text,
add column if not exists category text,
add column if not exists processed_at timestamp with time zone;
`;

async function runSql() {
  try {
    const response = await axios.post(
      `https://api.supabase.com/v1/projects/${PROJECT_REF}/sql`,
      { query: SQL },
      {
        headers: {
          Authorization: `Bearer ${TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log("SQL Execution Result:", response.data);
  } catch (error: any) {
    console.error("Failed to run SQL:", error.response?.data || error.message);
  }
}

runSql();
