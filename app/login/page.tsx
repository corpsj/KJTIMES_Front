import { Container, Title, TextInput, PasswordInput, Button, Paper, Group, Anchor, Stack } from "@mantine/core";

export default function Login() {
    return (
        <Container size={420} my={40}>
            <Title ta="center" order={1}>
                로그인
            </Title>

            <Paper withBorder shadow="md" p={30} mt={30} radius="md">
                <Stack gap="md">
                    <TextInput label="이메일" placeholder="you@mantine.dev" required />
                    <PasswordInput label="비밀번호" placeholder="Your password" required />
                    <Group justify="space-between" mt="lg">
                        <Anchor component="button" size="sm">
                            비밀번호 찾기
                        </Anchor>
                    </Group>
                    <Button fullWidth mt="xl">
                        로그인
                    </Button>
                </Stack>
            </Paper>
        </Container>
    );
}
