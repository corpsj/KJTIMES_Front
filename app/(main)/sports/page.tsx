import { CategoryPageTemplate } from "@/components/layout/CategoryPageTemplate";
import { fetchCategoryArticles } from "@/utils/articles";

export const revalidate = 60;

export default async function Sports() {
    const articles = await fetchCategoryArticles("sports");

    return <CategoryPageTemplate title="스포츠" articles={articles} />;
}
