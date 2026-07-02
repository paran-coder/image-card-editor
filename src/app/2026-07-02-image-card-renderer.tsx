import * as React from "react";

import {
  createToolcraftPngExportCanvas,
  shouldIncludeToolcraftPreviewBackground,
} from "@/toolcraft/runtime";
import { useToolcraft } from "@/toolcraft/runtime/react";
import type { ToolcraftPanelActionHandler } from "@/toolcraft/runtime/react";
import type { ToolcraftMediaAsset, ToolcraftState } from "@/toolcraft/runtime/state/types";

type HexColorValue = {
  hex?: string;
};

type FontStyleValue = {
  color?: string;
  fontId?: string;
  fontSize?: number;
  fontWeight?: string;
  letterSpacing?: "tight" | "tighter" | "normal" | "wide" | "wider" | "widest";
  lineHeight?: "loose" | "none" | "normal" | "relaxed" | "snug" | "tight";
  opacity?: number;
  textCase?: "capitalize" | "lowercase" | "original" | "titleCase" | "uppercase";
};

type VectorValue = {
  x?: number;
  y?: number;
};

type CardRenderModel = {
  background: string;
  captionStyle: Required<FontStyleValue>;
  captionText: string;
  imagePosition: Required<VectorValue>;
  imageScale: number;
  includeBackground: boolean;
  radius: number;
  ratio: string;
  shadow: number;
  source?: ToolcraftMediaAsset;
  titleStyle: Required<FontStyleValue>;
  titleText: string;
};

const fontSizeFallbacks = {
  caption: 34,
  title: 72,
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function readString(value: unknown, fallback: string): string {
  return typeof value === "string" ? value : fallback;
}

function readNumber(value: unknown, fallback: number): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value);

    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return fallback;
}

function readHex(value: unknown, fallback: string): string {
  if (isRecord(value) && typeof value.hex === "string") {
    return value.hex;
  }

  return fallback;
}

function readVector(value: unknown): Required<VectorValue> {
  if (!isRecord(value)) {
    return { x: 0, y: 0 };
  }

  return {
    x: readNumber(value.x, 0),
    y: readNumber(value.y, 0),
  };
}

function readFontStyle(
  value: unknown,
  fallback: Required<FontStyleValue>,
): Required<FontStyleValue> {
  if (!isRecord(value)) {
    return fallback;
  }

  return {
    color: readString(value.color, fallback.color),
    fontId: readString(value.fontId, fallback.fontId),
    fontSize: readNumber(value.fontSize, fallback.fontSize),
    fontWeight: readString(value.fontWeight, fallback.fontWeight),
    letterSpacing: readString(
      value.letterSpacing,
      fallback.letterSpacing,
    ) as Required<FontStyleValue>["letterSpacing"],
    lineHeight: readString(
      value.lineHeight,
      fallback.lineHeight,
    ) as Required<FontStyleValue>["lineHeight"],
    opacity: readNumber(value.opacity, fallback.opacity),
    textCase: readString(
      value.textCase,
      fallback.textCase,
    ) as Required<FontStyleValue>["textCase"],
  };
}

function getCardAspectRatio(ratio: string): string {
  if (ratio === "4:5") {
    return "4 / 5";
  }

  if (ratio === "16:9") {
    return "16 / 9";
  }

  return "1 / 1";
}

function getCardSizeForCanvas(state: ToolcraftState, ratio: string): { height: number; width: number } {
  const canvasWidth = state.canvas.size.width;
  const canvasHeight = state.canvas.size.height;
  const ratioNumber = ratio === "4:5" ? 4 / 5 : ratio === "16:9" ? 16 / 9 : 1;
  const widthFromHeight = canvasHeight * ratioNumber;

  if (widthFromHeight <= canvasWidth) {
    return { height: canvasHeight, width: widthFromHeight };
  }

  return { height: canvasWidth / ratioNumber, width: canvasWidth };
}

