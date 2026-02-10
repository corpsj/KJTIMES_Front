import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer, NodeViewWrapper } from "@tiptap/react";
import { useState, useCallback } from "react";

/* ─── React NodeView ─── */
function FigureImageView({ node, updateAttributes, selected }: any) {
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
                    border: selected ? "2px solid #228be6" : "2px solid transparent",
                    borderRadius: 6,
                    overflow: "hidden",
                    transition: "border-color 0.15s",
                }}
            >
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
                        color: "#6b7280",
                        border: "1px solid #d1d5db",
                        borderRadius: 4,
                        outline: "none",
                        background: "#fafafa",
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
                        color: caption ? "#6b7280" : "#9ca3af",
                        textAlign: "center",
                        cursor: "pointer",
                        borderRadius: 4,
                        lineHeight: 1.5,
                        minHeight: 28,
                        transition: "background 0.15s",
                        ...(caption
                            ? {}
                            : {
                                  border: "1px dashed #d1d5db",
                                  background: "#fafafa",
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
