import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer, NodeViewWrapper } from "@tiptap/react";
import { useState, useCallback } from "react";

/* ─── React NodeView ─── */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function FigureImageView(props: any) {
    const { node, updateAttributes, selected } = props as {
        node: { attrs: { src: string | null; alt: string | null; caption: string | null } };
        updateAttributes: (attrs: Partial<{ src: string | null; alt: string | null; caption: string | null }>) => void;
        selected: boolean;
    };
    const { src, alt, caption } = node.attrs;
    const [isEditingCaption, setIsEditingCaption] = useState(false);

    const handleCaptionChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            updateAttributes({ caption: e.target.value });
        },
        [updateAttributes]
    );

    const handleCaptionBlur = useCallback(() => {
        setIsEditingCaption(false);
    }, []);

    const handleCaptionKeyDown = useCallback(
        (e: React.KeyboardEvent) => {
            if (e.key === "Enter") {
                e.preventDefault();
                setIsEditingCaption(false);
            }
        },
        []
    );

    return (
        <NodeViewWrapper as="figure" className="figure-image-wrapper" data-drag-handle>
            <div
                style={{
                    position: "relative",
                    border: selected ? "2px solid var(--mantine-color-blue-6)" : "2px solid transparent",
                    borderRadius: 6,
                    overflow: "hidden",
                    transition: "border-color 0.15s",
                }}
            >
                {src ? (
                    <img
                        src={src}
                        alt={alt || ""}
                        style={{
                            display: "block",
                            width: "100%",
                            height: "auto",
                            borderRadius: 4,
                        }}
                        draggable={false}
                    />
                ) : (
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: "100%",
                            height: 200,
                            background: "var(--mantine-color-gray-1)",
                            borderRadius: 4,
                            color: "var(--mantine-color-gray-5)",
                            fontSize: "0.9rem",
                        }}
                    >
                        이미지를 불러올 수 없습니다
                    </div>
                )}
            </div>
            {isEditingCaption ? (
                <input
                    type="text"
                    value={caption || ""}
                    onChange={handleCaptionChange}
                    onBlur={handleCaptionBlur}
                    onKeyDown={handleCaptionKeyDown}
                    placeholder="사진 설명을 입력하세요"
                    autoFocus
                    style={{
                        display: "block",
                        width: "100%",
                        marginTop: 6,
                        padding: "6px 8px",
                        fontSize: "0.85rem",
                        color: "var(--mantine-color-gray-6)",
                        border: "1px solid var(--mantine-color-gray-3)",
                        borderRadius: 4,
                        outline: "none",
                        background: "var(--mantine-color-gray-0)",
                        textAlign: "center",
                    }}
                />
            ) : (
                <figcaption
                    onClick={() => setIsEditingCaption(true)}
                    style={{
                        marginTop: 6,
                        padding: "4px 8px",
                        fontSize: "0.85rem",
                        color: caption ? "var(--mantine-color-gray-6)" : "var(--mantine-color-gray-5)",
                        textAlign: "center",
                        cursor: "pointer",
                        borderRadius: 4,
                        lineHeight: 1.5,
                        minHeight: 28,
                        transition: "background 0.15s",
                        ...(caption
                            ? {}
                            : {
                                  border: "1px dashed var(--mantine-color-gray-3)",
                                  background: "var(--mantine-color-gray-0)",
                              }),
                    }}
                >
                    {caption || "클릭하여 사진 설명 입력"}
                </figcaption>
            )}
        </NodeViewWrapper>
    );
}

/* ─── TipTap Extension ─── */
export const FigureImage = Node.create({
    name: "figureImage",

    group: "block",

    atom: true,

    draggable: true,

    addAttributes() {
        return {
            src: { default: null },
            alt: { default: null },
            caption: { default: null },
        };
    },

    parseHTML() {
        return [
            {
                tag: "figure[data-figure-image]",
                getAttrs(dom: HTMLElement) {
                    const img = dom.querySelector("img");
                    const figcaption = dom.querySelector("figcaption");
                    return {
                        src: img?.getAttribute("src") || null,
                        alt: img?.getAttribute("alt") || null,
                        caption: figcaption?.textContent || null,
                    };
                },
            },
        ];
    },

    renderHTML({ HTMLAttributes }) {
        const { src, alt, caption, ...rest } = HTMLAttributes;
        const figureAttrs = mergeAttributes(rest, { "data-figure-image": "" });

        if (caption) {
            return [
                "figure",
                figureAttrs,
                ["img", { src, alt: alt || "" }],
                ["figcaption", {}, caption],
            ];
        }
        return ["figure", figureAttrs, ["img", { src, alt: alt || "" }]];
    },

    addNodeView() {
        return ReactNodeViewRenderer(FigureImageView);
    },
});
