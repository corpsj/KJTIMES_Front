import { CategoryPageTemplate } from "@/components/layout/CategoryPageTemplate";
import { fetchCategoryArticles } from "@/utils/articles";

export const revalidate = 60;

export default async function Opinion() {
    const articles = await fetchCategoryArticles("opinion");

    return <CategoryPageTemplate title="오피니언" articles={articles} />;
}
