"use client";

import { Badge, Box, Container, Divider, Grid, GridCol, Group, Image, Stack, Text, Title, UnstyledButton } from "@mantine/core";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import Link from "next/link";
import { Article } from "@/types";
import { formatKoreanDate } from "@/utils/date";
import { LINKS } from "@/constants/navigation";
import { normalizeArticleHtml } from "@/utils/articleHtml";
import { ShareActions } from "@/components/shared/ShareActions";
import styles from "@/components/shared/ArticleDetail.module.css";

function dedupeArticles(articles: Article[], excludeId: string) {
    const seen = new Set<string>([excludeId]);
    return articles.filter((item) => {
        if (!item?.id || seen.has(item.id)) return false;
        seen.add(item.id);
        return true;
    });
}

export function DesktopArticleDetail({
    article,
    relatedArticles = [],
    seriesArticles = [],
    authorArticles = [],
    articleTags = [],
    seriesLabel = null,
    shareUrl = "",
    prevArticle = null,
    nextArticle = null,
}: {
    article: Article & { content: string };
    relatedArticles?: Article[];
    seriesArticles?: Article[];
    authorArticles?: Article[];
    articleTags?: string[];
    seriesLabel?: string | null;
    shareUrl?: string;
    prevArticle?: Article | null;
    nextArticle?: Article | null;
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
    const mergedArticles = dedupeArticles(
        [...relatedArticles, ...seriesArticles, ...authorArticles],
        article.id
    );
    const featuredRelated = mergedArticles.slice(0, 3);
    const rankedRelated = mergedArticles.slice(0, 8);
    const featuredSeries = (seriesArticles.length > 0 ? seriesArticles : mergedArticles).slice(0, 3);
    const featuredAuthor = (authorArticles.length > 0 ? authorArticles : mergedArticles).slice(0, 3);
    const leadNews = mergedArticles[0] || null;
    const leadRanked = mergedArticles.slice(1, 6);
    const photoStrip = mergedArticles.slice(6, 10).length > 0 ? mergedArticles.slice(6, 10) : mergedArticles.slice(0, 4);
    const renderedTags = articleTags.slice(0, 6);
    const views = article.views || 0;
    const authorInitial = (authorName || "편집국").trim().charAt(0);
    const normalizedContent = normalizeArticleHtml(article.content);
    const categoryLinks = LINKS.filter((link) => link.href !== "/");

    return (
        <Box component="section" className={styles.chosunDesktopWrap}>
            <Container size={1220} className={styles.chosunDesktopContainer}>
                <Grid gutter={22} align="flex-start">
                    <GridCol span={{ base: 12, md: 8 }}>
                        <article className={styles.chosunArticlePane}>
                            {/* Top meta line */}
                            <Group gap="xs" wrap="wrap" className={styles.chosunTopLine}>
                                {primaryCategory && (
                                    <Badge
                                        size="sm"
                                        variant="filled"
                                        component={Link}
                                        href={`/${primaryCategory.slug}`}
                                        className={styles.chosunCategoryBadge}
                                    >
                                        {primaryCategory.name}
                                    </Badge>
                                )}
                                <Text size="xs" className={styles.chosunMetaMuted}>
                                    입력 {formatKoreanDate(publishedDate)}
                                </Text>
                                {showUpdated && (
                                    <Text size="xs" className={styles.chosunMetaMuted}>
                                        수정 {formatKoreanDate(updatedDate)}
                                    </Text>
                                )}
                                <Text size="xs" className={styles.chosunMetaMuted}>조회 {views.toLocaleString()}</Text>
                            </Group>

                            {/* Title */}
                            <Title order={1} className={styles.chosunTitle}>
                                {article.title}
                            </Title>

                            {/* Subtitle */}
                            {article.sub_title && (
                                <Text size="lg" className={styles.chosunSubtitle}>
                                    {article.sub_title}
                                </Text>
                            )}

                            {/* Tags */}
                            {renderedTags.length > 0 && (
                                <Group gap={6} className={styles.chosunTagRow}>
                                    {renderedTags.map((tag) => (
                                        <Text key={tag} size="xs" className={styles.chosunTag}>
                                            #{tag}
                                        </Text>
                                    ))}
                                </Group>
                            )}

                            {/* Reporter + Share */}
                            <Group className={styles.chosunReporterRow} justify="space-between" wrap="nowrap" align="flex-start">
                                <Group gap="sm" wrap="nowrap">
                                    <Box className={styles.chosunReporterInitial}>{authorInitial}</Box>
                                    <Stack gap={1}>
                                        <Text size="sm" className={styles.chosunReporterName}>{authorName} 기자</Text>
                                        <Text size="xs" className={styles.chosunMetaMuted}>광전타임즈</Text>
                                    </Stack>
                                </Group>
                                {shareUrl && <ShareActions title={article.title} url={shareUrl} tone="light" compact />}
                            </Group>

                            {/* Hero image */}
                            {article.thumbnail_url && (
                                <Box component="figure" className={styles.chosunHeroFigure}>
                                    <Image
                                        src={article.thumbnail_url}
                                        alt={`${article.title} 대표 이미지`}
                                        className={styles.chosunHeroImage}
                                    />
                                    <Text component="figcaption" size="xs" className={styles.chosunHeroCaption}>
                                        {article.excerpt || article.summary || `${article.title} 관련 이미지`}
                                    </Text>
                                </Box>
                            )}

                            {/* Summary lead */}
                            {article.summary && (
                                <Text size="md" className={styles.chosunSummaryLead}>
                                    {article.summary}
                                </Text>
                            )}

                            <Divider className={styles.chosunDivider} my="md" />

                            {/* Article body */}
                            <div
                                className={`${styles.chosunBody} tiptap-content`}
                                dangerouslySetInnerHTML={{ __html: normalizedContent }}
                            />

                            {/* Bottom share bar */}
                            {shareUrl && (
                                <Box className={styles.chosunBottomShareBar}>
                                    <ShareActions title={article.title} url={shareUrl} tone="light" />
                                </Box>
                            )}

                            {/* Prev / Next navigation */}
                            {(prevArticle || nextArticle) && (
                                <Box className={styles.chosunPrevNext}>
                                    {prevArticle ? (
                                        <UnstyledButton
                                            component={Link}
                                            href={`/article/${prevArticle.id}`}
                                            className={styles.chosunPrevNextItem}
                                        >
                                            <Group gap={8} wrap="nowrap" align="flex-start">
                                                <IconChevronLeft size={18} style={{ color: "#64748b", flexShrink: 0, marginTop: 2 }} />
                                                <Stack gap={2}>
                                                    <Text size="xs" className={styles.chosunMetaMuted}>이전 기사</Text>
                                                    <Text size="sm" fw={600} lineClamp={1} className={styles.chosunPrevNextTitle}>
                                                        {prevArticle.title}
                                                    </Text>
                                                </Stack>
                                            </Group>
                                        </UnstyledButton>
                                    ) : (
                                        <Box />
                                    )}
                                    {nextArticle ? (
                                        <UnstyledButton
                                            component={Link}
                                            href={`/article/${nextArticle.id}`}
                                            className={`${styles.chosunPrevNextItem} ${styles.chosunPrevNextItemRight}`}
                                        >
                                            <Group gap={8} wrap="nowrap" align="flex-start" justify="flex-end">
                                                <Stack gap={2} style={{ textAlign: "right" }}>
                                                    <Text size="xs" className={styles.chosunMetaMuted}>다음 기사</Text>
                                                    <Text size="sm" fw={600} lineClamp={1} className={styles.chosunPrevNextTitle}>
                                                        {nextArticle.title}
                                                    </Text>
                                                </Stack>
                                                <IconChevronRight size={18} style={{ color: "#64748b", flexShrink: 0, marginTop: 2 }} />
                                            </Group>
                                        </UnstyledButton>
                                    ) : (
                                        <Box />
                                    )}
                                </Box>
                            )}

                            {/* Related articles inline */}
                            <Box className={styles.chosunModule}>
                                <Title order={4} className={styles.chosunModuleTitle}>이 기사와 함께 본 기사</Title>
                                {featuredRelated.length > 0 ? (
                                    <div className={styles.chosunInlineList}>
                                        {featuredRelated.map((related) => (
                                            <Link
                                                key={related.id}
                                                href={`/article/${related.id}`}
                                                className={styles.chosunInlineItem}
                                            >
                                                {related.thumbnail_url && (
                                                    <Image
                                                        src={related.thumbnail_url}
                                                        alt={`${related.title} 썸네일`}
                                                        className={styles.chosunInlineThumb}
                                                    />
                                                )}
                                                <Stack gap={2} style={{ flex: 1 }}>
                                                    <Text size="sm" fw={600} className={styles.chosunInlineTitle} lineClamp={2}>
                                                        {related.title}
                                                    </Text>
                                                    <Text size="xs" className={styles.chosunMetaMuted}>
                                                        {formatKoreanDate(related.published_at || related.created_at)}
                                                    </Text>
                                                </Stack>
                                            </Link>
                                        ))}
                                    </div>
                                ) : (
                                    <Text size="sm" className={styles.chosunEmptyText}>
                                        함께 읽을 기사를 준비 중입니다.
                                    </Text>
                                )}
                            </Box>

                            {/* Reporter card */}
                            <Box className={styles.chosunReporterCard}>
                                <Box className={styles.chosunReporterCardAvatar}>{authorInitial}</Box>
                                <Stack gap={2} style={{ flex: 1 }}>
                                    <Text size="sm" className={styles.chosunReporterCardName}>{authorName} 기자</Text>
                                    <Text size="xs" className={styles.chosunMetaMuted}>
                                        현장 중심의 정치·사회 이슈를 취재합니다.
                                    </Text>
                                </Stack>
                                <button type="button" className={styles.chosunFollowButton}>
                                    기자 구독
                                </button>
                            </Box>

                            {/* Ad strip */}
                            <Box className={styles.chosunAdStrip}>
                                <Text size="xs" className={styles.chosunAdLabel}>ADVERTISEMENT</Text>
                                <Box className={styles.chosunAdInner}>광고 영역</Box>
                            </Box>

                            {/* Popular news */}
                            <Box className={styles.chosunModule}>
                                <Title order={4} className={styles.chosunModuleTitle}>
                                    {primaryCategory?.name || "종합"} 많이 본 뉴스
                                </Title>
                                {leadNews ? (
                                    <div className={styles.chosunLeadGrid}>
                                        <Link href={`/article/${leadNews.id}`} className={styles.chosunLeadCard}>
                                            {leadNews.thumbnail_url && (
                                                <Image
                                                    src={leadNews.thumbnail_url}
                                                    alt={`${leadNews.title} 썸네일`}
                                                    className={styles.chosunLeadImage}
                                                />
                                            )}
                                            <Text size="md" fw={700} className={styles.chosunLeadTitle} lineClamp={2}>
                                                {leadNews.title}
                                            </Text>
                                            <Text size="xs" className={styles.chosunMetaMuted}>
                                                {formatKoreanDate(leadNews.published_at || leadNews.created_at)}
                                            </Text>
                                        </Link>
                                        <ol className={styles.chosunRankList}>
                                            {leadRanked.map((related, index) => (
                                                <li key={`lead-ranked-${related.id}`} className={styles.chosunRankItem}>
                                                    <Link href={`/article/${related.id}`} className={styles.chosunRankLink}>
                                                        <span className={styles.chosunRankNumber}>{index + 1}</span>
                                                        <span className={styles.chosunRankTitle}>{related.title}</span>
                                                    </Link>
                                                </li>
                                            ))}
                                        </ol>
                                    </div>
                                ) : (
                                    <Text size="sm" className={styles.chosunEmptyText}>
                                        많이 본 기사를 준비 중입니다.
                                    </Text>
                                )}

                                {photoStrip.length > 0 && (
                                    <div className={styles.chosunPhotoStrip}>
                                        {photoStrip.map((related) => (
                                            <Link
                                                key={`photo-${related.id}`}
                                                href={`/article/${related.id}`}
                                                className={styles.chosunPhotoItem}
                                            >
                                                {related.thumbnail_url && (
                                                    <Image
                                                        src={related.thumbnail_url}
                                                        alt={`${related.title} 썸네일`}
                                                        className={styles.chosunPhotoThumb}
                                                    />
                                                )}
                                                <Text size="xs" className={styles.chosunPhotoTitle} lineClamp={2}>
                                                    {related.title}
                                                </Text>
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </Box>

                            {/* Dual module: Series + Author articles */}
                            <div className={styles.chosunDualModule}>
                                <Box className={styles.chosunSubModule}>
                                    <Title order={5} className={styles.chosunSubModuleTitle}>
                                        {seriesLabel ? `시리즈 · ${seriesLabel}` : "같은 이슈"}
                                    </Title>
                                    <div className={styles.chosunSubList}>
                                        {featuredSeries.map((related) => (
                                            <Link
                                                key={`series-${related.id}`}
                                                href={`/article/${related.id}`}
                                                className={styles.chosunSubItem}
                                            >
                                                <Text size="sm" className={styles.chosunSubItemTitle} lineClamp={2}>
                                                    {related.title}
                                                </Text>
                                            </Link>
                                        ))}
                                    </div>
                                </Box>
                                <Box className={styles.chosunSubModule}>
                                    <Title order={5} className={styles.chosunSubModuleTitle}>
                                        {authorName} 기자의 다른 기사
                                    </Title>
                                    <div className={styles.chosunSubList}>
                                        {featuredAuthor.map((related) => (
                                            <Link
                                                key={`author-${related.id}`}
                                                href={`/article/${related.id}`}
                                                className={styles.chosunSubItem}
                                            >
                                                <Text size="sm" className={styles.chosunSubItemTitle} lineClamp={2}>
                                                    {related.title}
                                                </Text>
                                            </Link>
                                        ))}
                                    </div>
                                </Box>
                            </div>

                            {/* Article info table */}
                            <Box className={styles.chosunInfoTable}>
                                <Title order={5} className={styles.chosunSubModuleTitle}>기사 정보</Title>
                                <div className={styles.chosunInfoRow}>
                                    <span>카테고리</span>
                                    <span>{primaryCategory?.name || "미분류"}</span>
                                </div>
                                <div className={styles.chosunInfoRow}>
                                    <span>기자</span>
                                    <span>{authorName}</span>
                                </div>
                                <div className={styles.chosunInfoRow}>
                                    <span>입력</span>
                                    <span>{formatKoreanDate(publishedDate)}</span>
                                </div>
                                {showUpdated && (
                                    <div className={styles.chosunInfoRow}>
                                        <span>수정</span>
                                        <span>{formatKoreanDate(updatedDate)}</span>
                                    </div>
                                )}
                                <div className={styles.chosunInfoRow}>
                                    <span>조회</span>
                                    <span>{views.toLocaleString()}</span>
                                </div>
                            </Box>
                        </article>
                    </GridCol>

                    {/* Sidebar */}
                    <GridCol span={{ base: 12, md: 4 }}>
                        <aside className={styles.chosunAsidePane}>
                            <Box className={styles.chosunAsideModule}>
                                <Text size="xs" className={styles.chosunAsideLabel}>실시간 랭킹</Text>
                                {rankedRelated.length > 0 ? (
                                    <ol className={styles.chosunAsideRankList}>
                                        {rankedRelated.map((related, index) => (
                                            <li key={`aside-ranked-${related.id}`} className={styles.chosunAsideRankItem}>
                                                <Link href={`/article/${related.id}`} className={styles.chosunAsideRankLink}>
                                                    <span className={styles.chosunAsideRankNumber}>{index + 1}</span>
                                                    <span className={styles.chosunAsideRankTitle}>{related.title}</span>
                                                </Link>
                                            </li>
                                        ))}
                                    </ol>
                                ) : (
                                    <Text size="sm" className={styles.chosunEmptyText}>
                                        같은 카테고리의 최신 기사를 준비 중입니다.
                                    </Text>
                                )}
                            </Box>

                            <Box className={styles.chosunAsideModule}>
                                <Text size="xs" className={styles.chosunAsideLabel}>카테고리</Text>
                                <div className={styles.chosunAsideLinkGrid}>
                                    {categoryLinks.map((categoryLink) => (
                                        <Link
                                            key={`aside-category-${categoryLink.href}`}
                                            href={categoryLink.href}
                                            className={`${styles.chosunAsideCategoryLink} ${primaryCategory && categoryLink.href === `/${primaryCategory.slug}` ? styles.chosunAsideCategoryLinkActive : ""}`}
                                        >
                                            {categoryLink.label}
                                        </Link>
                                    ))}
                                </div>
                            </Box>

                            {renderedTags.length > 0 && (
                                <Box className={styles.chosunAsideModule}>
                                    <Text size="xs" className={styles.chosunAsideLabel}>태그</Text>
                                    <Group gap={6} className={styles.chosunAsideTagRow}>
                                        {renderedTags.map((tag) => (
                                            <Text key={`aside-tag-${tag}`} size="xs" className={styles.chosunAsideTag}>
                                                #{tag}
                                            </Text>
                                        ))}
                                    </Group>
                                </Box>
                            )}
                        </aside>
                    </GridCol>
                </Grid>
            </Container>
        </Box>
    );
}
