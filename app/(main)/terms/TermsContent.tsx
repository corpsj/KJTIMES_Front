"use client";

import { Container, Title, Text, Stack, Divider, Box } from "@mantine/core";

export function TermsContent() {
  return (
    <Container size="md" py="xl">
      <Stack gap="xl">
        <Title order={1} ta="center">이용약관</Title>

        <Text size="sm" c="dimmed" ta="center">
          시행일: 2024년 1월 1일
        </Text>

        <Divider />

        <Box>
          <Title order={2} mb="md">제1조 (목적)</Title>
           <Text c="dimmed" style={{ lineHeight: 1.8 }}>
             본 약관은 광전타임즈(이하 &ldquo;회사&rdquo;)가 제공하는 인터넷 뉴스 서비스(이하 &ldquo;서비스&rdquo;)의 이용과 관련하여
             회사와 이용자 간의 권리, 의무 및 책임사항, 기타 필요한 사항을 규정함을 목적으로 합니다.
           </Text>
        </Box>

        <Box>
          <Title order={2} mb="md">제2조 (정의)</Title>
           <Text c="dimmed" style={{ lineHeight: 1.8 }}>
             1. &ldquo;서비스&rdquo;란 회사가 제공하는 인터넷 뉴스 및 관련 서비스를 의미합니다.<br />
             2. &ldquo;이용자&rdquo;란 본 약관에 따라 회사가 제공하는 서비스를 이용하는 회원 및 비회원을 말합니다.<br />
             3. &ldquo;회원&rdquo;이란 회사와 서비스 이용계약을 체결하고 회원 아이디(ID)를 부여받은 자를 말합니다.<br />
             4. &ldquo;비회원&rdquo;이란 회원가입 없이 회사가 제공하는 서비스를 이용하는 자를 말합니다.
           </Text>
        </Box>

        <Box>
          <Title order={2} mb="md">제3조 (약관의 효력 및 변경)</Title>
          <Text c="dimmed" style={{ lineHeight: 1.8 }}>
            1. 본 약관은 서비스 화면에 게시하거나 기타의 방법으로 공지함으로써 효력이 발생합니다.<br />
            2. 회사는 필요한 경우 관련 법령을 위배하지 않는 범위에서 본 약관을 변경할 수 있으며,
            변경된 약관은 제1항과 같은 방법으로 공지함으로써 효력이 발생합니다.<br />
            3. 이용자는 변경된 약관에 동의하지 않을 경우 서비스 이용을 중단하고 탈퇴할 수 있습니다.
          </Text>
        </Box>

        <Box>
          <Title order={2} mb="md">제4조 (서비스의 제공 및 변경)</Title>
          <Text c="dimmed" style={{ lineHeight: 1.8 }}>
            1. 회사는 다음과 같은 서비스를 제공합니다:<br />
            &nbsp;&nbsp;가. 뉴스 기사 제공 서비스<br />
            &nbsp;&nbsp;나. 기타 회사가 정하는 서비스<br />
            2. 회사는 서비스의 내용을 변경할 수 있으며, 변경 시 사전에 공지합니다.
          </Text>
        </Box>

        <Box>
          <Title order={2} mb="md">제5조 (서비스의 중단)</Title>
          <Text c="dimmed" style={{ lineHeight: 1.8 }}>
            1. 회사는 컴퓨터 등 정보통신설비의 보수점검, 교체 및 고장, 통신의 두절 등의 사유가 발생한 경우에는
            서비스의 제공을 일시적으로 중단할 수 있습니다.<br />
            2. 회사는 제1항의 사유로 서비스의 제공이 일시적으로 중단됨으로 인하여 이용자 또는 제3자가 입은
            손해에 대하여 배상하지 않습니다. 단, 회사에 고의 또는 중대한 과실이 있는 경우에는 그러하지 아니합니다.
          </Text>
        </Box>

        <Box>
          <Title order={2} mb="md">제6조 (회원가입)</Title>
          <Text c="dimmed" style={{ lineHeight: 1.8 }}>
            1. 이용자는 회사가 정한 가입 양식에 따라 회원정보를 기입한 후 본 약관에 동의한다는 의사표시를 함으로써
            회원가입을 신청합니다.<br />
            2. 회사는 제1항과 같이 회원으로 가입할 것을 신청한 이용자 중 다음 각 호에 해당하지 않는 한
            회원으로 등록합니다:<br />
            &nbsp;&nbsp;가. 등록 내용에 허위, 기재누락, 오기가 있는 경우<br />
            &nbsp;&nbsp;나. 기타 회원으로 등록하는 것이 회사의 기술상 현저히 지장이 있다고 판단되는 경우
          </Text>
        </Box>

        <Box>
          <Title order={2} mb="md">제7조 (개인정보보호)</Title>
          <Text c="dimmed" style={{ lineHeight: 1.8 }}>
            회사는 관련 법령이 정하는 바에 따라 이용자의 개인정보를 보호하기 위해 노력합니다.
            개인정보의 보호 및 이용에 대해서는 관련 법령 및 회사의 개인정보처리방침이 적용됩니다.
          </Text>
        </Box>

        <Box>
          <Title order={2} mb="md">제8조 (이용자의 의무)</Title>
          <Text c="dimmed" style={{ lineHeight: 1.8 }}>
            1. 이용자는 다음 행위를 하여서는 안 됩니다:<br />
            &nbsp;&nbsp;가. 신청 또는 변경 시 허위내용의 등록<br />
            &nbsp;&nbsp;나. 타인의 정보 도용<br />
            &nbsp;&nbsp;다. 회사가 게시한 정보의 변경<br />
            &nbsp;&nbsp;라. 회사가 정한 정보 이외의 정보(컴퓨터 프로그램 등) 등의 송신 또는 게시<br />
            &nbsp;&nbsp;마. 회사 및 기타 제3자의 저작권 등 지적재산권에 대한 침해<br />
            &nbsp;&nbsp;바. 회사 및 기타 제3자의 명예를 손상시키거나 업무를 방해하는 행위<br />
            &nbsp;&nbsp;사. 외설 또는 폭력적인 메시지, 화상, 음성, 기타 공서양속에 반하는 정보를 공개 또는 게시하는 행위
          </Text>
        </Box>

        <Divider />

        <Text size="sm" c="dimmed" ta="center">
          본 약관은 2024년 1월 1일부터 시행됩니다.
        </Text>
      </Stack>
    </Container>
  );
}
