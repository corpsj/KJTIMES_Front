import { Container, Title, Text, Stack, Divider } from "@mantine/core";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "편집원칙 | 광전타임즈",
    description: "광전타임즈의 편집원칙 — 정확성, 공정성, 독립성, 투명성",
};

export default function EditorialPolicy() {
    return (
        <Container size="md" py="xl">
            <Stack gap="lg">
                <Title order={1}>편집원칙</Title>
                <Text size="lg">
                    광전타임즈는 정확성, 공정성, 독립성, 투명성을 핵심 가치로 삼고
                    지역 사회에 필요한 정보를 책임 있게 전달합니다.
                </Text>

                <Divider />

                <Stack gap="xs">
                    <Title order={3}>1. 사실 보도 원칙</Title>
                    <Text c="dimmed" style={{ lineHeight: 1.8 }}>
                        광전타임즈는 확인된 사실만을 보도합니다. 모든 기사는 최소 1개 이상의 신뢰할 수 있는
                        출처를 통해 사실 확인을 거치며, 출처를 가능한 한 명확히 밝힙니다.
                        추측이나 의견은 사실과 구분하여 표기합니다.
                    </Text>
                </Stack>

                <Stack gap="xs">
                    <Title order={3}>2. 공정성 원칙</Title>
                    <Text c="dimmed" style={{ lineHeight: 1.8 }}>
                        모든 보도에서 균형 잡힌 시각을 유지합니다. 논쟁이 되는 사안에 대해서는
                        관련 당사자들의 입장을 공정하게 전달하며, 특정 개인이나 집단에 대한
                        부당한 편견이나 차별을 배제합니다.
                    </Text>
                </Stack>

                <Stack gap="xs">
                    <Title order={3}>3. 독립성 원칙</Title>
                    <Text c="dimmed" style={{ lineHeight: 1.8 }}>
                        편집권은 광고, 협찬, 정치적 압력 등 외부 영향으로부터 독립적으로 행사됩니다.
                        광고 및 협찬 콘텐츠는 뉴스 콘텐츠와 명확히 분리하며,
                        어떠한 외부 세력도 뉴스 판단에 개입할 수 없습니다.
                    </Text>
                </Stack>

                <Stack gap="xs">
                    <Title order={3}>4. 투명성 원칙</Title>
                    <Text c="dimmed" style={{ lineHeight: 1.8 }}>
                        유료 콘텐츠, 광고, 후원 콘텐츠는 &quot;광고&quot;, &quot;후원&quot;, &quot;협찬&quot; 등으로
                        명확히 표시하여 독자가 편집 기사와 구분할 수 있도록 합니다.
                        기사 작성에 영향을 줄 수 있는 이해관계가 있는 경우 이를 밝힙니다.
                    </Text>
                </Stack>

                <Stack gap="xs">
                    <Title order={3}>5. 정정보도 원칙</Title>
                    <Text c="dimmed" style={{ lineHeight: 1.8 }}>
                        보도 내용에 오류가 발견되거나 지적될 경우, 신속하고 투명하게 정정합니다.
                        정정 사항은 원 기사에 명확히 표기하며, 중대한 오류의 경우
                        별도의 정정보도를 게시합니다.
                    </Text>
                </Stack>

                <Stack gap="xs">
                    <Title order={3}>6. 취재원 보호 원칙</Title>
                    <Text c="dimmed" style={{ lineHeight: 1.8 }}>
                        취재원의 신원 보호는 언론의 기본 의무입니다. 익명을 요청한 취재원의
                        신원은 법적 요구가 없는 한 보호하며, 취재원과의 약속을 반드시 지킵니다.
                    </Text>
                </Stack>

                <Stack gap="xs">
                    <Title order={3}>7. 인권 보호 원칙</Title>
                    <Text c="dimmed" style={{ lineHeight: 1.8 }}>
                        범죄 보도에서 피의자의 인권과 피해자의 사생활을 보호합니다.
                        미성년자 관련 보도에서는 신원이 특정되지 않도록 각별히 주의하며,
                        선정적이거나 자극적인 표현을 지양합니다.
                    </Text>
                </Stack>

                <Divider />

                <Text size="sm" c="dimmed">
                    본 편집원칙에 대한 의견이나 제안은 jebo@kjtimes.co.kr로 보내주시기 바랍니다.
                </Text>
            </Stack>
        </Container>
    );
}
