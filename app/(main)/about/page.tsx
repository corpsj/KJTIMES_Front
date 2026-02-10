import { Container, Title, Text, Stack, Divider, Table, Image, Group, Box } from "@mantine/core";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "회사소개 | 광전타임즈",
    description: "광전타임즈 회사소개 — 지역과 현장을 가장 가까이에서 기록하는 언론",
};

export default function About() {
    return (
        <Container size="md" py="xl">
            <Stack gap="xl">
                <Group justify="center">
                    <Image
                        src="/brand/KJ_sloganLogo.png"
                        style={{ height: "60px", width: "auto" }}
                        alt="광전타임즈 로고"
                    />
                </Group>

                <Title order={1} ta="center">회사소개</Title>

                <Text size="lg" ta="center">
                    광전타임즈는 지역과 현장을 가장 가까이에서 기록하는 언론으로,
                    사실에 기반한 보도와 공정한 시선을 지향합니다.
                </Text>

                <Divider />

                <Box>
                    <Title order={3} mb="md">기본 정보</Title>
                    <Table withTableBorder withColumnBorders>
                        <Table.Tbody>
                            <Table.Tr>
                                <Table.Td fw={700} w={160} bg="gray.0">매체명</Table.Td>
                                <Table.Td>광전타임즈</Table.Td>
                            </Table.Tr>
                            <Table.Tr>
                                <Table.Td fw={700} bg="gray.0">등록번호</Table.Td>
                                <Table.Td>전남, 아00607</Table.Td>
                            </Table.Tr>
                            <Table.Tr>
                                <Table.Td fw={700} bg="gray.0">대표</Table.Td>
                                <Table.Td>선종인</Table.Td>
                            </Table.Tr>
                            <Table.Tr>
                                <Table.Td fw={700} bg="gray.0">발행·편집인</Table.Td>
                                <Table.Td>장혁훈</Table.Td>
                            </Table.Tr>
                            <Table.Tr>
                                <Table.Td fw={700} bg="gray.0">사업자등록번호</Table.Td>
                                <Table.Td>173-91-02454</Table.Td>
                            </Table.Tr>
                        </Table.Tbody>
                    </Table>
                </Box>

                <Box>
                    <Title order={3} mb="md">연락처</Title>
                    <Table withTableBorder withColumnBorders>
                        <Table.Tbody>
                            <Table.Tr>
                                <Table.Td fw={700} w={160} bg="gray.0">전화·제보</Table.Td>
                                <Table.Td>010-9428-5361</Table.Td>
                            </Table.Tr>
                            <Table.Tr>
                                <Table.Td fw={700} bg="gray.0">팩스</Table.Td>
                                <Table.Td>0504-255-5361</Table.Td>
                            </Table.Tr>
                            <Table.Tr>
                                <Table.Td fw={700} bg="gray.0">이메일</Table.Td>
                                <Table.Td>jebo@kjtimes.co.kr</Table.Td>
                            </Table.Tr>
                            <Table.Tr>
                                <Table.Td fw={700} bg="gray.0">주소</Table.Td>
                                <Table.Td>전남 함평군 함평읍 영수길 148 2층</Table.Td>
                            </Table.Tr>
                        </Table.Tbody>
                    </Table>
                </Box>

                <Divider />

                <Box>
                    <Title order={3} mb="md">편집 방향</Title>
                    <Text c="dimmed" style={{ lineHeight: 1.8 }}>
                        광전타임즈는 광주·전남 지역의 정치, 경제, 사회, 문화 전 분야를 아우르는
                        종합 인터넷신문으로, 지역 주민의 알 권리를 충족하고 지역 사회의 발전에
                        기여하는 것을 목표로 합니다. 사실에 기반한 정확한 보도, 공정한 시선,
                        그리고 지역 현장의 생생한 목소리를 전달하기 위해 최선을 다하겠습니다.
                    </Text>
                </Box>
            </Stack>
        </Container>
    );
}
