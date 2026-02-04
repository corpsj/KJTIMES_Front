"use client";

import { useEffect, useState, useRef } from "react";
import { Title, TextInput, Button, Group, Select, Stack, Grid, Paper, Textarea, Divider, Badge, ActionIcon, LoadingOverlay, Text, Box, Collapse } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { createClient } from "@/utils/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import { IconDeviceFloppy, IconSend, IconX, IconArrowLeft, IconChevronDown, IconChevronUp, IconSettings, IconSeo, IconTags } from "@tabler/icons-react";
import Link from "next/link";

export default function AdminWrite() {
    // Core Fields
    const [title, setTitle] = useState("");
    const [subTitle, setSubTitle] = useState("");
    const [slug, setSlug] = useState("");
    const [content, setContent] = useState("");
    const contentRef = useRef("");
    const [excerpt, setExcerpt] = useState(""); // Short summary
    const [category, setCategory] = useState<string | null>(null);

    // SEO Fields
    const [seoTitle, setSeoTitle] = useState("");
    const [seoDescription, setSeoDescription] = useState("");
    const [keywords, setKeywords] = useState("");

    const [supabase] = useState(() => createClient());
    const [categories, setCategories] = useState<{ label: string, value: string }[]>([]);

    // UI State
    const [loading, setLoading] = useState(false);
    const [loadingArticle, setLoadingArticle] = useState(false);
    const [seoOpened, { toggle: toggleSeo }] = useDisclosure(false);
    const [existingPublishedAt, setExistingPublishedAt] = useState<string | null>(null);
    const [currentStatus, setCurrentStatus] = useState<string | null>(null);

    const router = useRouter();
    const searchParams = useSearchParams();
    const articleId = searchParams.get("id");
    const isEditing = Boolean(articleId);

    // Fetch Categories on Load
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const { data } = await supabase.from('categories').select('id, name, slug');
                if (data) {
                    setCategories(data.map(c => ({ label: c.name, value: c.id })));
                }
            } catch (err) {
                console.error("Failed to fetch categories", err);
            }
        };
        fetchCategories();
    }, [supabase]);

    // Fetch article when editing
    useEffect(() => {
        if (!articleId) return;

        const fetchArticle = async () => {
            setLoadingArticle(true);
            try {
                const { data, error } = await supabase
                    .from("articles")
                    .select("id, title, sub_title, slug, content, excerpt, seo_title, seo_description, keywords, category_id, published_at, status")
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
                    setExcerpt(data.excerpt || "");
                    setSeoTitle(data.seo_title || "");
                    setSeoDescription(data.seo_description || "");
                    setKeywords(data.keywords || "");
                    setCategory(data.category_id || null);
                    setExistingPublishedAt(data.published_at || null);
                    setCurrentStatus(data.status || null);
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

        const articleData = {
            title,
            sub_title: subTitle,
            slug,
            content: contentValue,
            excerpt,
            category_id: category,
            author_id: user?.id,
            status: targetStatus,
            seo_title: seoTitle || title,
            seo_description: seoDescription || excerpt,
            keywords: keywords,
            published_at: (targetStatus === 'published' || targetStatus === 'shared')
                ? (existingPublishedAt || new Date().toISOString())
                : null,
        };

        const { error } = articleId
            ? await supabase.from("articles").update(articleData).eq("id", articleId)
            : await supabase.from("articles").insert(articleData);

        if (error) {
            alert("Error: " + error.message);
        } else {
            router.push("/admin/articles");
        }
        setLoading(false);
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

    return (
        <Stack gap="lg" maw={1600} mx="auto">
            <LoadingOverlay visible={loading || loadingArticle} />

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
                                <Textarea
                                    label="요약 (Excerpt)"
                                    description="기사 목록에 표시될 내용입니다."
                                    minRows={3}
                                    value={excerpt}
                                    onChange={(e) => setExcerpt(e.currentTarget.value)}
                                    autosize
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
