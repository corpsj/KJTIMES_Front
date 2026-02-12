import { CategoryPageTemplate } from "@/components/layout/CategoryPageTemplate";
import { fetchCategoryArticles } from "@/lib/api/articles";

export const revalidate = 60;

const RELATED_CATEGORIES = [
  { label: "정치", href: "/politics" },
  { label: "경제", href: "/economy" },
  { label: "사회", href: "/society" },
];

export default async function Opinion() {
  const { data: articles } = await fetchCategoryArticles("opinion", 50);
  const allArticles = articles || [];
  
  const popularArticles = [...allArticles]
    .sort((a, b) => (b.views || 0) - (a.views || 0))
    .slice(0, 5);

  return (
    <CategoryPageTemplate
      title="오피니언"
      categorySlug="opinion"
      articles={allArticles}
      description="칼럼과 사설"
      relatedCategories={RELATED_CATEGORIES}
      popularArticles={popularArticles}
    />
  );
}
