import { Container, Title, Text, Stack, Divider } from "@mantine/core";

export default function Corrections() {
    return (
        <Container size="md" py="xl">
            <Stack gap="lg">
                <Title order={1}>정정보도 및 오류신고</Title>
                <Text>
                    기사 내용에 오류가 있다고 판단될 경우 아래 연락처로 제보해 주세요.
                    확인 후 필요한 정정을 진행합니다.
                </Text>
                <Divider />
                <Stack gap="xs">
                    <Text fw={700}>접수 방법</Text>
                    <Text c="dimmed">이메일: test@kjtimes.co.kr</Text>
                    <Text c="dimmed">전화: 010-1234-5678</Text>
                </Stack>
                <Stack gap="xs">
                    <Text fw={700}>처리 절차</Text>
                    <Text c="dimmed">
                        접수 후 사실 확인을 진행하며, 필요한 경우 기사 본문에 정정·추가 표기를 합니다.
                    </Text>
                </Stack>
            </Stack>
        </Container>
    );
}
