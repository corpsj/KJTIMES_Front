import { Stack, Title, Paper, Text } from "@mantine/core";

export function Opinion() {
    return (
        <Stack gap="xl">
            <Title order={4} style={{ borderBottom: "2px solid black", paddingBottom: "8px" }}>
                오피니언
            </Title>
            <Paper p="md" bg="gray.0">
                <Text size="xs" c="blue" fw={700} mb="xs">[사설]</Text>
                <Text fw={700} size="md" mb="xs">지역 보도는 지역 언론이 지켜야 한다</Text>
                <Text size="sm" c="dimmed" lineClamp={3}>
                    지방 소멸의 시대, 지역 언론의 역할은 그 어느 때보다 중요하다. 중앙 중심의 보도에서 벗어나...
                </Text>
            </Paper>

            <Paper p="md" bg="gray.0">
                <Text size="xs" c="green" fw={700} mb="xs">[칼럼]</Text>
                <Text fw={700} size="md" mb="xs">AI 시대의 교육 혁신</Text>
                <Text size="sm" c="dimmed" lineClamp={3}>
                    인공지능이 일상을 파고드는 시대, 우리 교육은 어떻게 변해야 하는가. 암기 위주의 교육에서...
                </Text>
            </Paper>
        </Stack>
    );
}
