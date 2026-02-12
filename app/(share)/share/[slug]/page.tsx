import Link from "next/link";
import { Container, Image, Text, Title, Box, Stack, Divider, Center } from "@mantine/core";
import { createClient as createAnonClient } from "@supabase/supabase-js";
import { normalizeArticleHtml } from "@/utils/articleHtml";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";
const SPECIAL_ISSUE_CATEGORY_SLUG = "special-edition";
const RELATED_ARTICLE_LIMIT = 16;
const SIDEBAR_LATEST_LIMIT = 6;
const SIDEBAR_POPULAR_LIMIT = 5;
const MOBILE_RELATED_LIMIT = 5;

type SharedArticle = {
  id: string;
  title: string;
  slug?: string | null;
  sub_title?: string | null;
  excerpt?: string | null;
  summary?: string | null;
  content?: string | null;
  thumbnail_url?: string | null;
  created_at: string;
  published_at?: string | null;
  updated_at?: string | null;
  views?: number | null;
  category_id?: string | null;
  categories?: { name?: string | null; slug?: string | null }[] | { name?: string | null; slug?: string | null } | null;
};

type RelatedSpecialIssueArticle = {
  id: string;
  title: string;
  slug?: string | null;
  excerpt?: string | null;
  summary?: string | null;
  created_at: string;
  published_at?: string | null;
  views?: number | null;
};

const getCategorySlug = (categories: SharedArticle["categories"]) => {
  if (!categories) return null;
  if (Array.isArray(categories)) {
    return categories[0]?.slug || null;
  }
  return categories.slug || null;
};

const formatArticleDate = (article: { created_at: string; published_at?: string | null }) => {
  const source = article.published_at || article.created_at;
  return new Date(source).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
};

const formatArticleDateTime = (value?: string | null) => {
  if (!value) return "-";
  return new Date(value).toLocaleString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const extractPlainText = (html: string) => {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
};

const calculateReadMinutes = (html: string) => {
  const plainText = extractPlainText(html);
  if (!plainText) return 1;
  const words = plainText.split(" ").filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 260));
};

