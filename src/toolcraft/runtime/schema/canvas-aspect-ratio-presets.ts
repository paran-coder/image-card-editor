import type { ToolcraftCanvasSize } from "./types";

export type ToolcraftCanvasAspectRatioPresetValue =
  | "9:16"
  | "3:4"
  | "4:5"
  | "1:1"
  | "5:4"
  | "4:3"
  | "16:9";

export type ToolcraftCanvasAspectRatioPreset = {
  height: number;
  ratioHeight: number;
  ratioWidth: number;
  value: ToolcraftCanvasAspectRatioPresetValue;
  width: number;
};

export const toolcraftCanvasAspectRatioPresets = [
  { height: 1920, ratioHeight: 16, ratioWidth: 9, value: "9:16", width: 1080 },
  { height: 1440, ratioHeight: 4, ratioWidth: 3, value: "3:4", width: 1080 },
  { height: 1350, ratioHeight: 5, ratioWidth: 4, value: "4:5", width: 1080 },
  { height: 1080, ratioHeight: 1, ratioWidth: 1, value: "1:1", width: 1080 },
  { height: 1080, ratioHeight: 4, ratioWidth: 5, value: "5:4", width: 1350 },
  { height: 1080, ratioHeight: 3, ratioWidth: 4, value: "4:3", width: 1440 },
  { height: 1080, ratioHeight: 9, ratioWidth: 16, value: "16:9", width: 1920 },
] as const satisfies readonly ToolcraftCanvasAspectRatioPreset[];

export const toolcraftCanvasAspectRatioPresetValues = new Set<string>(
  toolcraftCanvasAspectRatioPresets.map((preset) => preset.value),
);

export function getToolcraftCanvasAspectRatioPreset(
  value: string,
): ToolcraftCanvasAspectRatioPreset | null {
  return (
    toolcraftCanvasAspectRatioPresets.find((preset) => preset.value === value) ?? null
  );
}

export function getToolcraftCanvasAspectRatioPresetBySize(
  size: ToolcraftCanvasSize,
): ToolcraftCanvasAspectRatioPreset | null {
  return (
    toolcraftCanvasAspectRatioPresets.find(
      (preset) => preset.width === size.width && preset.height === size.height,
    ) ?? null
  );
}
