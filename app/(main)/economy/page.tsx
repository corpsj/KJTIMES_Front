import { CategoryPageTemplate } from "@/components/layout/CategoryPageTemplate";
import { fetchCategoryArticles } from "@/lib/api/articles";
import type { Metadata } from "next";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "경제 - 광전타임즈",
  description: "광주·전남 지역 경제 뉴스와 산업 동향을 제공하는 광전타임즈 경제 섹션입니다.",
  openGraph: {
    title: "경제 - 광전타임즈",
    description: "광주·전남 지역 경제 뉴스와 산업 동향",
    url: "https://kjtimes.co.kr/economy",
  },
};

const RELATED_CATEGORIES = [
  { label: "정치", href: "/politics" },
  { label: "사회", href: "/society" },
  { label: "생활/문화", href: "/culture" },
];

export default async function Economy() {
  const { data: articles } = await fetchCategoryArticles("economy", 50);
  const allArticles = articles || [];
  
  const popularArticles = [...allArticles]
    .sort((a, b) => (b.views || 0) - (a.views || 0))
    .slice(0, 5);

  return (
    <CategoryPageTemplate
      title="경제"
      categorySlug="economy"
      articles={allArticles}
      description="경제 동향과 기업 뉴스"
      relatedCategories={RELATED_CATEGORIES}
      popularArticles={popularArticles}
    />
  );
}
