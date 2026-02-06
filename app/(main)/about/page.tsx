import { Container, Title, Text, Stack, Divider } from "@mantine/core";

export default function About() {
    return (
        <Container size="md" py="xl">
            <Stack gap="lg">
                <Title order={1}>회사소개</Title>
                <Text>
                    광전타임즈는 지역과 현장을 가장 가까이에서 기록하는 언론으로,
                    사실에 기반한 보도와 공정한 시선을 지향합니다.
                </Text>
                <Divider />
                <Stack gap="xs">
                    <Text fw={700}>발행·편집</Text>
                    <Text c="dimmed">발행·편집인: 선종인</Text>
                </Stack>
                <Stack gap="xs">
                    <Text fw={700}>연락처</Text>
                    <Text c="dimmed">전화: 010-1234-5678</Text>
                    <Text c="dimmed">이메일: test@kjtimes.co.kr</Text>
                </Stack>
                <Stack gap="xs">
                    <Text fw={700}>주소</Text>
                    <Text c="dimmed">전남 함평군 함평읍 영수길 148 2층</Text>
                </Stack>
                <Stack gap="xs">
                    <Text fw={700}>사업자 정보</Text>
                    <Text c="dimmed">등록번호: 준비중</Text>
                    <Text c="dimmed">사업자등록번호: 준비중</Text>
                </Stack>
            </Stack>
        </Container>
    );
}
