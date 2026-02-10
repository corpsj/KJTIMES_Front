import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

/**
 * Verify the current user's Supabase auth session from cookies.
 * Returns the user if authenticated, or a 401 NextResponse if not.
 */
export async function requireAuth(): Promise<
  | { authenticated: true; userId: string }
  | { authenticated: false; response: NextResponse }
> {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key",
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch {
            // API route에서 쿠키 설정 불가할 수 있음
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: "", ...options });
          } catch {
            // API route에서 쿠키 설정 불가할 수 있음
          }
        },
      },
    }
  );

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return {
      authenticated: false,
      response: NextResponse.json(
        { success: false, error: "인증이 필요합니다" },
        { status: 401 }
      ),
    };
  }

  return { authenticated: true, userId: user.id };
}
