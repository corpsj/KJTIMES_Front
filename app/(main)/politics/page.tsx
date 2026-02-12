import { CategoryPageTemplate } from "@/components/layout/CategoryPageTemplate";
import { fetchCategoryArticles } from "@/lib/api/articles";
import { LINKS } from "@/constants/navigation";
import type { Metadata } from "next";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "정치 - 광전타임즈",
  description: "대한민국 정치 뉴스와 정책 분석을 제공하는 광전타임즈 정치 섹션입니다.",
  openGraph: {
    title: "정치 - 광전타임즈",
    description: "대한민국 정치 뉴스와 정책 분석",
    url: "https://kjtimes.co.kr/politics",
  },
};

const RELATED_CATEGORIES = [
  { label: "경제", href: "/economy" },
  { label: "사회", href: "/society" },
  { label: "오피니언", href: "/opinion" },
];

export default async function Politics() {
  const { data: articles } = await fetchCategoryArticles("politics", 50);
  const allArticles = articles || [];
  
  const popularArticles = [...allArticles]
    .sort((a, b) => (b.views || 0) - (a.views || 0))
    .slice(0, 5);

  return (
    <CategoryPageTemplate
      title="정치"
      categorySlug="politics"
      articles={allArticles}
      description="대한민국 정치 뉴스와 정책 분석"
      relatedCategories={RELATED_CATEGORIES}
      popularArticles={popularArticles}
    />
  );
}
