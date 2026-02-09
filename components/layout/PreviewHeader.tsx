import { Container, Group, Image, Box, Divider, Center } from "@mantine/core";
import Link from "next/link";

/**
 * 🔧 프리뷰 모드 전용 헤더
 * - 네비게이션 메뉴 없음
 * - 로고만 표시 (창간특별호로 이동)
 * - 나중에 PREVIEW_MODE를 false로 변경하면 일반 헤더로 복원됨
 */
export function PreviewHeader() {
    return (
        <Box component="header" mb="xl">
            <Container size="xl" py="md">
                <Center>
                    <Link href="/special-edition" style={{ textDecoration: 'none', color: 'inherit' }}>
                        <Image
                            src="/brand/KJ_sloganLogo.png"
                            style={{ 
                                height: 'auto',
                                maxHeight: '60px',
                                width: 'auto',
                                maxWidth: '80vw',
                                display: 'block',
                                margin: '0 auto'
                            }}
                            alt="광전타임즈 로고"
                        />
                    </Link>
                </Center>
            </Container>
            <Divider color="gray.3" />
        </Box>
    );
}