function getPreviewCardSize(
  state: ToolcraftState,
  ratio: string,
): { height: string; width: string } {
  const cardSize = getCardSizeForCanvas(state, ratio);
  const widthPercent = (cardSize.width / state.canvas.size.width) * 100;
  const heightPercent = (cardSize.height / state.canvas.size.height) * 100;
  const maxPercent = 82;
  const scale = maxPercent / Math.max(widthPercent, heightPercent);

  return {
    height: `${heightPercent * scale}%`,
    width: `${widthPercent * scale}%`,
  };
}

function getFirstSourceImage(state: ToolcraftState): ToolcraftMediaAsset | undefined {
  return (
    state.mediaAssets.find((asset) => asset.sourceTarget === "source.image") ??
    state.mediaAssets.find((asset) => asset.assetKind === "image")
  );
}

function getRenderModel(state: ToolcraftState): CardRenderModel {
  return {
    background: readHex(state.values["appearance.background"], "#111827"),
    captionStyle: readFontStyle(state.values["caption.style"], {
      color: "#FFFFFF",
      fontId: "inter",
      fontSize: fontSizeFallbacks.caption,
      fontWeight: "500",
      letterSpacing: "normal",
      lineHeight: "snug",
      opacity: 92,
      textCase: "original",
    }),
    captionText: readString(
      state.values["caption.text"],
      "Fresh finds, handmade goods, and coffee from 10 AM.",
    ),
    imagePosition: readVector(state.values["image.position"]),
    imageScale: readNumber(state.values["image.scale"], 1),
    includeBackground: shouldIncludeToolcraftPreviewBackground({ state }),
    radius: readNumber(state.values["card.radius"], 36),
    ratio: readString(state.values["card.ratio"], "1:1"),
    shadow: readNumber(state.values["card.shadow"], 24),
    source: getFirstSourceImage(state),
    titleStyle: readFontStyle(state.values["title.style"], {
      color: "#FFFFFF",
      fontId: "inter",
      fontSize: fontSizeFallbacks.title,
      fontWeight: "800",
      letterSpacing: "tight",
      lineHeight: "tight",
      opacity: 100,
      textCase: "original",
    }),
    titleText: readString(state.values["title.text"], "Weekend Market"),
  };
}

function getLetterSpacing(style: Required<FontStyleValue>, scale = 1): string {
  const sizes: Record<Required<FontStyleValue>["letterSpacing"], number> = {
    tight: -0.02,
    tighter: -0.035,
    normal: 0,
    wide: 0.025,
    wider: 0.045,
    widest: 0.075,
  };

  return `${sizes[style.letterSpacing] * style.fontSize * scale}px`;
}

function getLineHeight(style: Required<FontStyleValue>): number {
  const lineHeights: Record<Required<FontStyleValue>["lineHeight"], number> = {
    loose: 1.65,
    none: 1,
    normal: 1.35,
    relaxed: 1.5,
    snug: 1.2,
    tight: 1.08,
  };

  return lineHeights[style.lineHeight];
}

function getTextTransform(style: Required<FontStyleValue>): React.CSSProperties["textTransform"] {
  if (style.textCase === "uppercase") {
    return "uppercase";
  }

  if (style.textCase === "lowercase") {
    return "lowercase";
  }

  if (style.textCase === "capitalize" || style.textCase === "titleCase") {
    return "capitalize";
  }

  return "none";
}

function getFontFamily(style: Required<FontStyleValue>): string {
  return style.fontId === "inter"
    ? "'Inter Variable', Inter, ui-sans-serif, system-ui, sans-serif"
    : "ui-sans-serif, system-ui, sans-serif";
}

