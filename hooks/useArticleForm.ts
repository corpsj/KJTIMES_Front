"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import { notifications } from "@mantine/notifications";

/* ────────────────────────── Constants ────────────────────────── */

const SPECIAL_ISSUE_CATEGORY_SLUG = "special-edition";
const CATEGORY_CODE_MAP: Record<string, string> = {
    [SPECIAL_ISSUE_CATEGORY_SLUG]: "x1",
    politics: "k7",
    economy: "m4",
    society: "n3",
    culture: "c8",
    opinion: "p5",
    sports: "s2",
};
const MAX_SLUG_ATTEMPTS = 20;

/* ────────────────────────── Types ────────────────────────── */

export type CategoryOption = {
    label: string;
    value: string;
    slug: string;
    isSpecialIssue: boolean;
};

/* ────────────────────────── Helpers ────────────────────────── */

const hashText = (value: string) => {
    let hash = 5381;
    for (let i = 0; i < value.length; i += 1) {
        hash = ((hash << 5) + hash + value.charCodeAt(i)) >>> 0;
    }
    return hash >>> 0;
};

const getDayOfYear = (date: Date) => {
    const start = Date.UTC(date.getUTCFullYear(), 0, 0);
    const current = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
    return Math.floor((current - start) / 86400000);
};

const toBase36 = (value: number, length: number) => {
    return Math.max(0, value).toString(36).padStart(length, "0");
};

const getCategoryCode = (categorySlug: string) => {
    if (CATEGORY_CODE_MAP[categorySlug]) {
        return CATEGORY_CODE_MAP[categorySlug];
    }
    const hash = hashText(categorySlug);
    return `${toBase36(hash % 36, 1)}${toBase36(Math.floor(hash / 36) % 36, 1)}`;
};

const buildInternalSlug = (categorySlug: string, sequence: number, title: string) => {
    const now = new Date();
    const yearCode = toBase36(now.getUTCFullYear() % 100, 2);
    const dayCode = toBase36(getDayOfYear(now), 2);
    const sequenceCode = toBase36(sequence + 137, 3);
    const signatureSeed = (hashText(`${categorySlug}:${title}`) + sequence * 97) % 1296;
    const signatureCode = toBase36(signatureSeed, 2);
    return `${getCategoryCode(categorySlug)}${yearCode}${dayCode}-${sequenceCode}${signatureCode}`;
};

export const extractPlainText = (html: string) => {
    return html
        .replace(/<figure[^>]*>[\s\S]*?<\/figure>/gi, " ")
        .replace(/<figcaption[^>]*>[\s\S]*?<\/figcaption>/gi, " ")
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim();
};

export const normalizeSlugInput = (value: string) => {
    return value
        .toLowerCase()
        .replace(/[^a-z0-9가-힣-]/g, "-")
        .replace(/-{2,}/g, "-")
        .replace(/^-+|-+$/g, "");
};

const normalizeTags = (values: string[]) => {
    return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean)));
};

/* ────────────────────────── Hook ────────────────────────── */

