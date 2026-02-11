"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { extractPlainText, normalizeSlugInput } from "@/hooks/useArticleForm";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

const AUTO_SAVE_INTERVAL_MS = 30_000;

interface UseAutoSaveParams {
    title: string;
    subTitle: string;
    slug: string;
    content: string;
    contentRef: React.RefObject<string>;
    category: string | null;
    seoTitle: string;
    seoDescription: string;
    keywords: string;
    thumbnailUrl: string | null;
    articleId: string | null;
    loading: boolean;
    isEditing: boolean;
    dirty: boolean;
    setDirty: (value: boolean) => void;
    supabase: SupabaseClient;
    router: AppRouterInstance;
    regenerateSlug: (categoryId: string) => Promise<string>;
}

export type AutoSaveStatus = "idle" | "saving" | "saved";

export function useAutoSave({
    title,
    subTitle,
    slug,
    content,
    contentRef,
    category,
    seoTitle,
    seoDescription,
    keywords,
    thumbnailUrl,
    articleId,
    loading,
    isEditing,
    dirty,
    setDirty,
    supabase,
    router,
    regenerateSlug,
}: UseAutoSaveParams) {
    const [autoSaveStatus, setAutoSaveStatus] = useState<AutoSaveStatus>("idle");
    const autoSaveInProgress = useRef(false);
    const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
    }, [title, subTitle, slug, content, category, seoTitle, seoDescription, keywords, thumbnailUrl, articleId, loading, isEditing, supabase, router, regenerateSlug]);

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

    return { autoSaveStatus };
}
