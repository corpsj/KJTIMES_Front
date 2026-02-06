import { CategoryPageTemplate } from "@/components/layout/CategoryPageTemplate";
import { fetchCategoryArticles } from "@/utils/articles";

export const revalidate = 60;

export default async function Society() {
    const articles = await fetchCategoryArticles("society");

    return <CategoryPageTemplate title="사회" articles={articles} />;
}
