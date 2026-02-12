import { CategoryPageTemplate } from "@/components/layout/CategoryPageTemplate";
import { fetchCategoryArticles } from "@/lib/api/articles";
import type { Metadata } from "next";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "문화 - 광전타임즈",
  description: "광주·전남 지역 문화 예술 소식과 공연 정보를 제공하는 광전타임즈 문화 섹션입니다.",
  openGraph: {
    title: "문화 - 광전타임즈",
    description: "광주·전남 지역 문화 예술 소식과 공연 정보",
    url: "https://kjtimes.co.kr/culture",
  },
};

const RELATED_CATEGORIES = [
  { label: "사회", href: "/society" },
  { label: "스포츠", href: "/sports" },
  { label: "오피니언", href: "/opinion" },
];

export default async function Culture() {
  const { data: articles } = await fetchCategoryArticles("culture", 50);
  const allArticles = articles || [];
  
  const popularArticles = [...allArticles]
    .sort((a, b) => (b.views || 0) - (a.views || 0))
    .slice(0, 5);

  return (
    <CategoryPageTemplate
      title="생활/문화"
      categorySlug="culture"
      articles={allArticles}
      description="생활 정보와 문화 소식"
      relatedCategories={RELATED_CATEGORIES}
      popularArticles={popularArticles}
    />
  );
}
