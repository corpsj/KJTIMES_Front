"use client";

import { Container, Title, Text, Stack, Divider, Paper, List, ThemeIcon } from "@mantine/core";
import { IconPhone, IconMail, IconFileText } from "@tabler/icons-react";

export function CorrectionsContent() {
    return (
        <Container size="md" py="xl">
            <Stack gap="lg">
                <Title order={1}>정정보도 및 오류신고</Title>
                <Text size="lg">
                    광전타임즈는 보도의 정확성을 최우선으로 여깁니다.
                    기사 내용에 오류가 있다고 판단되시면 아래 방법으로 알려주세요.
                    신속하게 확인하고 필요한 조치를 취하겠습니다.
                </Text>

                <Divider />

                <Title order={3}>신고 방법</Title>

                <Paper withBorder p="lg" radius="md">
                    <Stack gap="md">
                        <List spacing="md" center>
                            <List.Item
                                icon={
                                    <ThemeIcon color="blue" size={28} radius="xl">
                                        <IconMail size={16} />
                                    </ThemeIcon>
                                }
                            >
                                <Text fw={700}>이메일</Text>
                                <Text c="dimmed">jebo@kjtimes.co.kr</Text>
                            </List.Item>
                            <List.Item
                                icon={
                                    <ThemeIcon color="green" size={28} radius="xl">
                                        <IconPhone size={16} />
                                    </ThemeIcon>
                                }
                            >
                                <Text fw={700}>전화</Text>
                                <Text c="dimmed">010-9428-5361</Text>
                            </List.Item>
                            <List.Item
                                icon={
                                    <ThemeIcon color="orange" size={28} radius="xl">
                                        <IconFileText size={16} />
                                    </ThemeIcon>
                                }
                            >
                                <Text fw={700}>팩스</Text>
                                <Text c="dimmed">0504-255-5361</Text>
                            </List.Item>
                        </List>
                    </Stack>
                </Paper>

                <Divider />

                <Stack gap="xs">
                    <Title order={3}>신고 시 포함해 주실 내용</Title>
                    <Text c="dimmed" style={{ lineHeight: 1.8 }}>
                        • 해당 기사 제목 또는 URL<br />
                        • 오류로 판단되는 내용 (구체적으로)<br />
                        • 올바른 내용 및 근거 자료 (가능한 경우)<br />
                        • 신고자 연락처 (회신을 위해)
                    </Text>
                </Stack>

                <Divider />

                <Stack gap="xs">
                    <Title order={3}>처리 절차</Title>
                    <Text c="dimmed" style={{ lineHeight: 1.8 }}>
                        1. <Text span fw={700} c="dark">접수:</Text> 이메일·전화·팩스로 정정 요청을 접수합니다.<br />
                        2. <Text span fw={700} c="dark">사실 확인:</Text> 편집국에서 해당 내용에 대한 사실 확인을 진행합니다.<br />
                        3. <Text span fw={700} c="dark">정정 조치:</Text> 오류가 확인되면 기사 본문에 정정·수정·추가 표기를 합니다.<br />
                        4. <Text span fw={700} c="dark">회신:</Text> 신고자에게 처리 결과를 안내합니다.
                    </Text>
                </Stack>

                <Divider />

                <Stack gap="xs">
                    <Title order={3}>언론중재위원회 안내</Title>
                    <Text c="dimmed" style={{ lineHeight: 1.8 }}>
                        언론 보도로 인한 피해에 대해서는 「언론중재 및 피해구제 등에 관한 법률」에 따라
                        언론중재위원회(www.pac.or.kr, ☎ 02-397-3114)에 조정·중재를 신청하실 수 있습니다.
                    </Text>
                </Stack>
            </Stack>
        </Container>
    );
}
