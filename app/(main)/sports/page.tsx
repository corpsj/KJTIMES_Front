import { CategoryPageTemplate } from "@/components/layout/CategoryPageTemplate";
import { fetchCategoryArticles } from "@/lib/api/articles";

export const revalidate = 60;

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
