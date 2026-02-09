"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import {
  IconArrowLeft,
  IconArrowBackUp,
  IconTrash,
  IconPaperclip,
  IconUser,
} from "@tabler/icons-react";

interface MailDetail {
  id: string;
  uid: number;
  subject: string;
  from: { name?: string; address?: string };
  to: { name?: string; address?: string }[];
  date: string;
  html?: string;
  text?: string;
  attachments: { filename: string; contentType: string; size: number }[];
}

export default function MailDetailPage({
  params,
}: {
  params: Promise<{ uid: string }>;
}) {
  const { uid } = use(params);
  const router = useRouter();
  const [message, setMessage] = useState<MailDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMail = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/mail/${uid}`);
        const data = await res.json();
        if (data.success) {
          setMessage(data.message);
        } else {
          setError(data.error || "메일을 불러올 수 없습니다");
        }
      } catch {
        setError("서버 연결 실패");
      } finally {
        setLoading(false);
      }
    };
    fetchMail();
  }, [uid]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (loading) {
    return (
      <div className="admin2-container">
        <div className="admin2-loading">
          <div className="admin2-spinner" />
          <p>메일 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error || !message) {
    return (
      <div className="admin2-container">
        <div className="admin2-error">
          <p>{error || "메일을 찾을 수 없습니다"}</p>
          <button
            className="admin2-btn admin2-btn-ghost"
            onClick={() => router.push("/admin/mail")}
          >
            목록으로
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin2-container">
      {/* 헤더 */}
      <header className="admin2-header">
        <button
          className="admin2-btn admin2-btn-ghost"
          onClick={() => router.push("/admin/mail")}
        >
          <IconArrowLeft size={18} />
          목록으로
        </button>
        <div className="admin2-header-actions">
          <button
            className="admin2-btn admin2-btn-primary"
            onClick={() =>
              router.push(
                `/admin/mail/compose?reply=${uid}&to=${encodeURIComponent(message.from.address || "")}&subject=${encodeURIComponent(message.subject)}`
              )
            }
          >
            <IconArrowBackUp size={18} />
            답장
          </button>
          <button className="admin2-btn admin2-btn-danger">
            <IconTrash size={18} />
            삭제
          </button>
        </div>
      </header>

      {/* 메일 내용 */}
      <div className="admin2-panel mail-detail">
        <div className="mail-header">
          <h1 className="mail-subject">{message.subject}</h1>
          <div className="mail-meta">
            <div className="mail-sender">
              <div className="sender-avatar">
                <IconUser size={20} />
              </div>
              <div className="sender-info">
                <span className="sender-name">
                  {message.from.name || message.from.address}
                </span>
                {message.from.name && (
                  <span className="sender-email">&lt;{message.from.address}&gt;</span>
                )}
              </div>
            </div>
            <span className="mail-date">{formatDate(message.date)}</span>
          </div>
        </div>

        {/* 첨부파일 */}
        {message.attachments.length > 0 && (
          <div className="mail-attachments">
            <div className="attachments-header">
              <IconPaperclip size={16} />
              <span>첨부파일 {message.attachments.length}개</span>
            </div>
            <div className="attachments-list">
              {message.attachments.map((att, i) => (
                <div key={i} className="attachment-item">
                  <span className="attachment-name">{att.filename}</span>
                  <span className="attachment-size">
                    {formatFileSize(att.size)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 본문 */}
        <div className="mail-body">
          {message.html ? (
            <div
              className="mail-html"
              dangerouslySetInnerHTML={{ __html: message.html }}
            />
          ) : (
            <pre className="mail-text">{message.text}</pre>
          )}
        </div>
      </div>

      <style jsx>{`
        .admin2-container {
          padding: 24px;
          max-width: 900px;
          margin: 0 auto;
        }
        .admin2-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }
        .admin2-header-actions {
          display: flex;
          gap: 8px;
        }
        .admin2-panel {
          background: var(--admin2-bg-card, #fff);
          border-radius: 12px;
          border: 1px solid var(--admin2-border, #e5e7eb);
          overflow: hidden;
        }
        .mail-header {
          padding: 24px;
          border-bottom: 1px solid var(--admin2-border, #e5e7eb);
        }
        .mail-subject {
          font-size: 22px;
          font-weight: 600;
          margin: 0 0 16px 0;
          line-height: 1.4;
        }
        .mail-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .mail-sender {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .sender-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: var(--admin2-bg-hover, #f3f4f6);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--admin2-text-muted, #6b7280);
        }
        .sender-info {
          display: flex;
          flex-direction: column;
        }
        .sender-name {
          font-weight: 500;
        }
        .sender-email {
          font-size: 13px;
          color: var(--admin2-text-muted, #6b7280);
        }
        .mail-date {
          font-size: 13px;
          color: var(--admin2-text-muted, #6b7280);
        }
        .mail-attachments {
          padding: 16px 24px;
          background: var(--admin2-bg-hover, #f9fafb);
          border-bottom: 1px solid var(--admin2-border, #e5e7eb);
        }
        .attachments-header {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: var(--admin2-text-muted, #6b7280);
          margin-bottom: 8px;
        }
        .attachments-list {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .attachment-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          background: var(--admin2-bg-card, #fff);
          border: 1px solid var(--admin2-border, #e5e7eb);
          border-radius: 6px;
          font-size: 13px;
        }
        .attachment-size {
          color: var(--admin2-text-muted, #6b7280);
        }
        .mail-body {
          padding: 24px;
          min-height: 200px;
        }
        .mail-text {
          white-space: pre-wrap;
          font-family: inherit;
          margin: 0;
          line-height: 1.6;
        }
        .mail-html {
          line-height: 1.6;
        }
        .admin2-loading,
        .admin2-error {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 64px 24px;
          color: var(--admin2-text-muted, #6b7280);
        }
        .admin2-spinner {
          width: 24px;
          height: 24px;
          border: 2px solid var(--admin2-border, #e5e7eb);
          border-top-color: var(--admin2-primary, #3b82f6);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
