"use client";

import { Container, Title, Text, Stack, Divider, Paper, Table } from "@mantine/core";

export function AdvertiseContent() {
    return (
        <Container size="md" py="xl">
            <Stack gap="lg">
                <Title order={1}>광고안내</Title>
                <Text size="lg">
                    광전타임즈는 광주·전남 지역에 특화된 인터넷 뉴스 매체로,
                    지역 독자들에게 효과적으로 메시지를 전달할 수 있는 다양한 광고 상품을 운영하고 있습니다.
                </Text>

                <Divider />

                <Title order={3}>광고 유형</Title>

                <Table withTableBorder withColumnBorders>
                    <Table.Thead>
                        <Table.Tr>
                            <Table.Th w={140}>유형</Table.Th>
                            <Table.Th>설명</Table.Th>
                        </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                        <Table.Tr>
                            <Table.Td fw={700}>배너 광고</Table.Td>
                            <Table.Td>메인 페이지 및 기사 페이지 상단·하단·사이드에 노출되는 이미지/동영상 배너</Table.Td>
                        </Table.Tr>
                        <Table.Tr>
                            <Table.Td fw={700}>기사형 광고</Table.Td>
                            <Table.Td>기사 형식으로 제작되는 콘텐츠 광고 (&quot;광고&quot; 또는 &quot;후원&quot;으로 명확히 표기)</Table.Td>
                        </Table.Tr>
                        <Table.Tr>
                            <Table.Td fw={700}>팝업 광고</Table.Td>
                            <Table.Td>특정 이벤트·행사에 맞춘 팝업 형태의 광고</Table.Td>
                        </Table.Tr>
                        <Table.Tr>
                            <Table.Td fw={700}>제휴·협찬</Table.Td>
                            <Table.Td>지역 행사, 캠페인 등과 연계한 미디어 제휴</Table.Td>
                        </Table.Tr>
                    </Table.Tbody>
                </Table>

                <Divider />

                <Stack gap="xs">
                    <Title order={3}>광고 정책</Title>
                    <Text c="dimmed" style={{ lineHeight: 1.8 }}>
                        • 모든 광고·협찬·유료 콘텐츠는 &quot;광고&quot; 또는 &quot;후원&quot; 표시를 통해 편집 기사와 명확히 구분합니다.<br />
                        • 광고 게재 여부는 편집 독립성에 영향을 미치지 않습니다.<br />
                        • 허위·과대 광고, 법령 위반 광고, 사회 통념에 어긋나는 광고는 게재를 거부할 수 있습니다.
                    </Text>
                </Stack>

                <Divider />

                <Paper withBorder p="xl" radius="md" bg="gray.0">
                    <Stack gap="md">
                        <Title order={3}>광고 문의</Title>
                        <Text>
                            광고에 대한 자세한 안내와 단가표는 아래 연락처로 문의해 주세요.
                            맞춤형 제안서를 준비해 드리겠습니다.
                        </Text>
                        <Stack gap="xs">
                            <Text><Text span fw={700}>전화:</Text> 010-9428-5361</Text>
                            <Text><Text span fw={700}>팩스:</Text> 0504-255-5361</Text>
                            <Text><Text span fw={700}>이메일:</Text> jebo@kjtimes.co.kr</Text>
                        </Stack>
                    </Stack>
                </Paper>
            </Stack>
        </Container>
    );
}
