import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { getSiteUrl } from "@/utils/site";
import { ArticleDetail } from "@/components/shared/ArticleDetail";
import {
    fetchArticleById,
    fetchRelatedArticles,
    fetchArticleTags,
    fetchSeriesArticlesByTag,
    incrementArticleViews,
    uniqueArticlesById,
    type ArticleDetail as ArticleDetailType,
} from "@/lib/api/articles";
import { fetchAuthorArticles } from "@/lib/api/authors";

const PUBLISHER_NAME = "광전타임즈";
const SPECIAL_ISSUE_CATEGORY_SLUG = "special-edition";

type ArticlePageParams = Promise<{ id: string }>;

function extractCategorySlug(article: ArticleDetailType) {
    if (Array.isArray(article.categories)) {
        return article.categories[0]?.slug || null;
    }
    return article.categories?.slug || null;
}

export async function generateMetadata({ params }: { params: ArticlePageParams }): Promise<Metadata> {
    const { id } = await params;
    const { data: article } = await fetchArticleById(id);
    if (!article) return {};

    const siteUrl = await getSiteUrl();
    const title = article.seo_title || article.title;
    const description = article.seo_description || article.excerpt || article.summary || "";
    const publishedDate = article.published_at || article.created_at;
    const authorName = article.author?.full_name || "편집국";
    const keywords = article.keywords
        ? article.keywords.split(",").map((k: string) => k.trim())
        : undefined;

    return {
        title,
        description,
        keywords,
        authors: [{ name: authorName }],
        openGraph: {
            title,
            description,
            images: article.thumbnail_url ? [{ url: article.thumbnail_url, width: 1200, height: 630 }] : undefined,
            type: "article",
            siteName: PUBLISHER_NAME,
            url: `${siteUrl}/article/${id}`,
            publishedTime: publishedDate ? new Date(publishedDate).toISOString() : undefined,
            modifiedTime: article.updated_at ? new Date(article.updated_at).toISOString() : undefined,
            authors: [authorName],
        },
        twitter: {
            card: "summary_large_image",
            title,
            description,
            images: article.thumbnail_url ? [article.thumbnail_url] : undefined,
        },
        alternates: {
            canonical: `${siteUrl}/article/${id}`,
        },
    };
}

export default async function ArticlePage({ params }: { params: ArticlePageParams }) {
    const { id } = await params;
    const supabase = await createClient();

    const { data: article } = await fetchArticleById(id, supabase);

    if (!article) {
        notFound();
    }

    const siteUrl = await getSiteUrl();
    const publishedDate = article.published_at || article.created_at;
    const authorName = article.author?.full_name || "편집국";
    const categorySlug = extractCategorySlug(article);
    const includeShared = article.status === "shared" || categorySlug === SPECIAL_ISSUE_CATEGORY_SLUG;

    await incrementArticleViews(id, supabase);

    const [rawRelatedArticles, articleTags, rawAuthorArticles] = await Promise.all([
        fetchRelatedArticles(categorySlug, id, supabase, includeShared),
        fetchArticleTags(id, supabase),
        fetchAuthorArticles(article.author_id, id, supabase, includeShared),
    ]);

    const primaryTag = articleTags[0] || null;
    const rawSeriesArticles = primaryTag
        ? await fetchSeriesArticlesByTag(primaryTag.id, id, supabase, includeShared)
        : [];

    const usedIds = new Set<string>([id]);
    const relatedArticles = uniqueArticlesById(rawRelatedArticles, usedIds);
    const seriesArticles = uniqueArticlesById(rawSeriesArticles, usedIds);
    const authorArticles = uniqueArticlesById(rawAuthorArticles, usedIds);
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
                url: `${siteUrl}/brand/KJ_sloganLogo.png`,
            },
        },
        image: article.thumbnail_url ? [article.thumbnail_url] : undefined,
        mainEntityOfPage: `${siteUrl}/article/${article.id}`,
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <ArticleDetail
                article={article}
                relatedArticles={relatedArticles}
                seriesArticles={seriesArticles}
                authorArticles={authorArticles}
                articleTags={articleTags.map((tag) => tag.name)}
                seriesLabel={primaryTag?.name || null}
                shareUrl={shareUrl}
            />
        </>
    );
}
