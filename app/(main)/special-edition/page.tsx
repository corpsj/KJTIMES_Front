import { CategoryPageTemplate } from "@/components/layout/CategoryPageTemplate";
import { fetchCategoryArticles } from "@/lib/api/articles";

export const revalidate = 60;

export default async function SpecialEditionPage() {
    const { data } = await fetchCategoryArticles("special-edition", 30, true);

    return <CategoryPageTemplate title="창간특별호" articles={data || []} />;
}
