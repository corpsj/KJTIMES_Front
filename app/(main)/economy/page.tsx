import { CategoryPageTemplate } from "@/components/layout/CategoryPageTemplate";
import { fetchCategoryArticles } from "@/utils/articles";

export const revalidate = 60;

export default async function Economy() {
    const articles = await fetchCategoryArticles("economy");

    return <CategoryPageTemplate title="경제" articles={articles} />;
}
