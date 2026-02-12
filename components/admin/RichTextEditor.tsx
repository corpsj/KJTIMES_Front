import './editor.css';
import { useEditor, EditorContent } from '@tiptap/react';
import { useEffect, useState, useCallback } from 'react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import LinkExtension from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import { FigureImage } from './FigureImage';
import { Group, ActionIcon, Paper, Box, TextInput, Popover, Button } from '@mantine/core';
import {
    IconBold,
    IconItalic,
    IconStrikethrough,
    IconH1,
    IconH2,
    IconH3,
    IconList,
    IconListNumbers,
    IconPhoto,
    IconBlockquote,
    IconMinus,
    IconArrowBackUp,
    IconArrowForwardUp,
    IconLink,
    IconLinkOff,
    IconAlignLeft,
    IconAlignCenter,
    IconAlignRight,
    IconClearFormatting,
} from '@tabler/icons-react';

interface RichTextEditorProps {
    content?: string;
    onChange: (content: string) => void;
    onImageUpload?: (file: File) => Promise<string>;
}

export function RichTextEditor({ content, onChange, onImageUpload }: RichTextEditorProps) {
    const [linkUrl, setLinkUrl] = useState('');
    const [linkPopoverOpen, setLinkPopoverOpen] = useState(false);
    const [isDragOver, setIsDragOver] = useState(false);

    const editor = useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit,
            Image,
            FigureImage,
            Placeholder.configure({
                placeholder: '내용을 입력하세요...',
            }),
            LinkExtension.configure({
                openOnClick: false,
                HTMLAttributes: {
                    rel: 'noopener noreferrer',
                    target: '_blank',
                },
            }),
            TextAlign.configure({
                types: ['heading', 'paragraph'],
            }),
        ],
        content: content || '',
        onUpdate: ({ editor: ed }) => {
            onChange(ed.getHTML());
        },
        editorProps: {
            attributes: {
                class: 'min-h-[300px] outline-none p-4',
            },
            handleDrop: (view, event, _slice, moved) => {
                if (moved || !event.dataTransfer?.files?.length) {
                    return false;
                }

                const files = Array.from(event.dataTransfer.files).filter((f) =>
                    f.type.startsWith('image/')
                );
                if (files.length === 0) return false;

                event.preventDefault();

                if (onImageUpload) {
                    void (async () => {
                        for (const file of files) {
                            const url = await onImageUpload(file);
                            if (url && view.state) {
                                const ed = (view as unknown as { editor?: { chain: () => ReturnType<ReturnType<typeof useEditor>['chain']> } }).editor;
                                // Use the editor reference from closure
                                const pos = view.posAtCoords({
                                    left: event.clientX,
                                    top: event.clientY,
                                });
                                if (pos) {
                                    const tr = view.state.tr.insert(
                                        pos.pos,
                                        view.state.schema.nodes.figureImage.create({
                                            src: url,
                                            alt: file.name,
                                            caption: null,
                                        })
                                    );
                                    view.dispatch(tr);
                                }
                            }
                        }
                    })();
                }

                return true;
            },
            handlePaste: (view, event) => {
                const items = event.clipboardData?.items;
                if (!items) return false;

                const imageItems = Array.from(items).filter((item) =>
                    item.type.startsWith('image/')
                );
                if (imageItems.length === 0) return false;

                event.preventDefault();

                if (onImageUpload) {
                    void (async () => {
                        for (const item of imageItems) {
                            const file = item.getAsFile();
                            if (!file) continue;
                            const url = await onImageUpload(file);
                            if (url && view.state) {
                                const { tr } = view.state;
                                const node = view.state.schema.nodes.figureImage.create({
                                    src: url,
                                    alt: file.name,
                                    caption: null,
                                });
                                view.dispatch(tr.replaceSelectionWith(node));
                            }
                        }
                    })();
                }

                return true;
            },
        },
    });

    useEffect(() => {
        if (!editor || content === undefined) return;
        const current = editor.getHTML();
        if (current !== content) {
            editor.commands.setContent(content, { emitUpdate: false });
        }
    }, [content, editor]);

    const handleDragEnter = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
    }, []);

    const handleDrop = useCallback(() => {
        setIsDragOver(false);
    }, []);

    if (!editor) {
        return null;
    }

    const handleImageUpload = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.multiple = true;
        input.onchange = async () => {
            if (input.files?.length && onImageUpload) {
                for (let i = 0; i < input.files.length; i++) {
                    const file = input.files[i];
                    const url = await onImageUpload(file);
                    if (url) {
                        editor
                            .chain()
                            .focus()
                            .insertContent({
                                type: 'figureImage',
                                attrs: { src: url, alt: file.name, caption: null },
                            })
                            .run();
                    }
                }
            }
        };
        input.click();
    };

    const handleSetLink = () => {
        if (!linkUrl.trim()) {
            editor.chain().focus().unsetLink().run();
            setLinkPopoverOpen(false);
            setLinkUrl('');
            return;
        }
        const url = linkUrl.startsWith('http') ? linkUrl : `https://${linkUrl}`;
        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
        setLinkPopoverOpen(false);
        setLinkUrl('');
    };

    const handleOpenLinkPopover = () => {
        const existingHref = editor.getAttributes('link').href as string | undefined;
        setLinkUrl(existingHref || '');
        setLinkPopoverOpen(true);
    };

    const separatorStyle = {
        borderLeft: '1px solid var(--mantine-color-gray-3)',
        height: 20,
        marginInline: 4,
        alignSelf: 'center' as const,
    };

    return (
        <Paper
            withBorder
            radius="md"
            style={{
                outline: isDragOver ? '2px dashed var(--mantine-color-blue-6)' : 'none',
                outlineOffset: -2,
                transition: 'outline 0.15s',
            }}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
        >
            {/* Toolbar */}
            <Group gap="xs" p="xs" style={{ borderBottom: '1px solid #eee', flexWrap: 'wrap' }}>
                {/* Text formatting */}
                <ActionIcon
                    variant={editor.isActive('bold') ? 'filled' : 'subtle'}
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    title="굵게 (Ctrl+B)"
                    aria-label="굵게"
                >
                    <IconBold size={16} />
                </ActionIcon>
                <ActionIcon
                    variant={editor.isActive('italic') ? 'filled' : 'subtle'}
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    title="기울임 (Ctrl+I)"
                    aria-label="기울임"
                >
                    <IconItalic size={16} />
                </ActionIcon>
                <ActionIcon
                    variant={editor.isActive('strike') ? 'filled' : 'subtle'}
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                    title="취소선"
                    aria-label="취소선"
                >
                    <IconStrikethrough size={16} />
                </ActionIcon>

                {/* Separator */}
                <Box style={separatorStyle} />

                {/* Headings */}
                <ActionIcon
                    variant={editor.isActive('heading', { level: 2 }) ? 'filled' : 'subtle'}
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    title="제목 2 (H2)"
                    aria-label="제목 2"
                >
                    <IconH1 size={16} />
                </ActionIcon>
                <ActionIcon
                    variant={editor.isActive('heading', { level: 3 }) ? 'filled' : 'subtle'}
                    onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                    title="제목 3 (H3)"
                    aria-label="제목 3"
                >
                    <IconH2 size={16} />
                </ActionIcon>
                <ActionIcon
                    variant={editor.isActive('heading', { level: 4 }) ? 'filled' : 'subtle'}
                    onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
                    title="제목 4 (H4)"
                    aria-label="제목 4"
                >
                    <IconH3 size={16} />
                </ActionIcon>

                {/* Separator */}
                <Box style={separatorStyle} />

                {/* Lists */}
                <ActionIcon
                    variant={editor.isActive('bulletList') ? 'filled' : 'subtle'}
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    title="글머리 기호"
                >
                    <IconList size={16} />
                </ActionIcon>
                <ActionIcon
                    variant={editor.isActive('orderedList') ? 'filled' : 'subtle'}
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    title="번호 목록"
                >
                    <IconListNumbers size={16} />
                </ActionIcon>

                {/* Blockquote & HR */}
                <ActionIcon
                    variant={editor.isActive('blockquote') ? 'filled' : 'subtle'}
                    onClick={() => editor.chain().focus().toggleBlockquote().run()}
                    title="인용문"
                >
                    <IconBlockquote size={16} />
                </ActionIcon>
                <ActionIcon
                    variant="subtle"
                    onClick={() => editor.chain().focus().setHorizontalRule().run()}
                    title="구분선"
                >
                    <IconMinus size={16} />
                </ActionIcon>

                {/* Separator */}
                <Box style={separatorStyle} />

                {/* Text Alignment */}
                <ActionIcon
                    variant={editor.isActive({ textAlign: 'left' }) ? 'filled' : 'subtle'}
                    onClick={() => editor.chain().focus().setTextAlign('left').run()}
                    title="왼쪽 정렬"
                >
                    <IconAlignLeft size={16} />
                </ActionIcon>
                <ActionIcon
                    variant={editor.isActive({ textAlign: 'center' }) ? 'filled' : 'subtle'}
                    onClick={() => editor.chain().focus().setTextAlign('center').run()}
                    title="가운데 정렬"
                >
                    <IconAlignCenter size={16} />
                </ActionIcon>
                <ActionIcon
                    variant={editor.isActive({ textAlign: 'right' }) ? 'filled' : 'subtle'}
                    onClick={() => editor.chain().focus().setTextAlign('right').run()}
                    title="오른쪽 정렬"
                >
                    <IconAlignRight size={16} />
                </ActionIcon>

                {/* Separator */}
                <Box style={separatorStyle} />

                {/* Link */}
                <Popover
                    opened={linkPopoverOpen}
                    onClose={() => setLinkPopoverOpen(false)}
                    position="bottom"
                    withArrow
                >
                    <Popover.Target>
                        <ActionIcon
                            variant={editor.isActive('link') ? 'filled' : 'subtle'}
                            onClick={handleOpenLinkPopover}
                            title="링크"
                        >
                            <IconLink size={16} />
                        </ActionIcon>
                    </Popover.Target>
                    <Popover.Dropdown>
                        <Group gap="xs">
                            <TextInput
                                size="xs"
                                placeholder="https://example.com"
                                value={linkUrl}
                                onChange={(e) => setLinkUrl(e.currentTarget.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleSetLink();
                                    }
                                }}
                                style={{ width: 220 }}
                            />
                            <Button size="xs" onClick={handleSetLink}>
                                확인
                            </Button>
                        </Group>
                    </Popover.Dropdown>
                </Popover>

                {editor.isActive('link') && (
                    <ActionIcon
                        variant="subtle"
                        color="red"
                        onClick={() => editor.chain().focus().unsetLink().run()}
                        title="링크 제거"
                    >
                        <IconLinkOff size={16} />
                    </ActionIcon>
                )}

                {/* Separator */}
                <Box style={separatorStyle} />

                {/* Image */}
                <ActionIcon
                    variant="subtle"
                    onClick={handleImageUpload}
                    disabled={!onImageUpload}
                    title="이미지 삽입"
                >
                    <IconPhoto size={16} />
                </ActionIcon>

                {/* Separator */}
                <Box style={separatorStyle} />

                {/* Undo / Redo */}
                <ActionIcon
                    variant="subtle"
                    onClick={() => editor.chain().focus().undo().run()}
                    disabled={!editor.can().undo()}
                    title="실행 취소"
                    aria-label="실행 취소"
                >
                    <IconArrowBackUp size={16} />
                </ActionIcon>
                <ActionIcon
                    variant="subtle"
                    onClick={() => editor.chain().focus().redo().run()}
                    disabled={!editor.can().redo()}
                    title="다시 실행"
                    aria-label="다시 실행"
                >
                    <IconArrowForwardUp size={16} />
                </ActionIcon>

                {/* Separator */}
                <Box style={separatorStyle} />

                {/* Clear formatting */}
                <ActionIcon
                    variant="subtle"
                    onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
                    title="서식 지우기"
                    aria-label="서식 지우기"
                >
                    <IconClearFormatting size={16} />
                </ActionIcon>
            </Group>

            {/* Editor Content */}
            <EditorContent editor={editor} />
        </Paper>
    );
}
