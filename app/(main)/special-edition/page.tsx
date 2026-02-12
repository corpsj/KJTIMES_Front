import { CategoryPageTemplate } from "@/components/layout/CategoryPageTemplate";
import { fetchCategoryArticles } from "@/lib/api/articles";

export const revalidate = 60;

export default async function SpecialEditionPage() {
  const { data: articles } = await fetchCategoryArticles("special-edition", 50, true);
  const allArticles = articles || [];
  
  const popularArticles = [...allArticles]
    .sort((a, b) => (b.views || 0) - (a.views || 0))
    .slice(0, 5);

  return (
    <CategoryPageTemplate
      title="창간특별호"
      categorySlug="special-edition"
      articles={allArticles}
      description="광전타임즈 창간 특별 기획 기사"
      popularArticles={popularArticles}
    />
  );
}
