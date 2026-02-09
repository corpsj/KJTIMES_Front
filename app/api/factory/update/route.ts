import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();
  const supabase = createClient();

  const { error } = await supabase
    .from("press_releases")
    .update({
      generated_title: body.title,
      generated_content: body.content,
      summary: body.summary,
      category: body.category,
    })
    .eq("id", body.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
