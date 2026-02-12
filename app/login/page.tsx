import { Container, Stack } from "@mantine/core";
import { LoginForm } from "@/components/reader/LoginForm";

export const metadata = {
  title: "로그인 - 광전타임즈",
  description: "광전타임즈 독자 로그인",
};

export default function LoginPage() {
  return (
    <Container size="sm" py="xl">
      <Stack gap="xl" mt={60}>
        <LoginForm />
      </Stack>
    </Container>
  );
}
