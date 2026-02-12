import { Container, Stack } from "@mantine/core";
import { SignupForm } from "@/components/reader/SignupForm";

export const metadata = {
  title: "회원가입 - 광전타임즈",
  description: "광전타임즈 독자 회원가입",
};

export default function SignupPage() {
  return (
    <Container size="sm" py="xl">
      <Stack gap="xl" mt={60}>
        <SignupForm />
      </Stack>
    </Container>
  );
}
