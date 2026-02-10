import { Container, Title, Text, Stack, Divider } from "@mantine/core";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "개인정보처리방침 | 광전타임즈",
    description: "광전타임즈 개인정보처리방침",
};

export default function Privacy() {
    return (
        <Container size="md" py="xl">
            <Stack gap="lg">
                <Title order={1}>개인정보처리방침</Title>
                <Text c="dimmed" size="sm">시행일: 2025년 1월 1일</Text>

                <Text>
                    광전타임즈(이하 &quot;회사&quot;)는 「개인정보 보호법」에 따라 이용자의 개인정보를
                    보호하고 이와 관련한 고충을 신속하게 처리할 수 있도록 다음과 같은
                    개인정보처리방침을 수립·공개합니다.
                </Text>

                <Divider />

                <Stack gap="xs">
                    <Title order={3}>제1조 (개인정보의 수집 항목 및 수집 방법)</Title>
                    <Text fw={700} mt="xs">1. 수집 항목</Text>
                    <Text c="dimmed" style={{ lineHeight: 1.8 }}>
                        • 뉴스레터 구독: 이메일 주소<br />
                        • 제보·문의: 이메일, 전화번호, 이름(선택)<br />
                        • 서비스 이용 과정에서 자동 수집: IP 주소, 쿠키, 방문 일시, 서비스 이용 기록, 기기 정보
                    </Text>
                    <Text fw={700} mt="xs">2. 수집 방법</Text>
                    <Text c="dimmed">
                        웹사이트 내 구독 신청 폼, 제보·문의 이메일, 자동 수집 장치(쿠키 등)
                    </Text>
                </Stack>

                <Divider />

                <Stack gap="xs">
                    <Title order={3}>제2조 (개인정보의 이용 목적)</Title>
                    <Text c="dimmed" style={{ lineHeight: 1.8 }}>
                        • 뉴스레터 발송 및 구독 관리<br />
                        • 제보·문의 접수 및 응대<br />
                        • 서비스 이용 통계 분석 및 품질 개선<br />
                        • 법령에 따른 의무 이행
                    </Text>
                </Stack>

                <Divider />

                <Stack gap="xs">
                    <Title order={3}>제3조 (개인정보의 보유 및 이용 기간)</Title>
                    <Text c="dimmed" style={{ lineHeight: 1.8 }}>
                        • 뉴스레터 구독 정보: 구독 해지 시까지<br />
                        • 제보·문의 기록: 처리 완료 후 1년<br />
                        • 서비스 이용 기록: 3개월<br />
                        • 관계 법령에 따라 보존할 필요가 있는 경우 해당 법령에서 정한 기간 동안 보존
                    </Text>
                </Stack>

                <Divider />

                <Stack gap="xs">
                    <Title order={3}>제4조 (개인정보의 파기 절차 및 방법)</Title>
                    <Text c="dimmed" style={{ lineHeight: 1.8 }}>
                        회사는 개인정보 보유 기간의 경과, 처리 목적 달성 등 개인정보가 불필요하게 되었을 때에는
                        지체 없이 해당 개인정보를 파기합니다.<br />
                        • 전자적 파일 형태: 기록을 재생할 수 없는 기술적 방법을 사용하여 파기<br />
                        • 종이 문서: 분쇄기로 분쇄하거나 소각
                    </Text>
                </Stack>

                <Divider />

                <Stack gap="xs">
                    <Title order={3}>제5조 (개인정보의 제3자 제공)</Title>
                    <Text c="dimmed">
                        회사는 이용자의 개인정보를 원칙적으로 외부에 제공하지 않습니다.
                        다만, 이용자가 사전에 동의한 경우 또는 법령의 규정에 의한 경우는 예외로 합니다.
                    </Text>
                </Stack>

                <Divider />

                <Stack gap="xs">
                    <Title order={3}>제6조 (이용자의 권리·의무 및 행사 방법)</Title>
                    <Text c="dimmed" style={{ lineHeight: 1.8 }}>
                        이용자는 언제든지 자신의 개인정보에 대해 열람, 수정, 삭제, 처리 정지를 요청할 수 있습니다.
                        권리 행사는 아래 연락처를 통해 서면, 전화, 이메일로 하실 수 있으며,
                        회사는 이에 대해 지체 없이 조치하겠습니다.
                    </Text>
                </Stack>

                <Divider />

                <Stack gap="xs">
                    <Title order={3}>제7조 (쿠키의 설치·운영 및 거부)</Title>
                    <Text c="dimmed" style={{ lineHeight: 1.8 }}>
                        회사는 이용자에게 맞춤형 서비스를 제공하기 위해 쿠키를 사용합니다.
                        이용자는 웹 브라우저 설정을 통해 쿠키 저장을 거부할 수 있으며,
                        쿠키 저장을 거부하더라도 서비스 이용에 큰 제한은 없습니다.
                    </Text>
                </Stack>

                <Divider />

                <Stack gap="xs">
                    <Title order={3}>제8조 (개인정보 보호책임자)</Title>
                    <Text c="dimmed" style={{ lineHeight: 1.8 }}>
                        • 책임자: 장혁훈 (발행·편집인)<br />
                        • 이메일: jebo@kjtimes.co.kr<br />
                        • 전화: 010-9428-5361
                    </Text>
                </Stack>

                <Divider />

                <Stack gap="xs">
                    <Title order={3}>제9조 (개인정보 처리방침의 변경)</Title>
                    <Text c="dimmed">
                        이 개인정보처리방침은 시행일로부터 적용되며, 법령 및 정책 변경에 따라
                        내용이 수정될 수 있습니다. 변경 시 웹사이트 공지를 통해 안내드리겠습니다.
                    </Text>
                </Stack>

                <Divider />

                <Stack gap="xs">
                    <Title order={3}>문의처</Title>
                    <Text c="dimmed" style={{ lineHeight: 1.8 }}>
                        광전타임즈<br />
                        주소: 전남 함평군 함평읍 영수길 148 2층<br />
                        전화: 010-9428-5361<br />
                        팩스: 0504-255-5361<br />
                        이메일: jebo@kjtimes.co.kr
                    </Text>
                </Stack>
            </Stack>
        </Container>
    );
}
