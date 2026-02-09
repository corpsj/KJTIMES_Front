"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  IconMail,
  IconMailOpened,
  IconPaperclip,
  IconRefresh,
  IconPencil,
} from "@tabler/icons-react";

interface MailMessage {
  id: string;
  uid: number;
  subject: string;
  from: { name?: string; address?: string };
  date: string;
  seen: boolean;
  hasAttachments: boolean;
}

export default function MailPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<MailMessage[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMails = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/mail?limit=50&offset=0");
      const data = await res.json();
      if (data.success) {
        setMessages(data.messages);
        setTotal(data.total);
      } else {
        setError(data.error || "메일을 불러올 수 없습니다");
      }
    } catch {
      setError("서버 연결 실패");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMails();
  }, []);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    if (isToday) {
      return date.toLocaleTimeString("ko-KR", {
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    return date.toLocaleDateString("ko-KR", {
      month: "short",
      day: "numeric",
    });
  };

  const formatSender = (from: { name?: string; address?: string }) => {
    return from.name || from.address || "알 수 없음";
  };

  return (
    <div className="admin2-container">
      {/* 헤더 */}
      <header className="admin2-header">
        <div className="admin2-header-left">
          <h1>
            <IconMail size={24} />
            제보함
          </h1>
          <span className="admin2-badge">{total}개</span>
        </div>
        <div className="admin2-header-actions">
          <button
            className="admin2-btn admin2-btn-ghost"
            onClick={fetchMails}
            disabled={loading}
          >
            <IconRefresh size={18} className={loading ? "spin" : ""} />
            새로고침
          </button>
          <button
            className="admin2-btn admin2-btn-primary"
            onClick={() => router.push("/admin/mail/compose")}
          >
            <IconPencil size={18} />
            메일 쓰기
          </button>
        </div>
      </header>

      {/* 메일 목록 */}
      <div className="admin2-panel">
        {loading ? (
          <div className="admin2-loading">
            <div className="admin2-spinner" />
            <p>메일 불러오는 중...</p>
          </div>
        ) : error ? (
          <div className="admin2-error">
            <p>{error}</p>
            <button className="admin2-btn admin2-btn-ghost" onClick={fetchMails}>
              다시 시도
            </button>
          </div>
        ) : messages.length === 0 ? (
          <div className="admin2-empty">
            <IconMail size={48} stroke={1} />
            <p>받은 메일이 없습니다</p>
          </div>
        ) : (
          <table className="admin2-table">
            <thead>
              <tr>
                <th style={{ width: 40 }}></th>
                <th style={{ width: 200 }}>보낸 사람</th>
                <th>제목</th>
                <th style={{ width: 100 }}>날짜</th>
              </tr>
            </thead>
            <tbody>
              {messages.map((msg) => (
                <tr
                  key={msg.id}
                  className={`admin2-row-clickable ${!msg.seen ? "admin2-row-unread" : ""}`}
                  onClick={() => router.push(`/admin/mail/${msg.uid}`)}
                >
                  <td>
                    {msg.seen ? (
                      <IconMailOpened size={18} className="text-muted" />
                    ) : (
                      <IconMail size={18} className="text-primary" />
                    )}
                  </td>
                  <td className="admin2-cell-sender">
                    <span className={!msg.seen ? "font-bold" : ""}>
                      {formatSender(msg.from)}
                    </span>
                  </td>
                  <td className="admin2-cell-subject">
                    <span className={!msg.seen ? "font-bold" : ""}>
                      {msg.subject}
                    </span>
                    {msg.hasAttachments && (
                      <IconPaperclip size={14} className="ml-2 text-muted" />
                    )}
                  </td>
                  <td className="admin2-cell-date">{formatDate(msg.date)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <style jsx>{`
        .admin2-container {
          padding: 24px;
          max-width: 1200px;
          margin: 0 auto;
        }
        .admin2-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }
        .admin2-header-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .admin2-header-left h1 {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 24px;
          font-weight: 600;
          margin: 0;
        }
        .admin2-badge {
          background: var(--admin2-primary, #3b82f6);
          color: white;
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 12px;
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
        .admin2-table {
          width: 100%;
          border-collapse: collapse;
        }
        .admin2-table th {
          text-align: left;
          padding: 12px 16px;
          font-weight: 500;
          color: var(--admin2-text-muted, #6b7280);
          border-bottom: 1px solid var(--admin2-border, #e5e7eb);
          font-size: 13px;
        }
        .admin2-table td {
          padding: 12px 16px;
          border-bottom: 1px solid var(--admin2-border, #e5e7eb);
        }
        .admin2-row-clickable {
          cursor: pointer;
          transition: background 0.15s;
        }
        .admin2-row-clickable:hover {
          background: var(--admin2-bg-hover, #f9fafb);
        }
        .admin2-row-unread {
          background: var(--admin2-bg-unread, #eff6ff);
        }
        .admin2-row-unread:hover {
          background: var(--admin2-bg-unread-hover, #dbeafe);
        }
        .font-bold {
          font-weight: 600;
        }
        .text-muted {
          color: var(--admin2-text-muted, #6b7280);
        }
        .text-primary {
          color: var(--admin2-primary, #3b82f6);
        }
        .ml-2 {
          margin-left: 8px;
        }
        .admin2-loading,
        .admin2-empty,
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
        .spin {
          animation: spin 0.8s linear infinite;
        }
        .admin2-cell-date {
          color: var(--admin2-text-muted, #6b7280);
          font-size: 13px;
        }
      `}</style>
    </div>
  );
}
