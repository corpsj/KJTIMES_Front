"use client";

import Link from "next/link";

export default function Admin2Write() {
  return (
    <div className="admin2-grid admin2-grid--single">
      <div className="admin2-panel">
        <div className="admin2-panel-title">작성 스튜디오</div>
        <div className="admin2-hero-title admin2-display">기사 작성 워크스페이스</div>
        <p className="admin2-hero-sub">
          본 화면은 새로운 CMS 레이아웃 시안입니다. 실제 기사 저장은 기존 에디터를 활용하세요.
        </p>
        <div className="admin2-filter-bar" style={{ marginTop: "16px" }}>
          <Link className="admin2-btn admin2-btn-accent" href="/admin/write">
            기존 에디터 열기
          </Link>
          <Link className="admin2-btn admin2-btn-ghost" href="/admin2/articles">
            기사 데스크로 이동
          </Link>
        </div>
      </div>

      <div className="admin2-panel" style={{ marginTop: "18px" }}>
        <div className="admin2-panel-title">레이아웃 시안</div>
        <div className="admin2-placeholder">
          <strong>좌측</strong> 작성 영역 · <strong>우측</strong> 메타데이터/배포 설정 패널 구성을
          가정한 UI 스케치입니다. 실제 입력 필드는 추후 스펙 확정 후 연결됩니다.
        </div>
      </div>
    </div>
  );
}
