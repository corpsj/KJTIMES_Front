import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { getDeviceType } from "@/utils/device";
import { getSiteUrl } from "@/utils/site";
import { DesktopArticleDetail } from "@/components/desktop/DesktopArticleDetail";
import { MobileArticleDetail } from "@/components/mobile/MobileArticleDetail";
import { Article } from "@/types";

const PUBLISHER_NAME = "광전타임즈";
const SPECIAL_ISSUE_CATEGORY_SLUG = "special-edition";

type ArticleDetail = Article & {
    content: string;
    status: string;
    author_id?: string | null;
    seo_title?: string | null;
    seo_description?: string | null;
    keywords?: string | null;
};
type ArticleTag = {
    id: string;
    name: string;
};
type ArticlePageParams = Promise<{ id: string }>;

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
      id, title, sub_title, content, summary, excerpt, thumbnail_url, status, author_id,
      created_at, published_at, updated_at, views, slug,
      seo_title, seo_description, keywords,
      categories (name, slug),
      author:profiles (full_name)
    `)
        .in("status", ["published", "shared"])
        .eq("id", id)
        .single();

    if (error || !data) return null;
    return data as unknown as ArticleDetail;
}

function applyVisibilityFilter<T>(query: T, includeShared: boolean) {
    if (includeShared) {
        return (query as { in: (column: string, values: string[]) => T }).in("status", ["published", "shared"]);
    }
    return (query as { eq: (column: string, value: string) => T }).eq("status", "published");
}

async function fetchRelatedArticles(
    categorySlug: string | null,
    articleId: string,
    supabase: Awaited<ReturnType<typeof createClient>>,
    includeShared = false
) {
    if (!categorySlug) return [];

    let query = supabase
        .from("articles")
        .select(`
      id, title, summary, excerpt, thumbnail_url, created_at, published_at, views,
      categories!inner (name, slug)
    `)
        .neq("id", articleId)
        .eq("categories.slug", categorySlug);

    query = applyVisibilityFilter(query, includeShared);

    const { data } = await query
        .order("published_at", { ascending: false })
        .limit(5);

    return data || [];
}

async function fetchArticleTags(
    articleId: string,
    supabase: Awaited<ReturnType<typeof createClient>>
): Promise<ArticleTag[]> {
    const { data } = await supabase
        .from("article_tags")
        .select("tag_id, tags(name)")
        .eq("article_id", articleId)
        .limit(8);

    type ArticleTagRow = {
        tag_id?: string | null;
        tags?: { name?: string | null } | { name?: string | null }[] | null;
    };

    return ((data as ArticleTagRow[] | null) || [])
        .map((row) => {
            const normalizedTag = Array.isArray(row.tags) ? row.tags[0] : row.tags;
            if (!row.tag_id || !normalizedTag?.name) return null;
            return { id: row.tag_id, name: normalizedTag.name };
        })
        .filter((row): row is ArticleTag => Boolean(row));
}

async function fetchSeriesArticlesByTag(
    tagId: string,
    articleId: string,
    supabase: Awaited<ReturnType<typeof createClient>>,
    includeShared = false
) {
    let query = supabase
        .from("articles")
        .select(`
      id, title, summary, excerpt, thumbnail_url, created_at, published_at, views,
      categories (name, slug),
      article_tags!inner (tag_id)
    `)
        .eq("article_tags.tag_id", tagId)
        .neq("id", articleId);

    query = applyVisibilityFilter(query, includeShared);

    const { data } = await query
        .order("published_at", { ascending: false })
        .limit(6);

    return (data || []) as unknown as Article[];
}

async function fetchAuthorArticles(
    authorId: string | null | undefined,
    articleId: string,
    supabase: Awaited<ReturnType<typeof createClient>>,
    includeShared = false
) {
    if (!authorId) return [];

    let query = supabase
        .from("articles")
        .select(`
      id, title, summary, excerpt, thumbnail_url, created_at, published_at, views,
      categories (name, slug)
    `)
        .eq("author_id", authorId)
        .neq("id", articleId);

    query = applyVisibilityFilter(query, includeShared);

    const { data } = await query
        .order("published_at", { ascending: false })
        .limit(6);

    return (data || []) as unknown as Article[];
}

function uniqueArticlesById(articles: Article[], excludeIds: Set<string>) {
    const result: Article[] = [];
    for (const article of articles) {
        if (!article?.id || excludeIds.has(article.id)) continue;
        excludeIds.add(article.id);
        result.push(article);
    }
    return result;
}

export async function generateMetadata({ params }: { params: ArticlePageParams }): Promise<Metadata> {
    const { id } = await params;
    const article = await fetchArticle(id);
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
    const device = await getDeviceType();

    const article = await fetchArticle(id, supabase);

    if (!article) {
        notFound();
    }

    const siteUrl = await getSiteUrl();
    const publishedDate = article.published_at || article.created_at;
    const authorName = article.author?.full_name || "편집국";
    const categorySlug = extractCategorySlug(article);
    const includeShared = article.status === "shared" || categorySlug === SPECIAL_ISSUE_CATEGORY_SLUG;

    // Increment views atomically (Server-side side effect)
    await supabase.rpc("increment_article_views", { article_id: id });

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

    if (device === "mobile") {
        return (
            <>
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
                />
                <MobileArticleDetail
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

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <DesktopArticleDetail
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
