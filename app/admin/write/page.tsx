"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import {
    Title,
    TextInput,
    Button,
    Group,
    Select,
    Stack,
    Grid,
    Paper,
    Textarea,
    ActionIcon,
    LoadingOverlay,
    Text,
    Box,
    Collapse,
    TagsInput,
    Alert,
    Modal,
    Badge,
    Image as MantineImage,
    SimpleGrid,
    FileButton,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { createClient } from "@/utils/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import {
    IconDeviceFloppy,
    IconSend,
    IconArrowLeft,
    IconChevronDown,
    IconChevronUp,
    IconSettings,
    IconSeo,
    IconAlertCircle,
    IconCheck,
    IconEye,
    IconPhoto,
    IconTrash,
    IconArticle,
    IconUpload,
} from "@tabler/icons-react";
import Link from "next/link";
import { notifications } from "@mantine/notifications";
import { sanitizeHtml } from "@/utils/sanitize";

const SPECIAL_ISSUE_CATEGORY_NAME = "창간특별호";
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
const AUTO_SAVE_INTERVAL_MS = 30_000;

type CategoryOption = {
    label: string;
    value: string;
    slug: string;
    isSpecialIssue: boolean;
};

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

export default function AdminWrite() {
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
    const [seoOpened, { toggle: toggleSeo }] = useDisclosure(false);
    const [previewOpened, { open: openPreview, close: closePreview }] = useDisclosure(false);
    const [existingPublishedAt, setExistingPublishedAt] = useState<string | null>(null);
    const [formError, setFormError] = useState<string | null>(null);
    const [formNotice, setFormNotice] = useState<string | null>(null);
    const [dirty, setDirty] = useState(false);
    const [slugAutoLoading, setSlugAutoLoading] = useState(false);
    const [slugSequence, setSlugSequence] = useState<number | null>(null);

    // Thumbnail state
    const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
    const [thumbnailPickerOpen, setThumbnailPickerOpen] = useState(false);

    // Auto-save state
    const [autoSaveStatus, setAutoSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
    const autoSaveInProgress = useRef(false);
    const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const router = useRouter();
    const searchParams = useSearchParams();
    const articleId = searchParams.get("id");
    const isEditing = Boolean(articleId);
    const submitHandlerRef = useRef<(targetStatus?: string) => Promise<void>>(async () => {});
    const specialCategoryId =
        categories.find((item) => item.slug === SPECIAL_ISSUE_CATEGORY_SLUG)?.value || null;
    const isSpecialIssueCategory = Boolean(category && specialCategoryId && category === specialCategoryId);
    const canCopySpecialIssueLink = isSpecialIssueCategory && Boolean(articleId) && Boolean(slug);

    const markDirty = () => {
        setDirty(true);
        if (formNotice) {
            setFormNotice(null);
        }
    };

    useEffect(() => {
        const fetchLookupData = async () => {
            try {
                const [{ data: categoryData }, { data: tagData }] = await Promise.all([
                    supabase.from("categories").select("id, name, slug"),
                    supabase.from("tags").select("name").order("name"),
                ]);

                let fetchedCategories =
                    (categoryData || []).filter((item) => item?.id && item?.name && item?.slug) || [];

                if (!fetchedCategories.some((item) => item.slug === SPECIAL_ISSUE_CATEGORY_SLUG)) {
                    const { data: insertedCategory, error: insertError } = await supabase
                        .from("categories")
                        .insert({
                            name: SPECIAL_ISSUE_CATEGORY_NAME,
                            slug: SPECIAL_ISSUE_CATEGORY_SLUG,
                            description: "창간특별호 임시 공유 기사 전용",
                        })
                        .select("id, name, slug")
                        .single();

                    if (insertError && insertError.code !== "23505") {
                        console.error("Failed to create special issue category", insertError);
                    }

                    if (insertedCategory?.id && insertedCategory?.name && insertedCategory?.slug) {
                        fetchedCategories = [...fetchedCategories, insertedCategory];
                    } else if (insertError?.code === "23505") {
                        const { data: existingSpecialCategory } = await supabase
                            .from("categories")
                            .select("id, name, slug")
                            .eq("slug", SPECIAL_ISSUE_CATEGORY_SLUG)
                            .maybeSingle();

                        if (
                            existingSpecialCategory?.id &&
                            existingSpecialCategory?.name &&
                            existingSpecialCategory?.slug &&
                            !fetchedCategories.some((item) => item.id === existingSpecialCategory.id)
                        ) {
                            fetchedCategories = [...fetchedCategories, existingSpecialCategory];
                        }
                    }
                }

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

    const normalizeSlugInput = (value: string) => {
        return value
            .toLowerCase()
            .replace(/[^a-z0-9가-힣-]/g, "-")
            .replace(/-{2,}/g, "-")
            .replace(/^-+|-+$/g, "");
    };

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

    const handleCopySpecialIssueLink = async () => {
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
    };

    const extractPlainText = (html: string) => {
        return html
            .replace(/<figure[^>]*>[\s\S]*?<\/figure>/gi, " ")
            .replace(/<figcaption[^>]*>[\s\S]*?<\/figcaption>/gi, " ")
            .replace(/<[^>]+>/g, " ")
            .replace(/\s+/g, " ")
            .trim();
    };

    const plainTextContent = useMemo(() => extractPlainText(contentRef.current || content), [content]);
    const charCount = plainTextContent.length;
    const wordCount = plainTextContent ? plainTextContent.split(/\s+/).length : 0;
    const estimatedReadMinutes = Math.max(1, Math.ceil(wordCount / 250));
    const selectedCategoryLabel =
        categories.find((item) => item.value === category)?.label || "일반";

    const fillSeoFromContent = () => {
        const summaryText = extractPlainText(contentRef.current || content).slice(0, 160);
        if (!seoTitle.trim() && title.trim()) {
            setSeoTitle(title.trim().slice(0, 60));
        }
        if (!seoDescription.trim() && summaryText) {
            setSeoDescription(summaryText);
        }
        markDirty();
    };

    const normalizeTags = (values: string[]) => {
        return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean)));
    };

    const getCategorySlugById = (categoryId: string) => {
        return categories.find((item) => item.value === categoryId)?.slug || "";
    };

    const fetchNextSequenceInCategory = async (categoryId: string) => {
        const { count, error } = await supabase
            .from("articles")
            .select("id", { count: "exact", head: true })
            .eq("category_id", categoryId);

        if (error) {
            throw new Error(`카테고리 순번 계산 실패: ${error.message}`);
        }

        return (count || 0) + 1;
    };

    const isSlugTaken = async (slugValue: string) => {
        let query = supabase.from("articles").select("id").eq("slug", slugValue).limit(1);
        if (articleId) {
            query = query.neq("id", articleId);
        }

        const { data, error } = await query;
        if (error) {
            throw new Error(`슬러그 중복 확인 실패: ${error.message}`);
        }

        return (data || []).length > 0;
    };

    const generateInternalSlug = async (targetCategoryId: string, targetTitle: string) => {
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
    };

    const regenerateSlug = async (targetCategoryId: string) => {
        setSlugAutoLoading(true);
        try {
            const nextSlug = await generateInternalSlug(targetCategoryId, title);
            setSlug(nextSlug.value);
            setSlugSequence(nextSlug.sequence);
            return nextSlug.value;
        } finally {
            setSlugAutoLoading(false);
        }
    };

    const handleCategoryChange = (nextCategoryId: string | null) => {
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
    };

    const handleRegenerateSlug = async () => {
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
    };

    const syncArticleTags = async (targetArticleId: string) => {
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
    };

    useEffect(() => {
        const handleBeforeUnload = (event: BeforeUnloadEvent) => {
            if (!dirty || loading || loadingArticle) return;
            event.preventDefault();
            event.returnValue = "";
        };

        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => window.removeEventListener("beforeunload", handleBeforeUnload);
    }, [dirty, loading, loadingArticle]);

    const handleSubmit = async (targetStatus: string = "draft") => {
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
    };

    // Silent auto-save (no redirect, no formNotice popup)
    const handleAutoSave = useCallback(async () => {
        const contentValue = contentRef.current || content;
        // Don't auto-save empty forms
        if (!title.trim() || !contentValue.trim() || !category) return;
        // Don't conflict with manual save
        if (loading || autoSaveInProgress.current) return;

        autoSaveInProgress.current = true;
        setAutoSaveStatus("saving");

        try {
            let normalizedSlug = normalizeSlugInput(slug);
            if (!isEditing || !normalizedSlug) {
                try {
                    normalizedSlug = await regenerateSlug(category);
                } catch {
                    autoSaveInProgress.current = false;
                    setAutoSaveStatus("idle");
                    return;
                }
            }

            if (!normalizedSlug) {
                autoSaveInProgress.current = false;
                setAutoSaveStatus("idle");
                return;
            }

            const {
                data: { user },
            } = await supabase.auth.getUser();
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
                status: "draft",
                seo_title: seoTitle || title,
                seo_description: seoDescription || fallbackExcerpt,
                keywords,
                thumbnail_url: thumbnailUrl || null,
                updated_at: new Date().toISOString(),
            };

            if (articleId) {
                const { error } = await supabase.from("articles").update(articleData).eq("id", articleId);
                if (error) {
                    console.error("Auto-save failed:", error.message);
                    setAutoSaveStatus("idle");
                    return;
                }
            } else {
                const { data, error } = await supabase.from("articles").insert(articleData).select("id").single();
                if (error) {
                    console.error("Auto-save failed:", error.message);
                    setAutoSaveStatus("idle");
                    return;
                }
                if (data?.id) {
                    router.replace(`/admin/write?id=${data.id}`);
                }
            }

            setDirty(false);
            setAutoSaveStatus("saved");
            // Reset to idle after 3s
            setTimeout(() => setAutoSaveStatus("idle"), 3000);
        } catch (err) {
            console.error("Auto-save error:", err);
            setAutoSaveStatus("idle");
        } finally {
            autoSaveInProgress.current = false;
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [title, subTitle, slug, content, category, seoTitle, seoDescription, keywords, thumbnailUrl, articleId, loading, isEditing, supabase, router]);

    // Auto-save effect: every 30s when dirty
    useEffect(() => {
        if (!dirty) return;

        if (autoSaveTimerRef.current) {
            clearTimeout(autoSaveTimerRef.current);
        }

        autoSaveTimerRef.current = setTimeout(() => {
            void handleAutoSave();
        }, AUTO_SAVE_INTERVAL_MS);

        return () => {
            if (autoSaveTimerRef.current) {
                clearTimeout(autoSaveTimerRef.current);
            }
        };
    }, [dirty, handleAutoSave]);

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

    const handleImageUpload = async (file: File): Promise<string> => {
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
    };

    // Extract all image URLs from content HTML for thumbnail picker
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

    const handleThumbnailFileUpload = async (file: File | null) => {
        if (!file) return;
        const url = await handleImageUpload(file);
        if (url) {
            setThumbnailUrl(url);
            markDirty();
        }
    };

    const autoSaveLabel =
        autoSaveStatus === "saving"
            ? "자동 저장 중..."
            : autoSaveStatus === "saved"
                ? "자동 저장됨"
                : null;

    const saveStateLabel = loading
        ? "저장 중..."
        : autoSaveLabel
            ? autoSaveLabel
            : dirty
                ? "저장되지 않은 변경사항 있음"
                : "변경사항 저장됨";

    const saveStateLabelColor = loading
        ? undefined
        : autoSaveStatus === "saving"
            ? "blue.6"
            : autoSaveStatus === "saved"
                ? "green.6"
                : dirty
                    ? "orange.7"
                    : "dimmed";

    const sharePreviewUrl = slug
        ? typeof window !== "undefined"
            ? `${window.location.origin}/share/${slug}`
            : `/share/${slug}`
        : "공유 링크는 저장 후 확정됩니다.";

    return (
        <Stack gap="lg" maw={1600} mx="auto">
            <LoadingOverlay visible={loading || loadingArticle} />

            <Modal opened={previewOpened} onClose={closePreview} size="xl" title="기사 미리보기" centered>
                <Stack gap="md">
                    <Badge variant="light">{selectedCategoryLabel}</Badge>
                    <Title order={2} size="h3">
                        {title || "기사 제목"}
                    </Title>
                    {subTitle && (
                        <Text c="dimmed" style={{ whiteSpace: "pre-line" }}>{subTitle}</Text>
                    )}
                    <Text size="sm" c="dimmed">
                        읽기 {estimatedReadMinutes}분 · {sharePreviewUrl}
                    </Text>
                    <Box
                        style={{ lineHeight: 1.7 }}
                        dangerouslySetInnerHTML={{
                            __html: sanitizeHtml(content || "<p style='color:#6b7280'>미리보기할 본문이 없습니다.</p>"),
                        }}
                    />
                </Stack>
            </Modal>

            <Paper
                p="md"
                radius="md"
                withBorder
                style={{ position: "sticky", top: 120, zIndex: 10, backgroundColor: "rgba(255,255,255,0.95)", backdropFilter: "blur(10px)" }}
            >
                <Group justify="space-between">
                    <Group>
                        <ActionIcon component={Link} href="/admin/articles" variant="subtle" color="gray" size="lg">
                            <IconArrowLeft size={22} />
                        </ActionIcon>
                        <div>
                            <Title order={3}>{isEditing ? "기사 수정" : "기사 작성"}</Title>
                            <Badge
                                variant="light"
                                color={loading ? "blue" : autoSaveStatus === "saving" ? "blue" : autoSaveStatus === "saved" ? "green" : dirty ? "orange" : "gray"}
                                size="sm"
                                mt={6}
                            >
                                {saveStateLabel}
                            </Badge>
                        </div>
                    </Group>
                    <Group>
                        <Button
                            variant="default"
                            leftSection={<IconEye size={18} />}
                            disabled={loading || loadingArticle}
                            onClick={openPreview}
                        >
                            미리보기
                        </Button>
                        <Button
                            variant="default"
                            leftSection={<IconDeviceFloppy size={18} />}
                            disabled={loading || loadingArticle}
                            onClick={() => handleSubmit("draft")}
                        >
                            임시저장
                        </Button>
                        <Button
                            variant="light"
                            color="orange"
                            disabled={isSpecialIssueCategory || loading || loadingArticle}
                            onClick={() => handleSubmit("pending_review")}
                        >
                            승인 요청
                        </Button>
                        <Button
                            variant="light"
                            color="dark"
                            disabled={loading || loadingArticle}
                            onClick={() => handleSubmit("shared")}
                        >
                            {isSpecialIssueCategory ? "창간특별호 발행" : "공유 발행"}
                        </Button>
                        {!isSpecialIssueCategory && (
                            <Button
                                color="blue"
                                leftSection={<IconSend size={18} />}
                                disabled={loading || loadingArticle}
                                onClick={() => handleSubmit("published")}
                            >
                                발행
                            </Button>
                        )}
                    </Group>
                </Group>
            </Paper>

            {formError && (
                <Alert color="red" icon={<IconAlertCircle size={16} />} title="저장 오류" withCloseButton onClose={() => setFormError(null)}>
                    {formError}
                </Alert>
            )}

            {formNotice && (
                <Alert color="green" icon={<IconCheck size={16} />} title="완료" withCloseButton onClose={() => setFormNotice(null)}>
                    {formNotice}
                </Alert>
            )}

            <Grid gutter={24}>
                <Grid.Col span={{ base: 12, lg: 8 }}>
                    <Paper p={{ base: "lg", md: 30 }} radius="md" withBorder shadow="sm" style={{ minHeight: "80vh" }}>
                        <Stack gap="lg">
                            <TextInput
                                placeholder="기사 제목을 입력하세요"
                                size="xl"
                                variant="unstyled"
                                styles={{ input: { fontSize: "2.1rem", fontWeight: 800, height: "auto", lineHeight: 1.2 } }}
                                value={title}
                                onChange={(e) => {
                                    setTitle(e.currentTarget.value);
                                    markDirty();
                                }}
                                required
                            />
                            <Textarea
                                placeholder="부제 (선택, 줄바꿈 가능)"
                                size="lg"
                                variant="unstyled"
                                c="dimmed"
                                autosize
                                minRows={1}
                                maxRows={5}
                                styles={{ input: { fontSize: "1.25rem", fontWeight: 500, lineHeight: 1.5 } }}
                                value={subTitle}
                                onChange={(e) => {
                                    setSubTitle(e.currentTarget.value);
                                    markDirty();
                                }}
                            />

                            <RichTextEditor
                                content={content}
                                onChange={(value) => {
                                    setContent(value);
                                    contentRef.current = value;
                                    markDirty();
                                }}
                                onImageUpload={handleImageUpload}
                            />

                            {/* Word/Character counter bar */}
                            <Box
                                px="md"
                                py={6}
                                style={{
                                    backgroundColor: "var(--mantine-color-gray-0)",
                                    borderRadius: "var(--mantine-radius-sm)",
                                    border: "1px solid var(--mantine-color-gray-2)",
                                }}
                            >
                                <Text size="xs" c="dimmed">
                                    글자 수: {charCount.toLocaleString()} | 단어 수: {wordCount.toLocaleString()} | 읽기 약 {estimatedReadMinutes}분
                                </Text>
                            </Box>
                        </Stack>
                    </Paper>
                </Grid.Col>

                <Grid.Col span={{ base: 12, lg: 4 }}>
                    <Stack gap="md" style={{ position: "sticky", top: 140 }}>
                        <Paper withBorder radius="md">
                            <Box bg="gray.1" p="sm" style={{ borderBottom: "1px solid var(--mantine-color-gray-3)" }}>
                                <Group gap="xs">
                                    <IconSettings size={16} />
                                    <Text size="sm" fw={600}>
                                        발행 설정
                                    </Text>
                                </Group>
                            </Box>
                            <Stack p="md" gap="md">
                                <Select
                                    label="카테고리"
                                    placeholder="카테고리 선택"
                                    data={categories}
                                    value={category}
                                    onChange={handleCategoryChange}
                                    searchable
                                    required
                                    checkIconPosition="right"
                                />

                                {isSpecialIssueCategory && (
                                    <>
                                        <Button
                                            variant="light"
                                            color="blue"
                                            onClick={() => void handleCopySpecialIssueLink()}
                                            disabled={!canCopySpecialIssueLink || loading || loadingArticle}
                                        >
                                            공유 링크 복사
                                        </Button>
                                        <Text size="xs" c="dimmed">
                                            {canCopySpecialIssueLink ? "공유 링크 사용 가능" : "저장 후 복사 가능"}
                                        </Text>
                                    </>
                                )}

                                <Box>
                                    <Text size="xs" c="dimmed" mb={4}>
                                        슬러그
                                    </Text>
                                    <Text size="sm" fw={700} style={{ wordBreak: "break-all" }}>
                                        {slug || "카테고리 선택 후 자동 생성"}
                                    </Text>
                                </Box>
                                <Button
                                    variant="light"
                                    color="gray"
                                    onClick={handleRegenerateSlug}
                                    disabled={!category || slugAutoLoading || loading}
                                >
                                    {slugAutoLoading ? "생성 중..." : "슬러그 재생성"}
                                </Button>
                                <Text size="xs" c="dimmed">
                                    순번 {slugSequence ? slugSequence.toLocaleString() : "-"}
                                </Text>

                                <TagsInput
                                    label="태그"
                                    data={tagOptions}
                                    value={tags}
                                    onChange={(value) => {
                                        setTags(value);
                                        markDirty();
                                    }}
                                    clearable
                                />
                            </Stack>
                        </Paper>

                        {/* Thumbnail selection panel */}
                        <Paper withBorder radius="md">
                            <Box bg="gray.1" p="sm" style={{ borderBottom: "1px solid var(--mantine-color-gray-3)" }}>
                                <Group gap="xs">
                                    <IconPhoto size={16} />
                                    <Text size="sm" fw={600}>
                                        대표 이미지
                                    </Text>
                                </Group>
                            </Box>
                            <Stack p="md" gap="sm">
                                {thumbnailUrl ? (
                                    <Box style={{ borderRadius: 6, overflow: "hidden", border: "1px solid var(--mantine-color-gray-3)" }}>
                                        <MantineImage
                                            src={thumbnailUrl}
                                            alt="대표 이미지"
                                            h={160}
                                            fit="cover"
                                            radius="sm"
                                        />
                                    </Box>
                                ) : (
                                    <Box
                                        py="xl"
                                        style={{
                                            border: "2px dashed var(--mantine-color-gray-3)",
                                            borderRadius: 6,
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                        }}
                                    >
                                        <Text size="sm" c="dimmed">
                                            대표 이미지 없음
                                        </Text>
                                    </Box>
                                )}

                                <Group grow>
                                    <Button
                                        variant="light"
                                        color="gray"
                                        size="xs"
                                        leftSection={<IconArticle size={14} />}
                                        disabled={contentImageUrls.length === 0}
                                        onClick={() => setThumbnailPickerOpen(true)}
                                    >
                                        본문에서 선택
                                    </Button>
                                    <FileButton
                                        onChange={handleThumbnailFileUpload}
                                        accept="image/*"
                                    >
                                        {(props) => (
                                            <Button
                                                variant="light"
                                                color="gray"
                                                size="xs"
                                                leftSection={<IconUpload size={14} />}
                                                {...props}
                                            >
                                                직접 업로드
                                            </Button>
                                        )}
                                    </FileButton>
                                </Group>
                                {thumbnailUrl && (
                                    <Button
                                        variant="subtle"
                                        color="red"
                                        size="xs"
                                        leftSection={<IconTrash size={14} />}
                                        onClick={() => {
                                            setThumbnailUrl(null);
                                            markDirty();
                                        }}
                                    >
                                        제거
                                    </Button>
                                )}
                            </Stack>
                        </Paper>

                        {/* Thumbnail picker modal */}
                        <Modal
                            opened={thumbnailPickerOpen}
                            onClose={() => setThumbnailPickerOpen(false)}
                            title="본문 이미지에서 대표 이미지 선택"
                            centered
                        >
                            {contentImageUrls.length > 0 ? (
                                <SimpleGrid cols={3} spacing="xs">
                                    {contentImageUrls.map((url, idx) => (
                                        <Box
                                            key={`${url}-${idx}`}
                                            style={{
                                                cursor: "pointer",
                                                borderRadius: 6,
                                                overflow: "hidden",
                                                border: thumbnailUrl === url
                                                    ? "2px solid var(--mantine-color-blue-6)"
                                                    : "2px solid transparent",
                                                transition: "border-color 0.15s",
                                            }}
                                            onClick={() => {
                                                setThumbnailUrl(url);
                                                markDirty();
                                                setThumbnailPickerOpen(false);
                                            }}
                                        >
                                            <MantineImage
                                                src={url}
                                                alt={`본문 이미지 ${idx + 1}`}
                                                h={100}
                                                fit="cover"
                                            />
                                        </Box>
                                    ))}
                                </SimpleGrid>
                            ) : (
                                <Text c="dimmed" ta="center" py="lg">
                                    본문에 이미지가 없습니다.
                                </Text>
                            )}
                        </Modal>

                        <Paper withBorder radius="md">
                            <Box
                                bg="gray.1"
                                p="sm"
                                style={{ borderBottom: "1px solid var(--mantine-color-gray-3)", cursor: "pointer" }}
                                onClick={toggleSeo}
                            >
                                <Group justify="space-between">
                                    <Group gap="xs">
                                        <IconSeo size={16} />
                                        <Text size="sm" fw={600}>
                                            SEO
                                        </Text>
                                    </Group>
                                    {seoOpened ? <IconChevronUp size={14} /> : <IconChevronDown size={14} />}
                                </Group>
                            </Box>
                            <Collapse in={seoOpened}>
                                <Stack p="md" gap="md">
                                    <TextInput
                                        label="SEO 제목"
                                        value={seoTitle}
                                        onChange={(e) => {
                                            setSeoTitle(e.currentTarget.value);
                                            markDirty();
                                        }}
                                    />
                                    <Textarea
                                        label="메타 설명"
                                        minRows={3}
                                        value={seoDescription}
                                        onChange={(e) => {
                                            setSeoDescription(e.currentTarget.value);
                                            markDirty();
                                        }}
                                        autosize
                                    />
                                    <TextInput
                                        label="키워드"
                                        value={keywords}
                                        onChange={(e) => {
                                            setKeywords(e.currentTarget.value);
                                            markDirty();
                                        }}
                                    />
                                    <Button variant="light" color="gray" onClick={fillSeoFromContent}>
                                        자동 채우기
                                    </Button>
                                </Stack>
                            </Collapse>
                        </Paper>
                    </Stack>
                </Grid.Col>
            </Grid>
        </Stack>
    );
}