function getMediaTransform(model: CardRenderModel): string {
  const offsetX = getImageOffsetPercent(model.imagePosition.x);
  const offsetY = getImageOffsetPercent(model.imagePosition.y);
  const transforms = [
    "translate(-50%, -50%)",
    `translate(${offsetX}%, ${offsetY}%)`,
    `scale(${model.imageScale})`,
  ];

  if (model.source?.transform?.rotationDeg) {
    transforms.push(`rotate(${model.source.transform.rotationDeg}deg)`);
  }

  const flipX = model.source?.transform?.flipHorizontal ? -1 : 1;
  const flipY = model.source?.transform?.flipVertical ? -1 : 1;

  if (flipX !== 1 || flipY !== 1) {
    transforms.push(`scale(${flipX}, ${flipY})`);
  }

  return transforms.join(" ");
}

function getImageOffsetPercent(value: number): number {
  if (Math.abs(value) <= 1) {
    return value * 34;
  }

  return value;
}

function getImageObjectPosition(model: CardRenderModel): string {
  const x = 50 + getImageOffsetPercent(model.imagePosition.x);
  const y = 50 + getImageOffsetPercent(model.imagePosition.y);

  return `${Math.max(0, Math.min(100, x))}% ${Math.max(0, Math.min(100, y))}%`;
}

function getTextStyle(style: Required<FontStyleValue>, scale = 1): React.CSSProperties {
  return {
    color: style.color,
    fontFamily: getFontFamily(style),
    fontSize: `${style.fontSize * scale}px`,
    fontWeight: style.fontWeight,
    letterSpacing: getLetterSpacing(style, scale),
    lineHeight: getLineHeight(style),
    opacity: style.opacity / 100,
    textTransform: getTextTransform(style),
  };
}

function getPreviewBoxShadow(shadow: number): string {
  if (shadow <= 0) {
    return "none";
  }

  const y = Math.round(shadow * 0.85);
  const blur = Math.round(shadow * 2.4);
  const spread = Math.round(shadow * 0.12);
  const opacity = Math.min(0.55, 0.18 + shadow / 110);

  return [
    `0 ${y}px ${blur}px ${spread}px rgba(2, 6, 23, ${opacity})`,
    `0 ${Math.max(2, Math.round(shadow * 0.12))}px ${Math.max(8, Math.round(shadow * 0.55))}px rgba(15, 23, 42, 0.28)`,
  ].join(", ");
}

function getShadowHaloStyle(
  shadow: number,
  radius: number,
): React.CSSProperties | undefined {
  if (shadow <= 0) {
    return undefined;
  }

  const spread = Math.round(18 + shadow * 1.5);
  const opacity = Math.min(0.78, 0.18 + shadow / 86);

  return {
    background:
      "radial-gradient(ellipse at center, rgba(255,255,255,0.22) 0%, rgba(148,163,184,0.22) 32%, rgba(2,6,23,0.62) 58%, rgba(2,6,23,0) 78%)",
    borderRadius: `${radius + Math.round(spread * 0.28)}px`,
    filter: `blur(${Math.max(10, Math.round(shadow * 0.35))}px)`,
    inset: `-${spread}px`,
    opacity,
    position: "absolute",
    transform: `translateY(${Math.round(shadow * 0.22)}px)`,
    zIndex: 0,
  };
}

