import { CategoryPageTemplate } from "@/components/layout/CategoryPageTemplate";
import { fetchCategoryArticles } from "@/lib/api/articles";
import type { Metadata } from "next";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "사회 - 광전타임즈",
  description: "광주·전남 지역 사회 이슈와 생활 정보를 제공하는 광전타임즈 사회 섹션입니다.",
  openGraph: {
    title: "사회 - 광전타임즈",
    description: "광주·전남 지역 사회 이슈와 생활 정보",
    url: "https://kjtimes.co.kr/society",
  },
};

const RELATED_CATEGORIES = [
  { label: "정치", href: "/politics" },
  { label: "경제", href: "/economy" },
  { label: "생활/문화", href: "/culture" },
];

export default async function Society() {
  const { data: articles } = await fetchCategoryArticles("society", 50);
  const allArticles = articles || [];
  
  const popularArticles = [...allArticles]
    .sort((a, b) => (b.views || 0) - (a.views || 0))
    .slice(0, 5);

  return (
    <CategoryPageTemplate
      title="사회"
      categorySlug="society"
      articles={allArticles}
      description="사회 이슈와 사건 사고"
      relatedCategories={RELATED_CATEGORIES}
      popularArticles={popularArticles}
    />
  );
}
