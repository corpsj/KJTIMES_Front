import { NextRequest, NextResponse } from "next/server";
import { fetchInbox } from "@/utils/mail";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    const { messages, total } = await fetchInbox(limit, offset);

    return NextResponse.json({
      success: true,
      messages,
      total,
      limit,
      offset,
    });
  } catch (error) {
    console.error("메일 목록 조회 실패:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "메일 조회 실패" },
      { status: 500 }
    );
  }
}