export function ImageCardRenderer(): React.JSX.Element {
  const { state } = useToolcraft();
  const model = getRenderModel(state);
  const previewCardSize = getPreviewCardSize(state, model.ratio);
  const shadowHaloStyle = getShadowHaloStyle(model.shadow, model.radius);

  return (
    <div
      aria-label="Image card preview"
      data-product-output="image-card"
      style={{
        alignItems: "center",
        display: "flex",
        height: "100%",
        justifyContent: "center",
        padding: "9%",
        width: "100%",
      }}
    >
      <div
        style={{
          height: previewCardSize.height,
          position: "relative",
          width: previewCardSize.width,
        }}
      >
        {shadowHaloStyle ? (
          <div aria-hidden="true" data-product-shadow-halo="true" style={shadowHaloStyle} />
        ) : null}
        <article
          data-product-card-ratio={model.ratio}
          style={{
            aspectRatio: getCardAspectRatio(model.ratio),
            background: model.includeBackground ? model.background : "transparent",
            borderRadius: `${model.radius}px`,
            boxShadow: getPreviewBoxShadow(model.shadow),
            height: "100%",
            overflow: "hidden",
            position: "relative",
            width: "100%",
            zIndex: 1,
          }}
        >
          {model.shadow > 0 ? (
            <div
              aria-hidden="true"
              data-product-shadow-inner="true"
              style={{
                border: `${Math.max(1, Math.round(model.shadow / 18))}px solid rgba(255,255,255,${Math.min(0.26, 0.08 + model.shadow / 360)})`,
                borderRadius: "inherit",
                boxShadow: `inset 0 0 ${Math.round(model.shadow * 0.7)}px rgba(2,6,23,${Math.min(0.42, 0.12 + model.shadow / 180)})`,
                inset: 0,
                pointerEvents: "none",
                position: "absolute",
                zIndex: 5,
              }}
            />
          ) : null}
          {model.source ? (
            <img
              alt=""
              data-product-source-image="true"
              src={model.source.dataUrl}
              style={{
                height: "100%",
                left: "50%",
                objectFit: "cover",
                objectPosition: getImageObjectPosition(model),
                position: "absolute",
                top: "50%",
                transform: getMediaTransform(model),
                transformOrigin: "center",
                width: "100%",
              }}
            />
          ) : null}
          <div
            aria-hidden="true"
            style={{
              background:
                "linear-gradient(180deg, rgba(15,23,42,0.62) 0%, rgba(15,23,42,0.12) 42%, rgba(15,23,42,0.72) 100%)",
              inset: 0,
              position: "absolute",
            }}
          />
          <div
            data-product-title="true"
            style={{
              ...getTextStyle(model.titleStyle),
              left: "7%",
              maxWidth: "86%",
              overflowWrap: "break-word",
              position: "absolute",
              right: "7%",
              top: "7%",
            }}
          >
            {model.titleText}
          </div>
          <div
            data-product-caption="true"
            style={{
              ...getTextStyle(model.captionStyle),
              bottom: "7%",
              left: "7%",
              maxWidth: "78%",
              overflowWrap: "break-word",
              position: "absolute",
              right: "15%",
            }}
          >
            {model.captionText}
          </div>
        </article>
      </div>
    </div>
  );
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();

    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Unable to load source image for export."));
    image.src = src;
  });
}

function getImageCoverDrawRect(
  image: HTMLImageElement,
  width: number,
  height: number,
): { drawHeight: number; drawWidth: number; x: number; y: number } {
  const scale = Math.max(width / image.naturalWidth, height / image.naturalHeight);
  const drawWidth = image.naturalWidth * scale;
  const drawHeight = image.naturalHeight * scale;

  return {
    drawHeight,
    drawWidth,
    x: (width - drawWidth) / 2,
    y: (height - drawHeight) / 2,
  };
}

function drawWrappedText({
  context,
  maxWidth,
  text,
  x,
  y,
}: {
  context: CanvasRenderingContext2D;
  maxWidth: number;
  text: string;
  x: number;
  y: number;
}): void {
  const words = text.split(/\s+/).filter(Boolean);
  const lineHeight = Number.parseFloat(context.font.match(/(\d+(?:\.\d+)?)px/)?.[1] ?? "32") * 1.22;
  let line = "";
  let cursorY = y;

  for (const word of words) {
    const testLine = line ? `${line} ${word}` : word;

    if (context.measureText(testLine).width > maxWidth && line) {
      context.fillText(line, x, cursorY);
      line = word;
      cursorY += lineHeight;
    } else {
      line = testLine;
    }
  }

  if (line) {
    context.fillText(line, x, cursorY);
  }
}

