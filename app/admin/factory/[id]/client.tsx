"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function FactoryDetailClient({ news }: { news: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: news.generated_title || news.title,
    content: news.generated_content || "",
    summary: news.summary || "",
    category: news.category || "행정",
  });

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/factory/update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: news.id, ...formData }),
      });
      if (!res.ok) throw new Error("저장 실패");
      alert("저장되었습니다.");
      router.refresh();
    } catch (e) {
      alert(e);
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    if (!confirm("KJTIMES로 기사를 전송하시겠습니까?")) return;
    setLoading(true);
    try {
      // 실제 배포 API 호출 (KJTIMES 등)
      // 여기서는 데모로 상태만 'published'로 변경
      const res = await fetch(`/api/factory/publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: news.id, ...formData }),
      });
      if (!res.ok) throw new Error("배포 실패");
      alert("성공적으로 배포되었습니다!");
      router.push("/admin/factory");
    } catch (e) {
      alert(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* 왼쪽: 원본 */}
      <div className="w-1/2 p-6 overflow-y-auto border-r bg-white">
        <h2 className="text-lg font-bold mb-4 text-gray-500">📄 원본 보도자료</h2>
        <h1 className="text-xl font-bold mb-2">{news.title}</h1>
        <div className="text-sm text-gray-400 mb-6">{news.published_at} | {news.source}</div>
        <div 
          className="prose max-w-none text-sm text-gray-600"
          dangerouslySetInnerHTML={{ __html: news.content }} 
        />
      </div>

      {/* 오른쪽: AI 편집기 */}
      <div className="w-1/2 p-6 overflow-y-auto bg-gray-50">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-blue-600">🤖 AI 기사 편집</h2>
          <div className="space-x-2">
            <button 
              onClick={handleSave}
              disabled={loading}
              className="px-4 py-2 bg-white border rounded hover:bg-gray-50 text-sm">
              저장
            </button>
            <button 
              onClick={handlePublish}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-bold">
              {loading ? "전송 중..." : "🚀 KJTIMES 전송"}
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">헤드라인</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">요약 (3줄)</label>
            <textarea
              rows={3}
              value={formData.summary}
              onChange={(e) => setFormData({...formData, summary: e.target.value})}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">본문 (HTML)</label>
            <textarea
              rows={20}
              value={formData.content}
              onChange={(e) => setFormData({...formData, content: e.target.value})}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border font-mono text-sm"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
