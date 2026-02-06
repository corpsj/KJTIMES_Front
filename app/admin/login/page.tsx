"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import { Noto_Serif_KR } from "next/font/google";
import Image from "next/image";
import "../admin2.css";
import "./login.css";

const displayFont = Noto_Serif_KR({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--admin2-display",
});

export default function AdminLogin() {
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async () => {
    if (!id || !password) {
      setError("아이디와 비밀번호를 입력해주세요.");
      return;
    }

    setLoading(true);
    setError(null);

    const email = `${id}@kwangjeon.local`;

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      if (error.message.includes("Invalid login credentials")) {
        setError("아이디 또는 비밀번호가 잘못되었습니다.");
      } else {
        setError(error.message);
      }
      setLoading(false);
    } else {
      router.push("/admin");
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    handleLogin();
  };

  return (
    <div className={`admin2 admin2-shell admin2-auth ${displayFont.variable}`}>
      <div className="admin2-auth-grid">
        <section className="admin2-auth-intro">
          <div className="admin2-auth-brand">
            <div className="admin2-brand-mark" />
            <div>
              <div className="admin2-auth-title admin2-display">KJ TIMES CMS</div>
              <div className="admin2-auth-subtitle">Editorial Command Center</div>
            </div>
          </div>
          <p className="admin2-auth-lead">
            편집국의 모든 흐름을 통합 관리하는 엔터프라이즈 CMS.
            데스크 승인, 속보 발행, 디지털 확산까지 한 번에 제어합니다.
          </p>
          <div className="admin2-auth-metrics">
            <div className="admin2-auth-metric">
              <span className="admin2-auth-metric-label">연속 가동</span>
              <span className="admin2-auth-metric-value">99.99%</span>
            </div>
            <div className="admin2-auth-metric">
              <span className="admin2-auth-metric-label">실시간 발행</span>
              <span className="admin2-auth-metric-value">초당 48건</span>
            </div>
            <div className="admin2-auth-metric">
              <span className="admin2-auth-metric-label">보안 등급</span>
              <span className="admin2-auth-metric-value">Tier 1</span>
            </div>
          </div>
          <div className="admin2-auth-list">
            <div className="admin2-auth-list-item">
              <span className="admin2-tag admin2-tag--published">운영</span>
              <div>
                <div className="admin2-auth-list-title">승인 워크플로우</div>
                <div className="admin2-auth-list-meta">데스크 → 팀장 → 발행</div>
              </div>
            </div>
            <div className="admin2-auth-list-item">
              <span className="admin2-tag admin2-tag--scheduled">자동화</span>
              <div>
                <div className="admin2-auth-list-title">예약 발행 & 소셜 연동</div>
                <div className="admin2-auth-list-meta">채널별 포맷 자동 변환</div>
              </div>
            </div>
            <div className="admin2-auth-list-item">
              <span className="admin2-tag admin2-tag--alert">보안</span>
              <div>
                <div className="admin2-auth-list-title">보안 감사 로그</div>
                <div className="admin2-auth-list-meta">접속/수정 기록 24개월 보관</div>
              </div>
            </div>
          </div>
        </section>

        <section className="admin2-auth-panel">
          <div className="admin2-panel admin2-auth-card">
            <div className="admin2-auth-header">
              <Image
                src="/brand/KJ_Logo.png"
                alt="Kwangjeon Times Logo"
                className="admin2-auth-logo"
                width={180}
                height={60}
                priority
              />
              <div className="admin2-auth-heading">편집국 로그인</div>
              <p className="admin2-hero-sub">
                인증된 편집 권한으로만 접근할 수 있습니다.
              </p>
            </div>

            {error && (
              <div className="admin2-auth-alert" role="alert">
                {error}
              </div>
            )}

            <form className="admin2-auth-form" onSubmit={handleSubmit}>
              <label className="admin2-field">
                <span className="admin2-label">아이디</span>
                <input
                  className="admin2-input"
                  placeholder="admin"
                  value={id}
                  onChange={(event) => setId(event.currentTarget.value)}
                  autoComplete="username"
                  required
                />
              </label>
              <label className="admin2-field">
                <span className="admin2-label">비밀번호</span>
                <input
                  className="admin2-input"
                  placeholder="********"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.currentTarget.value)}
                  autoComplete="current-password"
                  required
                />
              </label>
              <button
                className="admin2-btn admin2-btn-ink admin2-auth-submit"
                type="submit"
                disabled={loading}
              >
                {loading ? "인증 중..." : "로그인"}
              </button>
            </form>

            <div className="admin2-auth-footer">
              <span>계정이 없으신가요?</span>
              <Link className="admin2-btn admin2-btn-ghost" href="/signup">
                회원가입
              </Link>
            </div>
            <div className="admin2-auth-secure">
              보안 접속: 모든 세션은 암호화되어 기록됩니다.
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
