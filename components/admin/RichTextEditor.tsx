import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import { Button, Group, ActionIcon, Paper } from '@mantine/core';
import { IconBold, IconItalic, IconStrikethrough, IconH1, IconH2, IconList, IconListNumbers, IconPhoto } from '@tabler/icons-react';

interface RichTextEditorProps {
    content?: string;
    onChange: (content: string) => void;
    onImageUpload?: (file: File) => Promise<string>;
}

export function RichTextEditor({ content, onChange, onImageUpload }: RichTextEditorProps) {
    const editor = useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit,
            Image,
            Placeholder.configure({
                placeholder: '내용을 입력하세요...',
            }),
        ],
        content: content || '',
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: 'min-h-[300px] outline-none p-4',
            },
        },
    });

    if (!editor) {
        return null;
    }

    const handleImageUpload = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = async () => {
            if (input.files?.length && onImageUpload) {
                const file = input.files[0];
                const url = await onImageUpload(file);
                if (url) {
                    editor.chain().focus().setImage({ src: url }).run();
                }
            }
        };
        input.click();
    };

    return (
        <Paper withBorder radius="md">
            {/* Toolbar */}
            <Group gap="xs" p="xs" style={{ borderBottom: '1px solid #eee' }}>
                <ActionIcon
                    variant={editor.isActive('bold') ? 'filled' : 'subtle'}
                    onClick={() => editor.chain().focus().toggleBold().run()}
                >
                    <IconBold size={16} />
                </ActionIcon>
                <ActionIcon
                    variant={editor.isActive('italic') ? 'filled' : 'subtle'}
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                >
                    <IconItalic size={16} />
                </ActionIcon>
                <ActionIcon
                    variant={editor.isActive('strike') ? 'filled' : 'subtle'}
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                >
                    <IconStrikethrough size={16} />
                </ActionIcon>
                <ActionIcon
                    variant={editor.isActive('heading', { level: 2 }) ? 'filled' : 'subtle'}
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                >
                    <IconH1 size={16} />
                </ActionIcon>
                <ActionIcon
                    variant={editor.isActive('heading', { level: 3 }) ? 'filled' : 'subtle'}
                    onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                >
                    <IconH2 size={16} />
                </ActionIcon>
                <ActionIcon
                    variant={editor.isActive('bulletList') ? 'filled' : 'subtle'}
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                >
                    <IconList size={16} />
                </ActionIcon>
                <ActionIcon
                    variant={editor.isActive('orderedList') ? 'filled' : 'subtle'}
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                >
                    <IconListNumbers size={16} />
                </ActionIcon>
                <ActionIcon
                    variant="subtle"
                    onClick={handleImageUpload}
                    disabled={!onImageUpload}
                >
                    <IconPhoto size={16} />
                </ActionIcon>
            </Group>

            {/* Editor Content */}
            <EditorContent editor={editor} />
        </Paper>
    );
}
