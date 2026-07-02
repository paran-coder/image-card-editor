import { describe, expect, it } from "vitest";

import { appPerformance } from "./app-performance";
import { appSchema } from "./app-schema";

const productSections =
  appSchema.panels.controls?.sections.filter((section) => section.title !== "Setup") ?? [];

describe("appSchema", () => {
  it("publishes the Image Card Editor product shell", () => {
    expect(appSchema.canvas.enabled).toBe(true);
    expect(appSchema.canvas.draggable).toBe(true);
    expect(appSchema.canvas.sizing).toEqual({ mode: "editable-output" });
    expect(appSchema.canvas.size).toEqual({ height: 1080, unit: "px", width: 1080 });
    expect(appSchema.canvas.upload).toBe(false);
    expect(appSchema.panels.layers).toBeUndefined();
    expect(appSchema.panels.timeline).toBeUndefined();
    expect(appSchema.toolbar).toEqual({
      history: true,
      radar: true,
      theme: true,
      zoom: true,
    });
    expect(appSchema.assembly.components).toEqual(["canvas", "controlsPanel", "toolbar"]);
  });

  it("groups product controls by card workflow", () => {
    expect(productSections.map((section) => section.title)).toEqual([
      "Source Image",
      "Card Format",
      "Image Placement",
      "Image Position",
      "Title Text",
      "Title Style",
      "Caption Text",
      "Caption Style",
      "Background",
      "Image Export",
      "Export",
    ]);
  });

  it("exposes the requested card controls", () => {
    const targets = productSections.flatMap((section) =>
      Object.values(section.controls).map((control) => control.target),
    );

    expect(targets).toEqual(
      expect.arrayContaining([
        "source.image",
        "card.ratio",
        "appearance.background",
        "image.scale",
        "image.position",
        "card.radius",
        "card.shadow",
        "title.text",
        "title.style",
        "caption.text",
        "caption.style",
        "export.image.format",
        "export.image.resolution",
        "export.actions",
      ]),
    );
  });

  it("keeps background and image export sections contract-compliant", () => {
    const background = productSections.find((section) => section.title === "Background");
    const imageExport = productSections.find((section) => section.title === "Image Export");
    const exportAction = appSchema.panels.controls?.sections
      .flatMap((section) => Object.values(section.controls))
      .find((control) => control.target === "export.actions");

    expect(background?.controls.includeBackground).toMatchObject({
      label: "Include",
      target: "export.includeBackground",
      type: "switch",
    });
    expect(background?.controls.backgroundColor).toMatchObject({
      label: false,
      target: "appearance.background",
      type: "color",
    });
    expect(imageExport?.controls.imageFormat).toMatchObject({
      target: "export.image.format",
      type: "select",
    });
    expect(imageExport?.controls.imageResolution).toMatchObject({
      defaultValue: "4k",
      target: "export.image.resolution",
      type: "select",
    });
    expect(exportAction).toMatchObject({
      target: "export.actions",
      type: "panelActions",
    });
  });

  it("declares product renderer performance coverage", () => {
    expect(appPerformance.usesCustomRenderer).toBe(true);
    expect(appPerformance.rendererStrategy).toBe("dom");
    expect(appPerformance.rendererWorkload).toBe("simple-composition");
    expect(appPerformance.workloadTargets).toEqual(
      expect.arrayContaining(["source.image", "image.scale", "export.image.resolution"]),
    );
    expect(appPerformance.scenarios.map((scenario) => scenario.id)).toEqual(
      expect.arrayContaining(["source-image-import", "image-scale-drag", "png-export-8k"]),
    );
  });
});
