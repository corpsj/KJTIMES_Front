import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { getDeviceType } from "@/utils/device";
import { getSiteUrl } from "@/utils/site";
import { DesktopArticleDetail } from "@/components/desktop/DesktopArticleDetail";
import { MobileArticleDetail } from "@/components/mobile/MobileArticleDetail";
import { Article } from "@/types";

const PUBLISHER_NAME = "광전타임즈";

type ArticleDetail = Article & {
    content: string;
    seo_title?: string | null;
    seo_description?: string | null;
    keywords?: string | null;
};

function extractCategorySlug(article: ArticleDetail) {
    if (Array.isArray(article.categories)) {
        return article.categories[0]?.slug || null;
    }
    return article.categories?.slug || null;
}

async function fetchArticle(id: string, supabase?: Awaited<ReturnType<typeof createClient>>) {
    const client = supabase || (await createClient());
    const { data, error } = await client
        .from("articles")
        .select(`
      id, title, sub_title, content, summary, excerpt, thumbnail_url,
      created_at, published_at, updated_at, views, slug,
      seo_title, seo_description, keywords,
      categories (name, slug),
      author:profiles (full_name)
    `)
        .eq("id", id)
        .single();

    if (error || !data) return null;
    return data as ArticleDetail;
}

async function fetchRelatedArticles(
    categorySlug: string | null,
    articleId: string,
    supabase: Awaited<ReturnType<typeof createClient>>
) {
    if (!categorySlug) return [];

    const { data } = await supabase
        .from("articles")
        .select(`
      id, title, summary, excerpt, thumbnail_url, created_at, published_at, views,
      categories!inner (name, slug)
    `)
        .eq("status", "published")
        .neq("id", articleId)
        .eq("categories.slug", categorySlug)
        .order("published_at", { ascending: false })
        .limit(5);

    return data || [];
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
    const article = await fetchArticle(params.id);
    if (!article) return {};

    return {
        title: article.seo_title || article.title,
        description: article.seo_description || article.excerpt || article.summary || "",
        openGraph: {
            title: article.seo_title || article.title,
            description: article.seo_description || article.excerpt || article.summary || "",
            images: article.thumbnail_url ? [{ url: article.thumbnail_url }] : undefined,
            type: "article",
        },
    };
}

export default async function ArticlePage({ params }: { params: { id: string } }) {
    const supabase = await createClient();
    const device = await getDeviceType();
    const { id } = params;

    const article = await fetchArticle(id, supabase);

    if (!article) {
        notFound();
    }

    // Increment views (Server-side side effect)
    await supabase.from("articles").update({ views: (article.views || 0) + 1 }).eq("id", id);

    const siteUrl = await getSiteUrl();
    const publishedDate = article.published_at || article.created_at;
    const authorName = article.author?.full_name || "편집국";
    const categorySlug = extractCategorySlug(article);
    const relatedArticles = await fetchRelatedArticles(categorySlug, id, supabase);
    const shareUrl = article.slug ? `${siteUrl}/share/${article.slug}` : `${siteUrl}/article/${article.id}`;

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "NewsArticle",
        headline: article.seo_title || article.title,
        description: article.seo_description || article.excerpt || article.summary || "",
        datePublished: publishedDate ? new Date(publishedDate).toISOString() : undefined,
        dateModified: (article.updated_at || publishedDate)
            ? new Date(article.updated_at || publishedDate).toISOString()
            : undefined,
        author: {
            "@type": "Person",
            name: authorName,
        },
        publisher: {
            "@type": "Organization",
            name: PUBLISHER_NAME,
            logo: {
                "@type": "ImageObject",
                url: `${siteUrl}/brand/KJ_Logo.png`,
            },
        },
        image: article.thumbnail_url ? [article.thumbnail_url] : undefined,
        mainEntityOfPage: `${siteUrl}/article/${article.id}`,
    };

    if (device === "mobile") {
        return (
            <>
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
                />
                <MobileArticleDetail article={article} relatedArticles={relatedArticles} shareUrl={shareUrl} />
            </>
        );
    }

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <DesktopArticleDetail article={article} relatedArticles={relatedArticles} shareUrl={shareUrl} />
        </>
    );
}
