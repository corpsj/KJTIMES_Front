import { fetchArticles, fetchCategoryArticles } from "@/lib/api/articles";
import { Container, Stack, Text, Title, Grid, GridCol, Box, Divider } from "@mantine/core";
import { Headline } from "@/components/home/Headline";
import { MainNews } from "@/components/home/MainNews";
import { PopularNews } from "@/components/home/PopularNews";
import { CategorySection } from "@/components/home/CategorySection";
import { IconNews } from "@tabler/icons-react";
import type { Metadata } from "next";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "광전타임즈 - 광주·전남 지역 뉴스 포털",
  description: "광주·전남 지역의 정확하고 빠른 뉴스를 전달하는 광전타임즈입니다. 정치, 경제, 사회, 문화, 스포츠 등 다양한 분야의 뉴스를 실시간으로 제공합니다.",
  keywords: ["광전타임즈", "광주뉴스", "전남뉴스", "지역뉴스", "광주전남", "뉴스포털"],
  openGraph: {
    title: "광전타임즈 - 광주·전남 지역 뉴스 포털",
    description: "광주·전남 지역의 정확하고 빠른 뉴스를 전달하는 광전타임즈",
    url: "https://kjtimes.co.kr",
    siteName: "광전타임즈",
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "광전타임즈 - 광주·전남 지역 뉴스 포털",
    description: "광주·전남 지역의 정확하고 빠른 뉴스를 전달하는 광전타임즈",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

function EmptyState() {
  return (
    <Container size="md" py={80}>
      <Stack align="center" gap="md">
        <Box
          style={{
            width: 80,
            height: 80,
            borderRadius: "50%",
            background: "var(--mantine-color-newsBorder-0)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <IconNews size={36} color="var(--mantine-color-newsMuted-3)" />
        </Box>
        <Title order={2} c="dimmed">아직 게시된 기사가 없습니다</Title>
        <Text c="dimmed" ta="center">
          광전타임즈가 곧 새로운 소식을 전해드리겠습니다.
        </Text>
      </Stack>
    </Container>
  );
}

export default async function Home() {
  const { data: articles } = await fetchArticles(30);
  const safeArticles = articles || [];

  if (safeArticles.length === 0) {
    return <EmptyState />;
  }

  const popularArticles = [...safeArticles]
    .sort((a, b) => (b.views || 0) - (a.views || 0))
    .slice(0, 5);

  const { data: politicsArticles } = await fetchCategoryArticles("politics", 4);
  const { data: economyArticles } = await fetchCategoryArticles("economy", 4);
  const { data: societyArticles } = await fetchCategoryArticles("society", 4);

  return (
    <Container size="xl" py={{ base: "md", md: "xl" }}>
      <Stack gap="xl">
        <Box>
          <Headline articles={safeArticles.slice(0, 3)} />
        </Box>

        <Divider color="newsBorder.1" />

        <Grid gutter={{ base: "lg", md: "xl" }}>
          <GridCol span={{ base: 12, lg: 8 }}>
            <MainNews articles={safeArticles.slice(3, 12)} />
          </GridCol>

          <GridCol span={{ base: 12, lg: 4 }} order={{ base: 3, lg: 2 }}>
            <PopularNews articles={popularArticles} />
          </GridCol>
        </Grid>

        {politicsArticles && politicsArticles.length > 0 && (
          <>
            <Divider color="newsBorder.1" mt="xl" />
            <CategorySection
              title="정치"
              categorySlug="politics"
              articles={politicsArticles}
            />
          </>
        )}

        {economyArticles && economyArticles.length > 0 && (
          <>
            <Divider color="newsBorder.1" mt="xl" />
            <CategorySection
              title="경제"
              categorySlug="economy"
              articles={economyArticles}
            />
          </>
        )}

        {societyArticles && societyArticles.length > 0 && (
          <>
            <Divider color="newsBorder.1" mt="xl" />
            <CategorySection
              title="사회"
              categorySlug="society"
              articles={societyArticles}
            />
          </>
        )}
      </Stack>
    </Container>
  );
}
