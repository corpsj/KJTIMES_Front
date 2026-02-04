import { Container, Title, Text } from "@mantine/core";

export default function Opinion() {
    return (
        <Container size="xl" py="xl">
            <Title order={1}>오피니언</Title>
            <Text c="dimmed">오피니언 섹션입니다.</Text>
        </Container>
    );
}
