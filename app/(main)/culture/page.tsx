import { CategoryPageTemplate } from "@/components/layout/CategoryPageTemplate";
import { fetchCategoryArticles } from "@/lib/api/articles";

export const revalidate = 60;

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
