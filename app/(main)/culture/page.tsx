import { CategoryPageTemplate } from "@/components/layout/CategoryPageTemplate";
import { fetchCategoryArticles } from "@/utils/articles";

export const revalidate = 60;

export default async function Culture() {
    const articles = await fetchCategoryArticles("culture");

    return <CategoryPageTemplate title="생활/문화" articles={articles} />;
}