export function useArticleForm() {
    const [title, setTitle] = useState("");
    const [subTitle, setSubTitle] = useState("");
    const [slug, setSlug] = useState("");
    const [content, setContent] = useState("");
    const contentRef = useRef("");
    const [category, setCategory] = useState<string | null>(null);
    const [tags, setTags] = useState<string[]>([]);
    const [tagOptions, setTagOptions] = useState<string[]>([]);

    const [seoTitle, setSeoTitle] = useState("");
    const [seoDescription, setSeoDescription] = useState("");
    const [keywords, setKeywords] = useState("");

    const [supabase] = useState(() => createClient());
    const [categories, setCategories] = useState<CategoryOption[]>([]);

    const [loading, setLoading] = useState(false);
    const [loadingArticle, setLoadingArticle] = useState(false);
    const [existingPublishedAt, setExistingPublishedAt] = useState<string | null>(null);
    const [formError, setFormError] = useState<string | null>(null);
    const [formNotice, setFormNotice] = useState<string | null>(null);
    const [dirty, setDirty] = useState(false);
    const [slugAutoLoading, setSlugAutoLoading] = useState(false);
    const [slugSequence, setSlugSequence] = useState<number | null>(null);

    // Thumbnail state
    const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);

    const router = useRouter();
    const searchParams = useSearchParams();
    const articleId = searchParams.get("id");
    const isEditing = Boolean(articleId);

    const specialCategoryId =
        categories.find((item) => item.slug === SPECIAL_ISSUE_CATEGORY_SLUG)?.value || null;
    const isSpecialIssueCategory = Boolean(category && specialCategoryId && category === specialCategoryId);
    const canCopySpecialIssueLink = isSpecialIssueCategory && Boolean(articleId) && Boolean(slug);

    const selectedCategoryLabel =
        categories.find((item) => item.value === category)?.label || "일반";

    const markDirty = useCallback(() => {
        setDirty(true);
        setFormNotice((prev) => (prev ? null : prev));
    }, []);

    /* ─── Computed text stats ─── */

    const plainTextContent = useMemo(() => extractPlainText(contentRef.current || content), [content]);
    const charCount = plainTextContent.length;
    const wordCount = plainTextContent ? plainTextContent.split(/\s+/).length : 0;
    const estimatedReadMinutes = Math.max(1, Math.ceil(wordCount / 250));

    /* ─── Fetch categories & tags ─── */

    useEffect(() => {
        const fetchLookupData = async () => {
            try {
                const [{ data: categoryData }, { data: tagData }] = await Promise.all([
                    supabase.from("categories").select("id, name, slug"),
                    supabase.from("tags").select("name").order("name"),
                ]);

                const fetchedCategories =
                    (categoryData || []).filter((item) => item?.id && item?.name && item?.slug) || [];

                if (fetchedCategories.length > 0) {
                    const sorted = fetchedCategories.sort((a, b) => a.name.localeCompare(b.name, "ko-KR"));

                    setCategories(
                        sorted.map((item) => ({
                            label: item.name,
                            value: item.id,
                            slug: item.slug,
                            isSpecialIssue: item.slug === SPECIAL_ISSUE_CATEGORY_SLUG,
                        }))
                    );
                }

                if (tagData) {
                    setTagOptions(tagData.map((tag) => tag.name));
                }
            } catch (err) {
                console.error("Failed to fetch lookup data", err);
            }
        };
        fetchLookupData();
    }, [supabase]);

    /* ─── Fetch existing article for editing ─── */

    useEffect(() => {
        if (!articleId) return;

        const fetchArticle = async () => {
            setLoadingArticle(true);
            try {
                const { data, error } = await supabase
                    .from("articles")
                    .select("id, title, sub_title, slug, content, seo_title, seo_description, keywords, category_id, published_at, status, thumbnail_url")
                    .eq("id", articleId)
                    .single();

                if (error) {
                    console.error("Failed to fetch article", error);
                    return;
                }

                if (data) {
                    setTitle(data.title || "");
                    setSubTitle(data.sub_title || "");
                    setSlug(data.slug || "");
                    setSlugSequence(null);
                    const loadedContent = data.content || "";
                    setContent(loadedContent);
                    contentRef.current = loadedContent;
                    setSeoTitle(data.seo_title || "");
                    setSeoDescription(data.seo_description || "");
                    setKeywords(data.keywords || "");
                    setCategory(data.category_id || null);
                    setExistingPublishedAt(data.published_at || null);
                    setThumbnailUrl((data as Record<string, unknown>).thumbnail_url as string | null ?? null);
                    setFormError(null);
                    setFormNotice(null);
                    setDirty(false);
                }

                const { data: tagRows } = await supabase
                    .from("article_tags")
                    .select("tag_id, tags(name)")
                    .eq("article_id", articleId);

                if (tagRows) {
                    type ArticleTagRow = { tag_id: string; tags?: { name?: string | null } | null };
                    const tagNames = (tagRows as ArticleTagRow[])
                        .map((row) => row.tags?.name)
                        .filter(Boolean) as string[];
                    setTags(tagNames);
                    setTagOptions((current) => {
                        const existing = new Set(current);
                        const additions = tagNames.filter((name) => !existing.has(name));
                        return additions.length ? [...current, ...additions] : current;
                    });
                }
            } catch (err) {
                console.error("Fetch error:", err);
            } finally {
                setLoadingArticle(false);
            }
        };

        fetchArticle();
    }, [articleId, supabase]);

    /* ─── Slug helpers ─── */

    const getCategorySlugById = useCallback((categoryId: string) => {
        return categories.find((item) => item.value === categoryId)?.slug || "";
    }, [categories]);

    const fetchNextSequenceInCategory = useCallback(async (categoryId: string) => {
        const { count, error } = await supabase
            .from("articles")
            .select("id", { count: "exact", head: true })
            .eq("category_id", categoryId);

        if (error) {
            throw new Error(`카테고리 순번 계산 실패: ${error.message}`);
        }

        return (count || 0) + 1;
    }, [supabase]);

    const isSlugTaken = useCallback(async (slugValue: string) => {
        let query = supabase.from("articles").select("id").eq("slug", slugValue).limit(1);
        if (articleId) {
            query = query.neq("id", articleId);
        }

        const { data, error } = await query;
        if (error) {
            throw new Error(`슬러그 중복 확인 실패: ${error.message}`);
        }

        return (data || []).length > 0;
    }, [supabase, articleId]);

    const generateInternalSlug = useCallback(async (targetCategoryId: string, targetTitle: string) => {
        const categorySlug = getCategorySlugById(targetCategoryId);
        if (!categorySlug) {
            throw new Error("카테고리 정보가 없어 슬러그를 생성할 수 없습니다.");
        }

        const baseSequence = await fetchNextSequenceInCategory(targetCategoryId);

        for (let offset = 0; offset < MAX_SLUG_ATTEMPTS; offset += 1) {
            const sequence = baseSequence + offset;
            const candidate = buildInternalSlug(categorySlug, sequence, targetTitle || "");
            const exists = await isSlugTaken(candidate);

            if (!exists) {
                return { value: candidate, sequence };
            }
        }

        throw new Error("고유한 자동 슬러그 생성에 실패했습니다.");
    }, [getCategorySlugById, fetchNextSequenceInCategory, isSlugTaken]);

    const regenerateSlug = useCallback(async (targetCategoryId: string) => {
        setSlugAutoLoading(true);
        try {
            const nextSlug = await generateInternalSlug(targetCategoryId, title);
            setSlug(nextSlug.value);
            setSlugSequence(nextSlug.sequence);
            return nextSlug.value;
        } finally {
            setSlugAutoLoading(false);
        }
    }, [generateInternalSlug, title]);

    /* ─── Category change ─── */

    const handleCategoryChange = useCallback((nextCategoryId: string | null) => {
        setCategory(nextCategoryId);
        markDirty();

        if (!nextCategoryId) {
            setSlug("");
            setSlugSequence(null);
            return;
        }

        if (isEditing) return;

        setFormError(null);
        void regenerateSlug(nextCategoryId).catch((error) => {
            setFormError(error instanceof Error ? error.message : "자동 슬러그 생성에 실패했습니다.");
        });
    }, [isEditing, markDirty, regenerateSlug]);

    const handleRegenerateSlug = useCallback(async () => {
        if (!category) {
            setFormError("슬러그를 생성하려면 카테고리를 먼저 선택해주세요.");
            return;
        }

        setFormError(null);
        try {
            await regenerateSlug(category);
            markDirty();
            setFormNotice("슬러그를 재생성했습니다.");
        } catch (error) {
            setFormError(error instanceof Error ? error.message : "슬러그 재생성에 실패했습니다.");
        }
    }, [category, regenerateSlug, markDirty]);

    /* ─── Tag sync ─── */

    const syncArticleTags = useCallback(async (targetArticleId: string) => {
        const normalizedTags = normalizeTags(tags);

        await supabase.from("article_tags").delete().eq("article_id", targetArticleId);

        if (normalizedTags.length === 0) {
            return;
        }

        const { data: existingTags, error: existingError } = await supabase
            .from("tags")
            .select("id, name")
            .in("name", normalizedTags);

        if (existingError) {
            console.error("Failed to fetch tags", existingError);
            return;
        }

        const existingMap = new Map((existingTags || []).map((tag) => [tag.name, tag.id]));
        const newTagNames = normalizedTags.filter((name) => !existingMap.has(name));

        let insertedTags: { id: string; name: string }[] = [];
        if (newTagNames.length > 0) {
            const { data: newTags, error: insertError } = await supabase
                .from("tags")
                .insert(newTagNames.map((name) => ({ name })))
                .select("id, name");

            if (insertError) {
                console.error("Failed to insert tags", insertError);
            } else {
                insertedTags = newTags || [];
            }
        }

        const tagIds = [...(existingTags || []), ...insertedTags].map((tag) => tag.id);

        if (tagIds.length > 0) {
            const { error: linkError } = await supabase.from("article_tags").insert(
                tagIds.map((tagId) => ({ article_id: targetArticleId, tag_id: tagId }))
            );

            if (linkError) {
                console.error("Failed to link tags", linkError);
            }
        }

        setTagOptions((current) => {
            const existing = new Set(current);
            const additions = normalizedTags.filter((name) => !existing.has(name));
            return additions.length ? [...current, ...additions] : current;
        });
    }, [tags, supabase]);

    /* ─── Special issue link copy ─── */

    const copyToClipboard = async (value: string) => {
        if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
            await navigator.clipboard.writeText(value);
            return;
        }

        if (typeof document === "undefined") {
            throw new Error("Clipboard unavailable");
        }

        const textarea = document.createElement("textarea");
        textarea.value = value;
        textarea.setAttribute("readonly", "");
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        const copied = document.execCommand("copy");
        document.body.removeChild(textarea);

        if (!copied) {
            throw new Error("Copy command failed");
        }
    };

    const handleCopySpecialIssueLink = useCallback(async () => {
        if (!slug) {
            setFormError("슬러그가 없어 공유 링크를 복사할 수 없습니다.");
            return;
        }

        if (!articleId) {
            setFormError("임시저장 후 공유 링크를 복사할 수 있습니다.");
            return;
        }

        const shareUrl = `${window.location.origin}/share/${slug}`;
        try {
            await copyToClipboard(shareUrl);
            setFormError(null);
            setFormNotice("공유 링크를 복사했습니다.");
        } catch {
            setFormError("공유 링크 복사에 실패했습니다.");
        }
    }, [slug, articleId]);

    /* ─── SEO auto-fill ─── */

    const fillSeoFromContent = useCallback(() => {
        const summaryText = extractPlainText(contentRef.current || content).slice(0, 160);
        if (!seoTitle.trim() && title.trim()) {
            setSeoTitle(title.trim().slice(0, 60));
        }
        if (!seoDescription.trim() && summaryText) {
            setSeoDescription(summaryText);
        }
        markDirty();
    }, [content, seoTitle, seoDescription, title, markDirty]);

    /* ─── Image upload ─── */

    const handleImageUpload = useCallback(async (file: File): Promise<string> => {
        const fileExt = file.name.split(".").pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `articles/${fileName}`;

        const { error: uploadError } = await supabase.storage.from("news-images").upload(filePath, file);

        if (uploadError) {
            notifications.show({ title: "업로드 실패", message: uploadError.message, color: "red" });
            return "";
        }

        const { data } = supabase.storage.from("news-images").getPublicUrl(filePath);

        const {
            data: { user },
        } = await supabase.auth.getUser();
        await supabase.from("media").insert({
            filename: file.name,
            url: data.publicUrl,
            type: file.type.startsWith("image/") ? "image" : "video",
            file_size: file.size,
            uploaded_by: user?.id,
        });

        return data.publicUrl;
    }, [supabase]);

    /* ─── Content image extraction for thumbnail picker ─── */

    const contentImageUrls = useMemo(() => {
        const urls: string[] = [];
        const imgRegex = /<img[^>]+src="([^"]+)"/gi;
        let match: RegExpExecArray | null;
        const html = contentRef.current || content;
        while ((match = imgRegex.exec(html)) !== null) {
            if (match[1]) {
                urls.push(match[1]);
            }
        }
        return urls;
    }, [content]);

    const handleThumbnailFileUpload = useCallback(async (file: File | null) => {
        if (!file) return;
        const url = await handleImageUpload(file);
        if (url) {
            setThumbnailUrl(url);
            markDirty();
        }
    }, [handleImageUpload, markDirty]);

    /* ─── beforeunload ─── */

    useEffect(() => {
        const handleBeforeUnload = (event: BeforeUnloadEvent) => {
            if (!dirty || loading || loadingArticle) return;
            event.preventDefault();
            event.returnValue = "";
        };

        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => window.removeEventListener("beforeunload", handleBeforeUnload);
    }, [dirty, loading, loadingArticle]);

    /* ─── Submit ─── */

    const handleSubmit = useCallback(async (targetStatus: string = "draft") => {
        const contentValue = contentRef.current || content;
        if (!title || !contentValue || !category) {
            setFormError("제목, 카테고리, 본문을 모두 입력해주세요.");
            return;
        }

        setFormError(null);
        setFormNotice(null);
        setLoading(true);

        let normalizedSlug = normalizeSlugInput(slug);
        if (!isEditing || !normalizedSlug) {
            try {
                normalizedSlug = await regenerateSlug(category);
            } catch (error) {
                setFormError(error instanceof Error ? error.message : "자동 슬러그 생성에 실패했습니다.");
                setLoading(false);
                return;
            }
        }

        if (!normalizedSlug) {
            setFormError("자동 슬러그 생성에 실패했습니다.");
            setLoading(false);
            return;
        }

        const {
            data: { user },
        } = await supabase.auth.getUser();
        const resolvedStatus = isSpecialIssueCategory && targetStatus !== "draft" ? "shared" : targetStatus;
        const plainText = extractPlainText(contentValue);
        const fallbackExcerpt = plainText.slice(0, 160);
        const fallbackSummary = plainText.slice(0, 160);

        const articleData: Record<string, unknown> = {
            title,
            sub_title: subTitle,
            slug: normalizedSlug,
            content: contentValue,
            excerpt: fallbackExcerpt,
            summary: fallbackSummary,
            category_id: category,
            author_id: user?.id,
            status: resolvedStatus,
            seo_title: seoTitle || title,
            seo_description: seoDescription || fallbackExcerpt,
            keywords,
            thumbnail_url: thumbnailUrl || null,
            published_at:
                resolvedStatus === "published" || resolvedStatus === "shared"
                    ? existingPublishedAt || new Date().toISOString()
                    : null,
            updated_at: new Date().toISOString(),
        };

        try {
            let savedId = articleId;
            if (articleId) {
                const { error } = await supabase.from("articles").update(articleData).eq("id", articleId);

                if (error) {
                    if (error.code === "23505") {
                        setFormError("이미 사용 중인 URL 슬러그입니다.");
                    } else {
                        setFormError(`저장 실패: ${error.message}`);
                    }
                    return;
                }
            } else {
                const { data, error } = await supabase.from("articles").insert(articleData).select("id").single();

                if (error) {
                    if (error.code === "23505") {
                        setFormError("이미 사용 중인 URL 슬러그입니다.");
                    } else {
                        setFormError(`저장 실패: ${error.message}`);
                    }
                    return;
                }
                savedId = data?.id || null;
            }

            if (savedId) {
                await syncArticleTags(savedId);
            }

            setDirty(false);
            if (resolvedStatus === "draft") {
                setFormNotice("임시저장이 완료되었습니다.");
                if (!articleId && savedId) {
                    router.replace(`/admin/write?id=${savedId}`);
                }
                return;
            }

            router.push("/admin/articles");
        } catch (error) {
            setFormError(error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.");
        } finally {
            setLoading(false);
        }
    }, [content, title, subTitle, slug, category, seoTitle, seoDescription, keywords, thumbnailUrl, articleId, isEditing, isSpecialIssueCategory, existingPublishedAt, supabase, router, regenerateSlug, syncArticleTags]);

    /* ─── Ctrl+S shortcut ─── */

    const submitHandlerRef = useRef<(targetStatus?: string) => Promise<void>>(async () => {});
    submitHandlerRef.current = handleSubmit;

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") {
                event.preventDefault();
                if (!loading && !loadingArticle) {
                    void submitHandlerRef.current("draft");
                }
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [loading, loadingArticle]);

    /* ─── Share preview URL ─── */

    const sharePreviewUrl = slug
        ? typeof window !== "undefined"
            ? `${window.location.origin}/share/${slug}`
            : `/share/${slug}`
        : "공유 링크는 저장 후 확정됩니다.";

    return {
        // State
        title, setTitle,
        subTitle, setSubTitle,
        slug,
        content, setContent,
        contentRef,
        category,
        tags, setTags,
        tagOptions,
        seoTitle, setSeoTitle,
        seoDescription, setSeoDescription,
        keywords, setKeywords,
        categories,
        loading,
        loadingArticle,
        formError, setFormError,
        formNotice, setFormNotice,
        dirty,
        slugAutoLoading,
        slugSequence,
        thumbnailUrl, setThumbnailUrl,
        articleId,
        isEditing,

        // Computed
        isSpecialIssueCategory,
        canCopySpecialIssueLink,
        selectedCategoryLabel,
        plainTextContent,
        charCount,
        wordCount,
        estimatedReadMinutes,
        contentImageUrls,
        sharePreviewUrl,

        // Actions
        markDirty,
        handleCategoryChange,
        handleRegenerateSlug,
        handleCopySpecialIssueLink,
        fillSeoFromContent,
        handleImageUpload,
        handleThumbnailFileUpload,
        handleSubmit,

        // Supabase (for auto-save)
        supabase,
        router,
        regenerateSlug,
    };
}