function setCanvasTextStyle(
  context: CanvasRenderingContext2D,
  style: Required<FontStyleValue>,
  scale: number,
): void {
  context.fillStyle = style.color;
  context.font = `${style.fontWeight} ${style.fontSize * scale}px Inter, Arial, sans-serif`;
  context.globalAlpha = style.opacity / 100;
  context.textBaseline = "top";
}

async function exportImageCardPng(
  state: ToolcraftState,
  reportProgress: (progress: number) => void,
): Promise<void> {
  const model = getRenderModel(state);
  const image = model.source ? await loadImage(model.source.dataUrl) : null;
  const ratioSize = getCardSizeForCanvas(state, model.ratio);
  const x = (state.canvas.size.width - ratioSize.width) / 2;
  const y = (state.canvas.size.height - ratioSize.height) / 2;

  reportProgress(0.35);

  const canvas = createToolcraftPngExportCanvas({
    background: model.background,
    includeBackground: model.includeBackground,
    resolution: String(state.values["export.image.resolution"] ?? "4k"),
    state,
    render: ({ context }) => {
      context.save();
      context.beginPath();
      context.roundRect(x, y, ratioSize.width, ratioSize.height, model.radius);
      context.clip();

      if (model.includeBackground) {
        context.fillStyle = model.background;
        context.fillRect(x, y, ratioSize.width, ratioSize.height);
      }

      if (image) {
        const rect = getImageCoverDrawRect(image, ratioSize.width, ratioSize.height);

        context.save();
        context.translate(
          x + ratioSize.width / 2 + (model.imagePosition.x / 100) * ratioSize.width,
          y + ratioSize.height / 2 + (model.imagePosition.y / 100) * ratioSize.height,
        );
        context.scale(model.imageScale, model.imageScale);

        if (model.source?.transform?.rotationDeg) {
          context.rotate((model.source.transform.rotationDeg * Math.PI) / 180);
        }

        context.scale(
          model.source?.transform?.flipHorizontal ? -1 : 1,
          model.source?.transform?.flipVertical ? -1 : 1,
        );
        context.drawImage(
          image,
          rect.x - ratioSize.width / 2,
          rect.y - ratioSize.height / 2,
          rect.drawWidth,
          rect.drawHeight,
        );
        context.restore();
      }

      const gradient = context.createLinearGradient(0, y, 0, y + ratioSize.height);
      gradient.addColorStop(0, "rgba(15,23,42,0.62)");
      gradient.addColorStop(0.42, "rgba(15,23,42,0.12)");
      gradient.addColorStop(1, "rgba(15,23,42,0.72)");
      context.fillStyle = gradient;
      context.fillRect(x, y, ratioSize.width, ratioSize.height);

      setCanvasTextStyle(context, model.titleStyle, ratioSize.width / 1080);
      drawWrappedText({
        context,
        maxWidth: ratioSize.width * 0.86,
        text: model.titleText,
        x: x + ratioSize.width * 0.07,
        y: y + ratioSize.height * 0.07,
      });

      setCanvasTextStyle(context, model.captionStyle, ratioSize.width / 1080);
      drawWrappedText({
        context,
        maxWidth: ratioSize.width * 0.78,
        text: model.captionText,
        x: x + ratioSize.width * 0.07,
        y: y + ratioSize.height * 0.8,
      });
      context.restore();
    },
  });

  reportProgress(0.72);

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((result) => {
      if (result) {
        resolve(result);
      } else {
        reject(new Error("Unable to encode PNG export."));
      }
    }, "image/png");
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.download = "image-card.png";
  anchor.href = url;
  anchor.click();
  URL.revokeObjectURL(url);
  reportProgress(1);
}

export const handleImageCardPanelAction: ToolcraftPanelActionHandler = ({
  action,
  reportProgress,
  state,
}) => {
  if (action.value !== "export-png") {
    return undefined;
  }

  return exportImageCardPng(state, reportProgress);
};
