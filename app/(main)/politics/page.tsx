import { CategoryPageTemplate } from "@/components/layout/CategoryPageTemplate";
import { fetchCategoryArticles } from "@/utils/articles";

export const revalidate = 60;

export default async function Politics() {
    const articles = await fetchCategoryArticles("politics");

    return <CategoryPageTemplate title="정치" articles={articles} />;
}
