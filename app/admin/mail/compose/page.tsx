"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { IconArrowLeft, IconSend } from "@tabler/icons-react";

function ComposeForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 답장 모드
    const replyTo = searchParams.get("to");
    const replySubject = searchParams.get("subject");

    if (replyTo) setTo(replyTo);
    if (replySubject) {
      setSubject(
        replySubject.startsWith("Re:") ? replySubject : `Re: ${replySubject}`
      );
    }
  }, [searchParams]);

  const handleSend = async () => {
    if (!to.trim()) {
      setError("받는 사람을 입력해주세요");
      return;
    }
    if (!subject.trim()) {
      setError("제목을 입력해주세요");
      return;
    }
    if (!body.trim()) {
      setError("본문을 입력해주세요");
      return;
    }

    setSending(true);
    setError(null);

    try {
      const res = await fetch("/api/mail/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: to.trim(),
          subject: subject.trim(),
          text: body,
          html: `<div style="white-space: pre-wrap;">${body.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</div>`,
        }),
      });

      const data = await res.json();

      if (data.success) {
        alert("메일이 발송되었습니다!");
        router.push("/admin/mail");
      } else {
        setError(data.error || "발송 실패");
      }
    } catch {
      setError("서버 연결 실패");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="admin2-container">
      {/* 헤더 */}
      <header className="admin2-header">
        <button
          className="admin2-btn admin2-btn-ghost"
          onClick={() => router.push("/admin/mail")}
        >
          <IconArrowLeft size={18} />
          취소
        </button>
        <button
          className="admin2-btn admin2-btn-primary"
          onClick={handleSend}
          disabled={sending}
        >
          <IconSend size={18} />
          {sending ? "발송 중..." : "보내기"}
        </button>
      </header>

      {/* 에러 메시지 */}
      {error && <div className="admin2-alert admin2-alert-error">{error}</div>}

      {/* 작성 폼 */}
      <div className="admin2-panel compose-form">
        <div className="form-row">
          <label>받는 사람</label>
          <input
            type="email"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            placeholder="email@example.com"
            className="admin2-input"
          />
        </div>
        <div className="form-row">
          <label>제목</label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="메일 제목"
            className="admin2-input"
          />
        </div>
        <div className="form-row form-row-body">
          <label>본문</label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="메일 내용을 입력하세요..."
            className="admin2-textarea"
          />
        </div>
      </div>

      <style jsx>{`
        .admin2-container {
          padding: 24px;
          max-width: 800px;
          margin: 0 auto;
        }
        .admin2-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }
        .admin2-panel {
          background: var(--admin2-bg-card, #fff);
          border-radius: 12px;
          border: 1px solid var(--admin2-border, #e5e7eb);
          overflow: hidden;
        }
        .compose-form {
          padding: 24px;
        }
        .form-row {
          margin-bottom: 16px;
        }
        .form-row label {
          display: block;
          font-size: 13px;
          font-weight: 500;
          color: var(--admin2-text-muted, #6b7280);
          margin-bottom: 6px;
        }
        .admin2-input {
          width: 100%;
          padding: 10px 14px;
          font-size: 14px;
          border: 1px solid var(--admin2-border, #e5e7eb);
          border-radius: 8px;
          background: var(--admin2-bg-card, #fff);
          transition: border-color 0.15s;
        }
        .admin2-input:focus {
          outline: none;
          border-color: var(--admin2-primary, #3b82f6);
        }
        .form-row-body {
          flex: 1;
          display: flex;
          flex-direction: column;
        }
        .admin2-textarea {
          flex: 1;
          min-height: 300px;
          width: 100%;
          padding: 14px;
          font-size: 14px;
          font-family: inherit;
          line-height: 1.6;
          border: 1px solid var(--admin2-border, #e5e7eb);
          border-radius: 8px;
          background: var(--admin2-bg-card, #fff);
          resize: vertical;
          transition: border-color 0.15s;
        }
        .admin2-textarea:focus {
          outline: none;
          border-color: var(--admin2-primary, #3b82f6);
        }
        .admin2-alert {
          padding: 12px 16px;
          border-radius: 8px;
          margin-bottom: 16px;
          font-size: 14px;
        }
        .admin2-alert-error {
          background: #fef2f2;
          color: #dc2626;
          border: 1px solid #fecaca;
        }
      `}</style>
    </div>
  );
}

export default function ComposePage() {
  return (
    <Suspense
      fallback={
        <div style={{ padding: 24, textAlign: "center" }}>로딩 중...</div>
      }
    >
      <ComposeForm />
    </Suspense>
  );
}
