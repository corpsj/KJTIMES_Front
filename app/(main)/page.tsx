import { getDeviceType } from "@/utils/device";
import { DesktopMain } from "@/components/desktop/DesktopMain";
import { MobileMain } from "@/components/mobile/MobileMain";
import { fetchArticles } from "@/lib/api/articles";
import { Container, Stack, Text, Title } from "@mantine/core";

export const revalidate = 60;

function EmptyState() {
  return (
    <Container size="md" py={80}>
      <Stack align="center" gap="md">
        <Title order={2} c="dimmed">아직 게시된 기사가 없습니다</Title>
        <Text c="dimmed" ta="center">
          광전타임즈가 곧 새로운 소식을 전해드리겠습니다.
        </Text>
      </Stack>
    </Container>
  );
}

export default async function Home() {
  const device = await getDeviceType();
  const { data: articles } = await fetchArticles(20);
  const safeArticles = articles || [];

  if (safeArticles.length === 0) {
    return <EmptyState />;
  }

  if (device === "mobile") {
    return <MobileMain articles={safeArticles} />;
  }

  return <DesktopMain articles={safeArticles} />;
}
