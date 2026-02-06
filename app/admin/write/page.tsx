"use client";

import { useEffect, useState, useRef } from "react";
import { Title, TextInput, Button, Group, Select, Stack, Grid, Paper, Textarea, Divider, ActionIcon, LoadingOverlay, Text, Box, Collapse, FileInput, Image, TagsInput } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { createClient } from "@/utils/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import { IconDeviceFloppy, IconSend, IconArrowLeft, IconChevronDown, IconChevronUp, IconSettings, IconSeo, IconTags, IconPhoto } from "@tabler/icons-react";
import Link from "next/link";

export default function AdminWrite() {
    // Core Fields
    const [title, setTitle] = useState("");
    const [subTitle, setSubTitle] = useState("");
    const [slug, setSlug] = useState("");
    const [content, setContent] = useState("");
    const contentRef = useRef("");
    const [excerpt, setExcerpt] = useState(""); // Short summary
    const [thumbnailUrl, setThumbnailUrl] = useState("");
    const [category, setCategory] = useState<string | null>(null);
    const [tags, setTags] = useState<string[]>([]);
    const [tagOptions, setTagOptions] = useState<string[]>([]);

    // SEO Fields
    const [seoTitle, setSeoTitle] = useState("");
    const [seoDescription, setSeoDescription] = useState("");
    const [keywords, setKeywords] = useState("");

    const [supabase] = useState(() => createClient());
    const [categories, setCategories] = useState<{ label: string, value: string }[]>([]);

    // UI State
    const [loading, setLoading] = useState(false);
    const [loadingArticle, setLoadingArticle] = useState(false);
    const [thumbnailUploading, setThumbnailUploading] = useState(false);
    const [seoOpened, { toggle: toggleSeo }] = useDisclosure(false);
    const [existingPublishedAt, setExistingPublishedAt] = useState<string | null>(null);

    const router = useRouter();
    const searchParams = useSearchParams();
    const articleId = searchParams.get("id");
    const isEditing = Boolean(articleId);

    // Fetch Categories & Tags on Load
    useEffect(() => {
        const fetchLookupData = async () => {
            try {
                const [{ data: categoryData }, { data: tagData }] = await Promise.all([
                    supabase.from("categories").select("id, name, slug").order("name"),
                    supabase.from("tags").select("name").order("name"),
                ]);
                if (categoryData) {
                    setCategories(categoryData.map(c => ({ label: c.name, value: c.id })));
                }
                if (tagData) {
                    setTagOptions(tagData.map(tag => tag.name));
                }
            } catch (err) {
                console.error("Failed to fetch lookup data", err);
            }
        };
        fetchLookupData();
    }, [supabase]);

    // Fetch article when editing
    useEffect(() => {
        if (!articleId) return;

        const fetchArticle = async () => {
            setLoadingArticle(true);
            try {
                const { data, error } = await supabase
                    .from("articles")
                    .select("id, title, sub_title, slug, content, excerpt, summary, thumbnail_url, seo_title, seo_description, keywords, category_id, published_at, status")
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
                    const loadedContent = data.content || "";
                    setContent(loadedContent);
                    contentRef.current = loadedContent;
                    setExcerpt(data.excerpt || data.summary || "");
                    setThumbnailUrl(data.thumbnail_url || "");
                    setSeoTitle(data.seo_title || "");
                    setSeoDescription(data.seo_description || "");
                    setKeywords(data.keywords || "");
                    setCategory(data.category_id || null);
                    setExistingPublishedAt(data.published_at || null);
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

    // Auto-generate slug from title if empty
    const generateSlug = (text: string) => {
        return text
            .toLowerCase()
            .replace(/[^a-z0-9가-힣\s-]/g, '') // Remove special chars
            .trim()
            .replace(/\s+/g, '-'); // Replace spaces with dashes
    };

    const handleTitleChange = (val: string) => {
        setTitle(val);
        if (!slug) {
            setSlug(generateSlug(val));
        }
    };

    const extractPlainText = (html: string) => {
        return html
            .replace(/<[^>]+>/g, " ")
            .replace(/\s+/g, " ")
            .trim();
    };

    const normalizeTags = (values: string[]) => {
        return Array.from(
            new Set(values.map((value) => value.trim()).filter(Boolean))
        );
    };

    const syncArticleTags = async (articleId: string) => {
        const normalizedTags = normalizeTags(tags);

        await supabase.from("article_tags").delete().eq("article_id", articleId);

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

        const tagIds = [
            ...(existingTags || []),
            ...insertedTags,
        ].map((tag) => tag.id);

        if (tagIds.length > 0) {
            const { error: linkError } = await supabase.from("article_tags").insert(
                tagIds.map((tagId) => ({ article_id: articleId, tag_id: tagId }))
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

    const handleSubmit = async (targetStatus: string = "draft") => {
        const contentValue = contentRef.current || content;
        if (!title || !contentValue || !category) {
            alert("제목, 카테고리, 본문을 모두 입력해주세요.");
            return;
        }

        if (!slug) {
            alert("URL 슬러그를 입력해주세요.");
            return;
        }

        setLoading(true);

        const { data: { user } } = await supabase.auth.getUser();
        const plainText = extractPlainText(contentValue);
        const fallbackExcerpt = excerpt.trim() || plainText.slice(0, 160);
        const fallbackSummary = excerpt.trim() || plainText.slice(0, 160);

        const articleData = {
            title,
            sub_title: subTitle,
            slug,
            content: contentValue,
            excerpt: fallbackExcerpt,
            summary: fallbackSummary,
            thumbnail_url: thumbnailUrl || null,
            category_id: category,
            author_id: user?.id,
            status: targetStatus,
            seo_title: seoTitle || title,
            seo_description: seoDescription || fallbackExcerpt,
            keywords: keywords,
            published_at: (targetStatus === 'published' || targetStatus === 'shared')
                ? (existingPublishedAt || new Date().toISOString())
                : null,
            updated_at: new Date().toISOString(),
        };

        try {
            let savedId = articleId;
            if (articleId) {
                const { error } = await supabase
                    .from("articles")
                    .update(articleData)
                    .eq("id", articleId);

                if (error) {
                    if (error.code === "23505") {
                        alert("이미 사용 중인 URL 슬러그입니다. 다른 슬러그를 입력해주세요.");
                    } else {
                        alert("Error: " + error.message);
                    }
                    return;
                }
            } else {
                const { data, error } = await supabase
                    .from("articles")
                    .insert(articleData)
                    .select("id")
                    .single();

                if (error) {
                    if (error.code === "23505") {
                        alert("이미 사용 중인 URL 슬러그입니다. 다른 슬러그를 입력해주세요.");
                    } else {
                        alert("Error: " + error.message);
                    }
                    return;
                }
                savedId = data?.id || null;
            }

            if (savedId) {
                await syncArticleTags(savedId);
            }

            router.push("/admin/articles");
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = async (file: File): Promise<string> => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `articles/${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('news-images')
            .upload(filePath, file);

        if (uploadError) {
            alert("Upload failed: " + uploadError.message);
            return "";
        }

        const { data } = supabase.storage
            .from('news-images')
            .getPublicUrl(filePath);

        // Record to media table
        const { data: { user } } = await supabase.auth.getUser();
        await supabase.from('media').insert({
            filename: file.name,
            url: data.publicUrl,
            type: file.type.startsWith('image/') ? 'image' : 'video',
            file_size: file.size,
            uploaded_by: user?.id
        });

        return data.publicUrl;
    };

    const handleThumbnailUpload = async (file: File) => {
        setThumbnailUploading(true);
        const fileExt = file.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
        const filePath = `thumbnails/${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from("news-images")
            .upload(filePath, file);

        if (uploadError) {
            alert("썸네일 업로드 실패: " + uploadError.message);
            setThumbnailUploading(false);
            return;
        }

        const { data } = supabase.storage
            .from("news-images")
            .getPublicUrl(filePath);

        setThumbnailUrl(data.publicUrl);

        const { data: { user } } = await supabase.auth.getUser();
        await supabase.from("media").insert({
            filename: file.name,
            url: data.publicUrl,
            type: file.type.startsWith("image/") ? "image" : "file",
            file_size: file.size,
            uploaded_by: user?.id,
        });

        setThumbnailUploading(false);
    };

    return (
        <Stack gap="lg" maw={1600} mx="auto">
            <LoadingOverlay visible={loading || loadingArticle || thumbnailUploading} />

            {/* Header Action Bar */}
            <Paper p="md" radius="md" withBorder style={{ position: 'sticky', top: 120, zIndex: 10, backgroundColor: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)' }}>
                <Group justify="space-between">
                    <Group>
                        <ActionIcon component={Link} href="/admin/articles" variant="subtle" color="gray" size="lg">
                            <IconArrowLeft size={22} />
                        </ActionIcon>
                        <div>
                            <Text size="xs" c="dimmed" fw={700} tt="uppercase">Editor</Text>
                            <Title order={3}>{isEditing ? "기사 수정" : "기사 작성"}</Title>
                        </div>
                    </Group>
                    <Group>
                        <Button
                            variant="default"
                            leftSection={<IconDeviceFloppy size={18} />}
                            onClick={() => handleSubmit('draft')}
                        >
                            임시저장
                        </Button>
                        <Button
                            variant="light"
                            color="orange"
                            onClick={() => handleSubmit('pending_review')}
                        >
                            승인 요청
                        </Button>
                        <Button
                            variant="light"
                            color="dark"
                            onClick={() => handleSubmit('shared')}
                        >
                            공유 링크 발행
                        </Button>
                        <Button
                            color="blue"
                            leftSection={<IconSend size={18} />}
                            onClick={() => handleSubmit('published')}
                        >
                            발행하기
                        </Button>
                    </Group>
                </Group>
            </Paper>

            <Grid gutter={30}>
                {/* Main Editor Area */}
                <Grid.Col span={{ base: 12, lg: 9 }}>
                    <Paper p={30} radius="md" withBorder shadow="sm" style={{ minHeight: '80vh' }}>
                        <Stack gap="xl">
                            <Stack gap="xs">
                                <TextInput
                                    placeholder="기사 제목을 입력하세요"
                                    size="xl"
                                    variant="unstyled"
                                    styles={{ input: { fontSize: '2.5rem', fontWeight: 800, height: 'auto', lineHeight: 1.2 } }}
                                    value={title}
                                    onChange={(e) => handleTitleChange(e.currentTarget.value)}
                                    required
                                />
                                <TextInput
                                    placeholder="부제 (선택사항)"
                                    size="lg"
                                    variant="unstyled"
                                    c="dimmed"
                                    styles={{ input: { fontSize: '1.5rem', fontWeight: 500 } }}
                                    value={subTitle}
                                    onChange={(e) => setSubTitle(e.currentTarget.value)}
                                />
                            </Stack>

                            <Divider />

                            <Box style={{ minHeight: '500px' }}>
                                <RichTextEditor
                                    content={content}
                                    onChange={(value) => {
                                        setContent(value);
                                        contentRef.current = value;
                                    }}
                                    onImageUpload={handleImageUpload}
                                />
                            </Box>
                        </Stack>
                    </Paper>
                </Grid.Col>

                {/* Sidebar Tools */}
                <Grid.Col span={{ base: 12, lg: 3 }}>
                    <Stack gap="md" style={{ position: 'sticky', top: 140 }}>
                        <Paper withBorder radius="md">
                            <Box bg="gray.1" p="sm" style={{ borderBottom: '1px solid var(--mantine-color-gray-3)' }}>
                                <Group gap="xs">
                                    <IconSettings size={16} />
                                    <Text size="sm" fw={600}>발행 설정</Text>
                                </Group>
                            </Box>
                            <Stack p="md" gap="md">
                                <Select
                                    label="카테고리"
                                    placeholder="카테고리 선택"
                                    data={categories}
                                    value={category}
                                    onChange={setCategory}
                                    searchable
                                    required
                                    checkIconPosition="right"
                                />
                                <TextInput
                                    label="URL 슬러그"
                                    description="고유한 URL 주소입니다."
                                    value={slug}
                                    onChange={(e) => setSlug(e.currentTarget.value)}
                                    rightSection={<IconTags size={14} color="gray" />}
                                    required
                                />
                                <TextInput
                                    label="공유 링크"
                                    description="지인 공유용 임시 링크입니다."
                                    value={slug ? `/share/${slug}` : ""}
                                    placeholder="/share/기사-슬러그"
                                    readOnly
                                />
                                <FileInput
                                    label="썸네일 이미지 업로드"
                                    placeholder="이미지 파일 선택"
                                    accept="image/*"
                                    leftSection={<IconPhoto size={14} />}
                                    disabled={thumbnailUploading}
                                    onChange={(file) => {
                                        if (file) {
                                            handleThumbnailUpload(file);
                                        }
                                    }}
                                />
                                <TextInput
                                    label="썸네일 이미지 URL"
                                    description="외부 이미지 URL도 입력할 수 있습니다."
                                    value={thumbnailUrl}
                                    onChange={(e) => setThumbnailUrl(e.currentTarget.value)}
                                    placeholder="https://..."
                                />
                                {thumbnailUrl && (
                                    <Image
                                        src={thumbnailUrl}
                                        alt="썸네일 미리보기"
                                        radius="md"
                                    />
                                )}
                                <Textarea
                                    label="요약 (Excerpt)"
                                    description="기사 목록에 표시될 내용입니다."
                                    minRows={3}
                                    value={excerpt}
                                    onChange={(e) => setExcerpt(e.currentTarget.value)}
                                    autosize
                                />
                                <TagsInput
                                    label="태그"
                                    description="검색 및 큐레이션에 사용됩니다."
                                    data={tagOptions}
                                    value={tags}
                                    onChange={setTags}
                                    clearable
                                />
                            </Stack>
                        </Paper>

                        <Paper withBorder radius="md">
                            <Box
                                bg="gray.1"
                                p="sm"
                                style={{ borderBottom: '1px solid var(--mantine-color-gray-3)', cursor: 'pointer' }}
                                onClick={toggleSeo}
                            >
                                <Group justify="space-between">
                                    <Group gap="xs">
                                        <IconSeo size={16} />
                                        <Text size="sm" fw={600}>SEO 최적화</Text>
                                    </Group>
                                    {seoOpened ? <IconChevronUp size={14} /> : <IconChevronDown size={14} />}
                                </Group>
                            </Box>
                            <Collapse in={seoOpened}>
                                <Stack p="md" gap="md">
                                    <TextInput
                                        label="SEO 제목"
                                        placeholder="브라우저 타이틀 바"
                                        value={seoTitle}
                                        onChange={(e) => setSeoTitle(e.currentTarget.value)}
                                    />
                                    <Textarea
                                        label="메타 설명"
                                        placeholder="검색 결과 설명문"
                                        minRows={3}
                                        value={seoDescription}
                                        onChange={(e) => setSeoDescription(e.currentTarget.value)}
                                        autosize
                                    />
                                    <TextInput
                                        label="키워드"
                                        placeholder="뉴스, 정치, 경제..."
                                        value={keywords}
                                        onChange={(e) => setKeywords(e.currentTarget.value)}
                                    />
                                </Stack>
                            </Collapse>
                        </Paper>
                    </Stack>
                </Grid.Col>
            </Grid>
        </Stack>
    );
}
