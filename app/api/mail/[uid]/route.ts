import { NextRequest, NextResponse } from "next/server";
import { fetchMessage } from "@/utils/mail";
import { requireAuth } from "@/utils/supabase/auth-check";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ uid: string }> }
) {
  const auth = await requireAuth();
  if (!auth.authenticated) return auth.response;

  try {
    const { uid } = await params;
    const uidNum = parseInt(uid);

    if (isNaN(uidNum)) {
      return NextResponse.json(
        { success: false, error: "잘못된 메일 ID" },
        { status: 400 }
      );
    }

    const message = await fetchMessage(uidNum);

    if (!message) {
      return NextResponse.json(
        { success: false, error: "메일을 찾을 수 없습니다" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message,
    });
  } catch (error) {
    console.error("메일 상세 조회 실패:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "메일 조회 실패",
      },
      { status: 500 }
    );
  }
}
