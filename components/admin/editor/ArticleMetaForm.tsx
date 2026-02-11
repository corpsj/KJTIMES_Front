"use client";

import {
    TextInput,
    Select,
    Stack,
    Paper,
    Textarea,
    Text,
    Box,
    Button,
    Group,
    TagsInput,
} from "@mantine/core";
import { IconSettings } from "@tabler/icons-react";
import type { CategoryOption } from "@/hooks/useArticleForm";

interface ArticleMetaFormProps {
    title: string;
    onTitleChange: (value: string) => void;
    subTitle: string;
    onSubTitleChange: (value: string) => void;
    categories: CategoryOption[];
    category: string | null;
    onCategoryChange: (value: string | null) => void;
    tags: string[];
    onTagsChange: (value: string[]) => void;
    tagOptions: string[];
    slug: string;
    slugAutoLoading: boolean;
    slugSequence: number | null;
    onRegenerateSlug: () => void;
    loading: boolean;
    isSpecialIssueCategory: boolean;
    canCopySpecialIssueLink: boolean;
    loadingArticle: boolean;
    onCopySpecialIssueLink: () => void;
    markDirty: () => void;
}

export default function ArticleMetaForm({
    title,
    onTitleChange,
    subTitle,
    onSubTitleChange,
    categories,
    category,
    onCategoryChange,
    tags,
    onTagsChange,
    tagOptions,
    slug,
    slugAutoLoading,
    slugSequence,
    onRegenerateSlug,
    loading,
    isSpecialIssueCategory,
    canCopySpecialIssueLink,
    loadingArticle,
    onCopySpecialIssueLink,
    markDirty,
}: ArticleMetaFormProps) {
    return (
        <>
            {/* Title and Subtitle in the main editor area */}
            <TextInput
                placeholder="기사 제목을 입력하세요"
                size="xl"
                variant="unstyled"
                styles={{ input: { fontSize: "2.1rem", fontWeight: 800, height: "auto", lineHeight: 1.2 } }}
                value={title}
                onChange={(e) => {
                    onTitleChange(e.currentTarget.value);
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
                    onSubTitleChange(e.currentTarget.value);
                    markDirty();
                }}
            />
        </>
    );
}

/** Sidebar publishing settings panel */
export function PublishSettingsPanel({
    categories,
    category,
    onCategoryChange,
    tags,
    onTagsChange,
    tagOptions,
    slug,
    slugAutoLoading,
    slugSequence,
    onRegenerateSlug,
    loading,
    isSpecialIssueCategory,
    canCopySpecialIssueLink,
    loadingArticle,
    onCopySpecialIssueLink,
    markDirty,
}: Omit<ArticleMetaFormProps, "title" | "onTitleChange" | "subTitle" | "onSubTitleChange">) {
    return (
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
                    onChange={onCategoryChange}
                    searchable
                    required
                    checkIconPosition="right"
                />

                {isSpecialIssueCategory && (
                    <>
                        <Button
                            variant="light"
                            color="blue"
                            onClick={() => void onCopySpecialIssueLink()}
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
                    onClick={onRegenerateSlug}
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
                        onTagsChange(value);
                        markDirty();
                    }}
                    clearable
                />
            </Stack>
        </Paper>
    );
}
