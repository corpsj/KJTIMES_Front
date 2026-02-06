"use client";

import { Badge, Box, Container, Divider, Group, Image, Stack, Text, Title } from "@mantine/core";
import Link from "next/link";
import { Article } from "@/types";
import { formatKoreanDate } from "@/utils/date";
import { LINKS } from "@/constants/navigation";
import { normalizeArticleHtml } from "@/utils/articleHtml";
import { ShareActions } from "@/components/shared/ShareActions";
import styles from "@/components/shared/ArticleDetail.module.css";

export function MobileArticleDetail({
    article,
    relatedArticles = [],
    seriesArticles = [],
    authorArticles = [],
    articleTags = [],
    seriesLabel = null,
    shareUrl = "",
}: {
    article: Article & { content: string };
    relatedArticles?: Article[];
    seriesArticles?: Article[];
    authorArticles?: Article[];
    articleTags?: string[];
    seriesLabel?: string | null;
    shareUrl?: string;
}) {
    if (!article) return <div>Article not found</div>;
    const publishedDate = article.published_at || article.created_at;
    const updatedDate = article.updated_at;
    const authorName = article.author?.full_name || "편집국";
    const showUpdated = Boolean(updatedDate && updatedDate !== publishedDate);
    const categories = Array.isArray(article.categories)
        ? article.categories
        : article.categories
            ? [article.categories]
            : [];
    const primaryCategory = categories[0] || null;
    const featuredRelated = relatedArticles.slice(0, 4);
    const rankedRelated = relatedArticles.slice(0, 5);
    const featuredSeries = seriesArticles.slice(0, 3);
    const featuredAuthor = authorArticles.slice(0, 3);
    const authorInitial = (authorName || "편집국").trim().charAt(0);
    const normalizedContent = normalizeArticleHtml(article.content);
    const categoryLinks = LINKS.filter((link) => link.href !== "/");

    return (
        <Box component="section" className={styles.mobileBackdrop}>
            <Container size="md" px={0}>
                <article className={styles.mobileArticleCard}>
                    <Text size="xs" className={styles.mobileBreadcrumb}>
                        홈 {primaryCategory ? `> ${primaryCategory.name}` : "> 기사"}
                    </Text>

                    <Group justify="space-between" align="flex-start" className={styles.mobileMetaTop} wrap="nowrap">
                        <Group gap={6} wrap="wrap">
                            {categories.map((category) => (
                                <Badge
                                    key={category.slug}
                                    size="sm"
                                    variant="filled"
                                    component={Link}
                                    href={`/${category.slug}`}
                                    className={styles.categoryBadge}
                                >
                                    {category.name}
                                </Badge>
                            ))}
                        </Group>
                        <Text size="xs" className={styles.metaText}>
                            {formatKoreanDate(publishedDate)}
                        </Text>
                    </Group>
                    {articleTags.length > 0 && (
                        <Group gap={6} className={styles.tagRow}>
                            {articleTags.map((tag) => (
                                <Text key={tag} size="xs" className={styles.inlineTag}>
                                    #{tag}
                                </Text>
                            ))}
                        </Group>
                    )}

                    <Title order={1} className={styles.mobileTitle}>
                        {article.title}
                    </Title>

                    {article.sub_title && (
                        <Text size="md" className={styles.subtitle} mt="sm">
                            {article.sub_title}
                        </Text>
                    )}

                    <Group gap="xs" className={styles.mobileAuthorRow} wrap="nowrap">
                        <Box className={styles.authorMark}>{authorInitial}</Box>
                        <Text size="xs" className={styles.metaText}>
                            {authorName}
                            {showUpdated && ` · 수정 ${formatKoreanDate(updatedDate)}`}
                        </Text>
                    </Group>

                    {article.thumbnail_url && (
                        <Box component="figure" className={styles.heroFigure}>
                            <Image
                                src={article.thumbnail_url}
                                alt={`${article.title} 대표 이미지`}
                                className={styles.heroImage}
                            />
                            <Text component="figcaption" size="xs" className={styles.heroCaption}>
                                {article.excerpt || article.summary || `${article.title} 관련 이미지`}
                            </Text>
                        </Box>
                    )}

                    {article.summary && (
                        <Text size="sm" className={styles.summaryLead} mt="sm">
                            {article.summary}
                        </Text>
                    )}

                    {shareUrl && (
                        <Box className={styles.shareWrap}>
                            <ShareActions title={article.title} url={shareUrl} tone="light" compact />
                        </Box>
                    )}

                    <Divider className={styles.separator} my="sm" />

                    <div
                        className={`${styles.articleBody} ${styles.mobileBody} tiptap-content`}
                        dangerouslySetInnerHTML={{ __html: normalizedContent }}
                    />

                    <Box className={styles.mobileReporterCard}>
                        <Box className={styles.mobileReporterCardAvatar}>{authorInitial}</Box>
                        <Stack gap={2} style={{ flex: 1 }}>
                            <Text size="sm" fw={700} className={styles.relatedTitle}>{authorName} 기자</Text>
                            <Text size="xs" className={styles.metaText}>현장 중심 이슈를 취재합니다.</Text>
                        </Stack>
                        <button type="button" className={styles.mobileFollowButton}>기자 구독</button>
                    </Box>

                    <Box className={styles.mobileAdStrip}>
                        <Text size="xs" className={styles.mobileAdLabel}>ADVERTISEMENT</Text>
                        <Box className={styles.mobileAdInner}>광고 영역</Box>
                    </Box>

                    {featuredRelated.length > 0 && (
                        <Box className={styles.mobileRelatedSection}>
                            <Divider className={styles.separator} my="md" />
                            <Title order={4} className={styles.mobileRelatedHeading}>함께 읽을 기사</Title>
                            <div className={styles.relatedList}>
                                {featuredRelated.map((related) => (
                                    <Link key={related.id} href={`/article/${related.id}`} className={styles.relatedItem}>
                                        <Group gap="sm" wrap="nowrap" align="flex-start">
                                            {related.thumbnail_url && (
                                                <Image
                                                    src={related.thumbnail_url}
                                                    alt={`${related.title} 썸네일`}
                                                    className={styles.relatedThumb}
                                                />
                                            )}
                                            <Stack gap={4} style={{ flex: 1 }}>
                                                <Text size="sm" fw={600} className={styles.relatedTitle} lineClamp={2}>
                                                    {related.title}
                                                </Text>
                                                <Text size="xs" className={styles.relatedMeta}>
                                                    {formatKoreanDate(related.published_at || related.created_at)}
                                                </Text>
                                            </Stack>
                                        </Group>
                                    </Link>
                                ))}
                            </div>
                        </Box>
                    )}

                    <Box className={styles.mobileInfoPanel}>
                        <Title order={5} className={styles.blockSubHeading}>이 시각 많이 본 기사</Title>
                        {rankedRelated.length > 0 ? (
                            <ol className={styles.rankList}>
                                {rankedRelated.map((related, index) => (
                                    <li key={`mobile-ranked-${related.id}`} className={styles.rankItem}>
                                        <Link href={`/article/${related.id}`} className={styles.rankLink}>
                                            <span className={styles.rankNumber}>{index + 1}</span>
                                            <span className={styles.rankTitle}>{related.title}</span>
                                        </Link>
                                    </li>
                                ))}
                            </ol>
                        ) : (
                            <Text size="sm" className={styles.emptyText}>많이 본 기사를 준비 중입니다.</Text>
                        )}

                        <Divider className={styles.separator} my="sm" />
                        <Text size="xs" className={styles.metaText}>
                            카테고리: {primaryCategory?.name || "미분류"}
                        </Text>
                        <Text size="xs" className={styles.metaText}>
                            입력: {formatKoreanDate(publishedDate)}
                        </Text>
                        {showUpdated && (
                            <Text size="xs" className={styles.metaText}>
                                수정: {formatKoreanDate(updatedDate)}
                            </Text>
                        )}

                        <Divider className={styles.separator} my="sm" />
                        <div className={styles.mobileCategoryGrid}>
                            {categoryLinks.map((link) => (
                                <Link
                                    key={`mobile-category-${link.href}`}
                                    href={link.href}
                                    className={`${styles.mobileCategoryLink} ${primaryCategory && link.href === `/${primaryCategory.slug}` ? styles.mobileCategoryLinkActive : ""}`}
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </div>
                        {articleTags.length > 0 && (
                            <Group gap={6} className={styles.mobileTagRow}>
                                {articleTags.map((tag) => (
                                    <Text key={`mobile-tag-${tag}`} size="xs" className={styles.inlineTag}>
                                        #{tag}
                                    </Text>
                                ))}
                            </Group>
                        )}
                    </Box>

                    {featuredSeries.length > 0 && (
                        <Box className={styles.mobileInfoPanel}>
                            <Title order={5} className={styles.blockSubHeading}>
                                {seriesLabel ? `시리즈 · ${seriesLabel}` : "같은 주제의 시리즈"}
                            </Title>
                            <div className={styles.authorList}>
                                {featuredSeries.map((related) => (
                                    <Link key={`mobile-series-${related.id}`} href={`/article/${related.id}`} className={styles.authorListItem}>
                                        <Text size="sm" fw={600} className={styles.relatedTitle} lineClamp={2}>
                                            {related.title}
                                        </Text>
                                        <Text size="xs" className={styles.relatedMeta}>
                                            {formatKoreanDate(related.published_at || related.created_at)}
                                        </Text>
                                    </Link>
                                ))}
                            </div>
                        </Box>
                    )}

                    {featuredAuthor.length > 0 && (
                        <Box className={styles.mobileInfoPanel}>
                            <Title order={5} className={styles.blockSubHeading}>{authorName} 기자의 다른 기사</Title>
                            <div className={styles.authorList}>
                                {featuredAuthor.map((related) => (
                                    <Link key={`mobile-author-${related.id}`} href={`/article/${related.id}`} className={styles.authorListItem}>
                                        <Text size="sm" fw={600} className={styles.relatedTitle} lineClamp={2}>
                                            {related.title}
                                        </Text>
                                        <Text size="xs" className={styles.relatedMeta}>
                                            {formatKoreanDate(related.published_at || related.created_at)}
                                        </Text>
                                    </Link>
                                ))}
                            </div>
                        </Box>
                    )}
                </article>
            </Container>
        </Box>
    );
}
