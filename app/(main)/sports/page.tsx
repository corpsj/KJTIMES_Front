import { CategoryPageTemplate } from "@/components/layout/CategoryPageTemplate";
import { fetchCategoryArticles } from "@/lib/api/articles";
import type { Metadata } from "next";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "스포츠 - 광전타임즈",
  description: "광주·전남 지역 스포츠 뉴스와 경기 결과를 제공하는 광전타임즈 스포츠 섹션입니다.",
  openGraph: {
    title: "스포츠 - 광전타임즈",
    description: "광주·전남 지역 스포츠 뉴스와 경기 결과",
    url: "https://kjtimes.co.kr/sports",
  },
};

const RELATED_CATEGORIES = [
  { label: "생활/문화", href: "/culture" },
  { label: "사회", href: "/society" },
];

export default async function Sports() {
  const { data: articles } = await fetchCategoryArticles("sports", 50);
  const allArticles = articles || [];
  
  const popularArticles = [...allArticles]
    .sort((a, b) => (b.views || 0) - (a.views || 0))
    .slice(0, 5);

  return (
    <CategoryPageTemplate
      title="스포츠"
      categorySlug="sports"
      articles={allArticles}
      description="스포츠 뉴스와 경기 결과"
      relatedCategories={RELATED_CATEGORIES}
      popularArticles={popularArticles}
    />
  );
}
