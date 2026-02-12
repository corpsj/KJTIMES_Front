"use client";

import { useState } from "react";
import {
    Title,
    Button,
    Group,
    Stack,
    Grid,
    Paper,
    ActionIcon,
    LoadingOverlay,
    Text,
    Box,
    Alert,
    Badge,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import {
    IconDeviceFloppy,
    IconSend,
    IconArrowLeft,
    IconAlertCircle,
    IconCheck,
    IconEye,
} from "@tabler/icons-react";
import Link from "next/link";

import { useArticleForm } from "@/hooks/useArticleForm";
import { useAutoSave } from "@/hooks/useAutoSave";
import ArticleMetaForm, { PublishSettingsPanel } from "@/components/admin/editor/ArticleMetaForm";
import ThumbnailPicker from "@/components/admin/editor/ThumbnailPicker";
import ArticlePreviewModal from "@/components/admin/editor/ArticlePreviewModal";
import SEOPanel from "@/components/admin/editor/SEOPanel";

export default function AdminWrite() {
    const form = useArticleForm();

    // We need a local setDirty wrapper for useAutoSave since the hook manages dirty internally
    const [, setDirtyForAutoSave] = useState(false);
    const setDirtyExternal = (value: boolean) => {
        setDirtyForAutoSave(value);
        // dirty state is managed inside useArticleForm; this is a pass-through for auto-save
    };

    const { autoSaveStatus } = useAutoSave({
        title: form.title,
        subTitle: form.subTitle,
        slug: form.slug,
        content: form.content,
        contentRef: form.contentRef,
        category: form.category,
        seoTitle: form.seoTitle,
        seoDescription: form.seoDescription,
        keywords: form.keywords,
        thumbnailUrl: form.thumbnailUrl,
        articleId: form.articleId,
        loading: form.loading,
        isEditing: form.isEditing,
        dirty: form.dirty,
        setDirty: setDirtyExternal,
        supabase: form.supabase,
        router: form.router,
        regenerateSlug: form.regenerateSlug,
    });

    const [previewOpened, { open: openPreview, close: closePreview }] = useDisclosure(false);

    const autoSaveLabel =
        autoSaveStatus === "saving"
            ? "자동 저장 중..."
            : autoSaveStatus === "saved"
                ? "자동 저장됨"
                : null;

    const saveStateLabel = form.loading
        ? "저장 중..."
        : autoSaveLabel
            ? autoSaveLabel
            : form.dirty
                ? "저장되지 않은 변경사항 있음"
                : "변경사항 저장됨";

    return (
        <Stack gap="lg" maw={1600} mx="auto">
            <LoadingOverlay visible={form.loading || form.loadingArticle} />

            <ArticlePreviewModal
                opened={previewOpened}
                onClose={closePreview}
                title={form.title}
                subTitle={form.subTitle}
                content={form.content}
                categoryLabel={form.selectedCategoryLabel}
                estimatedReadMinutes={form.estimatedReadMinutes}
                sharePreviewUrl={form.sharePreviewUrl}
            />

            {/* Sticky toolbar */}
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
                            <Title order={3}>{form.isEditing ? "기사 수정" : "기사 작성"}</Title>
                            <Badge
                                variant="light"
                                color={form.loading ? "blue" : autoSaveStatus === "saving" ? "blue" : autoSaveStatus === "saved" ? "green" : form.dirty ? "orange" : "gray"}
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
                            disabled={form.loading || form.loadingArticle}
                            onClick={openPreview}
                        >
                            미리보기
                        </Button>
                        <Button
                            variant="default"
                            leftSection={<IconDeviceFloppy size={18} />}
                            disabled={form.loading || form.loadingArticle}
                            onClick={() => form.handleSubmit("draft")}
                        >
                            임시저장
                        </Button>
                        <Button
                            variant="light"
                            color="orange"
                            disabled={form.isSpecialIssueCategory || form.loading || form.loadingArticle}
                            onClick={() => form.handleSubmit("pending_review")}
                        >
                            승인 요청
                        </Button>
                        <Button
                            variant="light"
                            color="dark"
                            disabled={form.loading || form.loadingArticle}
                            onClick={() => form.handleSubmit("shared")}
                        >
                            {form.isSpecialIssueCategory ? "창간특별호 발행" : "공유 발행"}
                        </Button>
                        {!form.isSpecialIssueCategory && (
                            <Button
                                color="blue"
                                leftSection={<IconSend size={18} />}
                                disabled={form.loading || form.loadingArticle}
                                onClick={() => form.handleSubmit("published")}
                            >
                                발행
                            </Button>
                        )}
                    </Group>
                </Group>
            </Paper>

            {/* Alerts */}
            {form.formError && (
                <Alert color="red" icon={<IconAlertCircle size={16} />} title="저장 오류" withCloseButton onClose={() => form.setFormError(null)}>
                    {form.formError}
                </Alert>
            )}

            {form.formNotice && (
                <Alert color="green" icon={<IconCheck size={16} />} title="완료" withCloseButton onClose={() => form.setFormNotice(null)}>
                    {form.formNotice}
                </Alert>
            )}

            <Grid gutter={24}>
                {/* Main editor column */}
                <Grid.Col span={{ base: 12, lg: 8 }}>
                    <Paper p={{ base: "lg", md: 30 }} radius="md" withBorder shadow="sm" style={{ minHeight: "80vh" }}>
                        <Stack gap="lg">
                            <ArticleMetaForm
                                title={form.title}
                                onTitleChange={form.setTitle}
                                subTitle={form.subTitle}
                                onSubTitleChange={form.setSubTitle}
                                categories={form.categories}
                                category={form.category}
                                onCategoryChange={form.handleCategoryChange}
                                tags={form.tags}
                                onTagsChange={form.setTags}
                                tagOptions={form.tagOptions}
                                slug={form.slug}
                                slugAutoLoading={form.slugAutoLoading}
                                slugSequence={form.slugSequence}
                                onRegenerateSlug={form.handleRegenerateSlug}
                                loading={form.loading}
                                isSpecialIssueCategory={form.isSpecialIssueCategory}
                                canCopySpecialIssueLink={form.canCopySpecialIssueLink}
                                loadingArticle={form.loadingArticle}
                                onCopySpecialIssueLink={form.handleCopySpecialIssueLink}
                                markDirty={form.markDirty}
                            />

                            <RichTextEditor
                                content={form.content}
                                onChange={(value) => {
                                    form.setContent(value);
                                    form.markDirty();
                                }}
                                onImageUpload={form.handleImageUpload}
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
                                    글자 수: {form.charCount.toLocaleString()} | 단어 수: {form.wordCount.toLocaleString()} | 읽기 약 {form.estimatedReadMinutes}분
                                </Text>
                            </Box>
                        </Stack>
                    </Paper>
                </Grid.Col>

                {/* Sidebar */}
                <Grid.Col span={{ base: 12, lg: 4 }}>
                    <Stack gap="md" style={{ position: "sticky", top: 140 }}>
                        <PublishSettingsPanel
                            categories={form.categories}
                            category={form.category}
                            onCategoryChange={form.handleCategoryChange}
                            tags={form.tags}
                            onTagsChange={form.setTags}
                            tagOptions={form.tagOptions}
                            slug={form.slug}
                            slugAutoLoading={form.slugAutoLoading}
                            slugSequence={form.slugSequence}
                            onRegenerateSlug={form.handleRegenerateSlug}
                            loading={form.loading}
                            isSpecialIssueCategory={form.isSpecialIssueCategory}
                            canCopySpecialIssueLink={form.canCopySpecialIssueLink}
                            loadingArticle={form.loadingArticle}
                            onCopySpecialIssueLink={form.handleCopySpecialIssueLink}
                            markDirty={form.markDirty}
                        />

                        <ThumbnailPicker
                            thumbnailUrl={form.thumbnailUrl}
                            onThumbnailChange={form.setThumbnailUrl}
                            contentImageUrls={form.contentImageUrls}
                            onFileUpload={form.handleThumbnailFileUpload}
                            markDirty={form.markDirty}
                        />

                        <SEOPanel
                            seoTitle={form.seoTitle}
                            onSeoTitleChange={form.setSeoTitle}
                            seoDescription={form.seoDescription}
                            onSeoDescriptionChange={form.setSeoDescription}
                            keywords={form.keywords}
                            onKeywordsChange={form.setKeywords}
                            onAutoFill={form.fillSeoFromContent}
                            markDirty={form.markDirty}
                        />
                    </Stack>
                </Grid.Col>
            </Grid>
        </Stack>
    );
}
