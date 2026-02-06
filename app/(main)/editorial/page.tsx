import { Container, Title, Text, Stack, Divider } from "@mantine/core";

export default function EditorialPolicy() {
    return (
        <Container size="md" py="xl">
            <Stack gap="lg">
                <Title order={1}>편집원칙</Title>
                <Text>
                    광전타임즈는 정확성, 공정성, 독립성을 핵심 가치로 삼고
                    지역 사회에 필요한 정보를 투명하게 전달합니다.
                </Text>
                <Divider />
                <Stack gap="xs">
                    <Text fw={700}>정확성</Text>
                    <Text c="dimmed">사실 확인을 최우선으로 하며 출처를 명확히 밝힙니다.</Text>
                </Stack>
                <Stack gap="xs">
                    <Text fw={700}>독립성</Text>
                    <Text c="dimmed">광고·협찬으로부터 편집권을 분리하여 보도의 독립성을 지킵니다.</Text>
                </Stack>
                <Stack gap="xs">
                    <Text fw={700}>투명성</Text>
                    <Text c="dimmed">유료 콘텐츠는 &quot;광고&quot; 또는 &quot;후원&quot;으로 명확히 표시합니다.</Text>
                </Stack>
                <Stack gap="xs">
                    <Text fw={700}>정정보도</Text>
                    <Text c="dimmed">오류가 확인될 경우 신속히 정정합니다.</Text>
                </Stack>
            </Stack>
        </Container>
    );
}
