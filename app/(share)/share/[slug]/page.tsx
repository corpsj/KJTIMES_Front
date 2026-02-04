import { Container, Image, Text, Title, Box, Group, Stack, Divider, TypographyStylesProvider, Center, Grid } from "@mantine/core";
import { createClient } from "@/utils/supabase/server";

export const revalidate = 60;

export default async function SharedArticlePage({ params }: { params: { slug: string } }) {
  const supabase = await createClient();
  const { data: article } = await supabase
    .from("articles")
    .select("title, sub_title, excerpt, summary, content, thumbnail_url, created_at, status")
    .eq("slug", params.slug)
    .in("status", ["published", "shared"])
    .single();

  const renderHeader = () => (
    <Box py="xl" px="md" style={{ borderBottom: "2px solid #000" }}>
      <Container size="lg">
        <Grid gutter="xl" align="center">
          <Grid.Col span={{ base: 12, md: 5 }}>
            <Box>
              <Image
                src="/brand/KJ_Logo.png"
                h={80}
                w="auto"
                alt="광전타임즈"
                fit="contain"
              />
              <Text fw={800} size="xl" mt={5}>
                창간특별호
              </Text>
            </Box>
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 7 }}>
            <Box style={{ borderLeft: "2px solid #eee", paddingLeft: "20px" }}>
              <Text size="xl" fw={700} style={{ lineHeight: 1.4 }}>
                진실을 찾는 시선
                <br />
                내일을 준비하는 기록
              </Text>
            </Box>
          </Grid.Col>
        </Grid>
      </Container>
    </Box>
  );

  const renderFooter = () => (
    <Box py={80} bg="gray.0" mt={100} style={{ borderTop: "1px solid #eee" }}>
      <Container size="lg">
        <Stack align="center" gap="sm">
          <Text fw={700} size="lg">
            광전타임즈
          </Text>
          <Text size="sm" c="dimmed" ta="center">
            전남 함평군 함평읍 영수길 148 2층
            <br />
            발행·편집인: 선종인 | 전화: 010-1234-5678 | 이메일: test@kjtimes.co.kr
          </Text>
          <Text size="xs" c="dimmed" mt="xl">
            Copyright © Kwangjeon Times. All rights reserved.
          </Text>
        </Stack>
      </Container>
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

  return (
    <Box bg="white" style={{ minHeight: "100vh" }}>
      {renderHeader()}

      <Container size="md" py={60}>
        <Stack gap="xl">
          <Box>
            <Title order={1} size="h1" fw={900} style={{ lineHeight: 1.2, fontSize: "2.5rem" }}>
              {article.title}
            </Title>
            {article.sub_title && (
              <Text size="xl" c="dimmed" mt="md" fw={500}>
                {article.sub_title}
              </Text>
            )}
          </Box>

          <Divider />

          <Text size="lg" fw={700} style={{ borderLeft: "5px solid #000", paddingLeft: "20px" }}>
            {article.excerpt || article.summary}
          </Text>

          {article.thumbnail_url && (
            <Image
              src={article.thumbnail_url}
              alt={article.title}
              radius="md"
              fit="cover"
            />
          )}

          <Box className="article-content">
            <TypographyStylesProvider>
              <div dangerouslySetInnerHTML={{ __html: article.content }} />
            </TypographyStylesProvider>
          </Box>
        </Stack>
      </Container>

      {renderFooter()}

      <style jsx global>{`
        .article-content img {
          max-width: 100%;
          height: auto;
          border-radius: 8px;
          margin: 2rem 0;
        }
        .article-content p {
          font-size: 1.2rem;
          line-height: 1.8;
          margin-bottom: 1.5rem;
        }
        .article-content a {
          pointer-events: none;
          color: inherit;
          text-decoration: none;
        }
      `}</style>
    </Box>
  );
}