export default async function SharedArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = createAnonClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } }
  );
  const { data: articleData, error } = await supabase
    .from("articles")
    .select("id, title, slug, sub_title, excerpt, summary, content, thumbnail_url, created_at, published_at, updated_at, views, category_id, categories(name, slug)")
    .eq("slug", slug)
    .in("status", ["published", "shared"])
    .single();

  const article = (articleData as SharedArticle | null) || null;
  const articleCategorySlug = getCategorySlug(article?.categories);
  const isSpecialIssueArticle = articleCategorySlug === SPECIAL_ISSUE_CATEGORY_SLUG;
  const normalizedContent = normalizeArticleHtml(article?.content || "");
  let relatedSpecialIssueArticles: RelatedSpecialIssueArticle[] = [];

  if (error) {
    console.error("Shared article fetch failed:", error);
  }

  if (article?.category_id && isSpecialIssueArticle) {
    const { data: relatedData, error: relatedError } = await supabase
      .from("articles")
      .select("id, title, slug, excerpt, summary, created_at, published_at, views")
      .eq("category_id", article.category_id)
      .in("status", ["published", "shared"])
      .not("slug", "is", null)
      .order("published_at", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false })
      .limit(RELATED_ARTICLE_LIMIT);

    if (relatedError) {
      console.error("Related special issue fetch failed:", relatedError);
    } else {
      relatedSpecialIssueArticles = ((relatedData as RelatedSpecialIssueArticle[] | null) || []).filter(
        (item) => Boolean(item.slug)
      );
    }
  }

  const sectionName = Array.isArray(article?.categories)
    ? article?.categories[0]?.name || SPECIAL_ISSUE_CATEGORY_SLUG
    : article?.categories?.name || SPECIAL_ISSUE_CATEGORY_SLUG;
  const publishedSource = article?.published_at || article?.created_at;
  const lastUpdated = article?.updated_at || null;
  const isUpdated =
    Boolean(publishedSource && lastUpdated) &&
    Math.abs(new Date(lastUpdated || "").getTime() - new Date(publishedSource || "").getTime()) > 60 * 1000;
  const readMinutes = calculateReadMinutes(article?.content || "");
  const deckText = article?.excerpt || article?.summary || "";

  const currentArticleCard = relatedSpecialIssueArticles.find((item) => item.slug === article?.slug) || null;
  const circulationCandidates = relatedSpecialIssueArticles.filter((item) => item.slug !== article?.slug);
  const nextArticle = circulationCandidates[0] || null;
  const latestArticles = circulationCandidates.slice(0, SIDEBAR_LATEST_LIMIT);
  const popularArticles = [...circulationCandidates]
    .sort((a, b) => (b.views || 0) - (a.views || 0))
    .slice(0, SIDEBAR_POPULAR_LIMIT);
  const mobileMoreArticles = circulationCandidates.slice(1, MOBILE_RELATED_LIMIT + 1);

  const renderHeader = () => (
    <Box py="xl" px="md" style={{ borderBottom: "2px solid var(--mantine-color-newsHeadline-9)" }}>
      <Container size="lg">
        <Center>
          <Stack align="center" gap={5}>
            <Image
              src="/brand/KJ_sloganLogo.png"
              h={85}
              w="auto"
              alt="광전타임즈"
              fit="contain"
            />
          </Stack>
        </Center>
      </Container>
    </Box>
  );

  const renderFooter = () => (
    <Box py={80} bg="gray.0" mt={100} style={{ borderTop: "1px solid var(--mantine-color-newsBorder-0)" }}>
      <Container size="lg">
        <Stack align="center" gap="sm">
          <Text fw={700} size="lg">
            광전타임즈
          </Text>
          <Text size="sm" c="dimmed" ta="center">
            전남 함평군 함평읍 영수길 148 2층
            <br />
            발행·편집인: 장혁훈 | 대표: 선종인 | 전화: 010-9428-5361 | 팩스: 0504-255-5361 | 이메일: jebo@kjtimes.co.kr
          </Text>
          <Text size="xs" c="dimmed" mt="xl">
            Copyright © Kwangjeon Times. All rights reserved.
          </Text>
        </Stack>
      </Container>
    </Box>
  );

  const renderDesktopSidebar = () => (
    <Box className={styles.editorialSidebar}>
      <section className={styles.specialIssueSection}>
        <div className={styles.specialIssueHeading}>
          <div className={styles.specialIssueTitle}>지금 읽는 기사</div>
        </div>
        {currentArticleCard ? (
          <div className={`${styles.specialIssueItem} ${styles.specialIssueItemActive}`}>
            <div className={styles.specialIssueItemTitle}>{currentArticleCard.title}</div>
            <div className={styles.specialIssueItemDate}>현재 기사 · {formatArticleDate(currentArticleCard)}</div>
          </div>
        ) : (
          <div className={styles.specialIssueEmpty}>현재 기사 정보를 불러올 수 없습니다.</div>
        )}
      </section>

      <section className={styles.specialIssueSection}>
        <div className={styles.specialIssueHeading}>
          <div className={styles.specialIssueTitle}>이어 읽기</div>
        </div>
        <div className={styles.specialIssueList}>
          {latestArticles.length === 0 ? (
            <div className={styles.specialIssueEmpty}>연결할 기사가 없습니다.</div>
          ) : (
            latestArticles.map((relatedArticle) => (
              <Link key={relatedArticle.id} href={`/share/${relatedArticle.slug}`} className={styles.specialIssueItem}>
                <div className={styles.specialIssueItemTitle}>{relatedArticle.title}</div>
                <div className={styles.specialIssueItemDate}>{formatArticleDate(relatedArticle)}</div>
              </Link>
            ))
          )}
        </div>
      </section>

      <section className={styles.specialIssueSection}>
        <div className={styles.specialIssueHeading}>
          <div className={styles.specialIssueTitle}>많이 본 창간특별호</div>
        </div>
        <div className={styles.specialIssueList}>
          {popularArticles.length === 0 ? (
            <div className={styles.specialIssueEmpty}>집계 가능한 기사가 없습니다.</div>
          ) : (
            popularArticles.map((relatedArticle) => (
              <Link key={relatedArticle.id} href={`/share/${relatedArticle.slug}`} className={styles.specialIssueItem}>
                <div className={styles.specialIssueItemTitle}>{relatedArticle.title}</div>
                <div className={styles.specialIssueItemDate}>
                  조회 {(relatedArticle.views || 0).toLocaleString()} · {formatArticleDate(relatedArticle)}
                </div>
              </Link>
            ))
          )}
        </div>
      </section>
    </Box>
  );

  const renderMobileRelatedSection = () => (
    <Box className={`${styles.specialIssueSection} ${styles.mobileRelatedSection}`}>
      <div className={styles.specialIssueHeading}>
        <div className={styles.specialIssueTitle}>창간특별호</div>
      </div>

      {nextArticle ? (
        <Link href={`/share/${nextArticle.slug}`} className={styles.mobileNextCard}>
          <div className={styles.mobileNextLabel}>다음 기사 읽기</div>
          <div className={styles.mobileNextTitle}>{nextArticle.title}</div>
          <div className={styles.mobileNextExcerpt}>
            {(nextArticle.excerpt || nextArticle.summary || "창간특별호 연속 읽기를 이어가세요.").slice(0, 120)}
          </div>
          <div className={styles.mobileNextMeta}>{formatArticleDate(nextArticle)}</div>
        </Link>
      ) : (
        <div className={styles.specialIssueEmpty}>다음으로 읽을 창간특별호 기사가 없습니다.</div>
      )}

      <div className={styles.specialIssueList}>
        {mobileMoreArticles.map((relatedArticle) => (
          <Link key={relatedArticle.id} href={`/share/${relatedArticle.slug}`} className={styles.specialIssueItem}>
            <div className={styles.specialIssueItemTitle}>{relatedArticle.title}</div>
            <div className={styles.specialIssueItemDate}>{formatArticleDate(relatedArticle)}</div>
          </Link>
        ))}
      </div>
    </Box>
  );

  if (!article) {
    return (
      <Box bg="white" style={{ minHeight: "100vh" }}>
        {renderHeader()}
        <Center h={400}>
          <Stack align="center">
            <Title order={2}>기사를 찾을 수 없습니다.</Title>
            <Text c="dimmed">만료된 링크이거나 잘못된 접근입니다.</Text>
          </Stack>
        </Center>
        {renderFooter()}
      </Box>
    );
  }

  if (!isSpecialIssueArticle) {
    return (
      <Box bg="white" style={{ minHeight: "100vh" }}>
        {renderHeader()}
        <Center h={400}>
          <Stack align="center">
            <Title order={2}>창간특별호 기사만 열람할 수 있습니다.</Title>
            <Text c="dimmed">해당 링크는 전용 페이지 정책에 맞지 않습니다.</Text>
          </Stack>
        </Center>
        {renderFooter()}
      </Box>
    );
  }

  return (
    <Box bg="white" style={{ minHeight: "100vh" }}>
      {renderHeader()}

      <Container size="xl" py={60}>
        <div className={styles.pageLayout}>
          <div>
            <Stack gap="xl">
              <header className={styles.storyHeader}>
                <div className={styles.storyKickerRow}>
                  <span className={styles.storyKicker}>창간특별호</span>
                </div>
                <Title order={1} className={styles.storyHeadline}>
                  {article.title}
                </Title>
                {article.sub_title && (
                  <Text className={styles.storySubHeadline}>
                    {article.sub_title}
                  </Text>
                )}
                <div className={styles.storyMetaPanel}>
                  <div className={styles.storyMetaItem}>
                    <span className={styles.storyMetaLabel}>발행</span>
                    <span>{formatArticleDateTime(publishedSource)}</span>
                  </div>
                  {isUpdated && (
                    <div className={styles.storyMetaItem}>
                      <span className={styles.storyMetaLabel}>수정</span>
                      <span>{formatArticleDateTime(lastUpdated)}</span>
                    </div>
                  )}
                </div>
              </header>

              <Divider />

              {deckText && (
                <p className={styles.storyDeck}>
                  {deckText}
                </p>
              )}

              {article.thumbnail_url && (
                <Image
                  src={article.thumbnail_url}
                  alt={article.title}
                  radius="md"
                  fit="cover"
                />
              )}

              <Box className={styles.articleContent}>
                <div dangerouslySetInnerHTML={{ __html: normalizedContent }} />
              </Box>

              {renderMobileRelatedSection()}
            </Stack>
          </div>

          <aside className={styles.desktopSidebar}>
            {renderDesktopSidebar()}
          </aside>
        </div>
      </Container>

      {renderFooter()}

    </Box>
  );
}
