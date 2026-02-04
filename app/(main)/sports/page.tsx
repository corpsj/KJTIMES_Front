import { Container, Title, Text } from "@mantine/core";

export default function Sports() {
    return (
        <Container size="xl" py="xl">
            <Title order={1}>스포츠</Title>
            <Text c="dimmed">스포츠 뉴스 섹션입니다.</Text>
        </Container>
    );
}
