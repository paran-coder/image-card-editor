import { defineToolcraft } from "@/toolcraft/runtime";

export const appSchema = defineToolcraft({
  canvas: {
    draggable: true,
    enabled: true,
    size: { height: 1080, unit: "px", width: 1080 },
    sizing: { mode: "editable-output" },
    upload: false,
  },
  export: {
    png: {
      background: "transparent",
    },
  },
  panels: {
    controls: {
      sections: [
        {
          title: "Source Image",
          controls: {
            sourceImage: {
              accept: "image/*",
              assetKind: "image",
              defaultValue: [],
              label: "Image",
              orderRole: "input",
              performanceReason:
                "Importing source media changes the card preview bitmap and export input.",
              performanceRole: "workload",
              target: "source.image",
              type: "fileDrop",
            },
          },
        },
        {
          title: "Custom Font",
          controls: {
            embeddedFont: {
              accept: ".ttf,.otf,.woff,.woff2,font/*,application/font-woff,application/font-woff2",
              assetKind: "file",
              defaultValue: [],
              label: "Font File",
              orderRole: "input",
              performanceReason:
                "Uploading a custom font changes text rendering and is persisted by runtime media storage.",
              performanceRole: "workload",
              target: "font.embed",
              type: "fileDrop",
            },
          },
        },
        {
          title: "Card Style",
          controls: {
            cornerRadius: {
              defaultValue: 36,
              label: "Radius",
              max: 96,
              min: 0,
              orderRole: "detail",
              performanceReason:
                "Radius changes CSS clipping and should stay responsive while dragging.",
              performanceRole: "responsiveness",
              step: 1,
              target: "card.radius",
              type: "slider",
              unit: "px",
            },
            shadowStrength: {
              defaultValue: 24,
              label: "Depth",
              max: 100,
              min: 0,
              orderRole: "detail",
              performanceReason:
                "Depth updates the card lift, halo, and inner edge treatment in the preview.",
              performanceRole: "responsiveness",
              step: 1,
              target: "card.shadow",
              type: "slider",
              unit: "px",
            },
          },
        },
        {
          title: "Image Placement",
          controls: {
            imageScale: {
              defaultValue: 1,
              label: "Scale",
              max: 2,
              min: 0.6,
              orderRole: "strength",
              performanceReason:
                "Dragging scale changes the source image transform live over the card.",
              performanceRole: "responsiveness",
              step: 0.01,
              target: "image.scale",
              type: "slider",
            },
            imagePosition: {
              coordinateMode: "screen",
              defaultValue: { x: 0, y: 0 },
              label: "Image Position",
              orderRole: "spatial",
              performanceReason:
                "Position changes the image transform and should update during vector dragging.",
              performanceRole: "responsiveness",
              target: "image.position",
              type: "vector",
              xLabel: "X",
              yLabel: "Y",
            },
          },
        },
        {
          title: "Title Text",
          controls: {
            titleText: {
              commitMode: "content",
              defaultValue: "Weekend Market",
              label: "Title",
              orderRole: "primary",
              performanceReason:
                "Title content changes native DOM text in the product preview.",
              performanceRole: "responsiveness",
              target: "title.text",
              type: "text",
            },
            titleStyle: {
              defaultValue: {
                color: "#FFFFFF",
                fontId: "inter",
                fontSize: 72,
                fontWeight: "800",
                letterSpacing: "tight",
                lineHeight: "tight",
                opacity: 100,
                textCase: "original",
              },
              label: "Title Style",
              orderRole: "primary",
              performanceReason:
                "Title typography updates DOM text style without heavy rendering work.",
              performanceRole: "responsiveness",
              target: "title.style",
              type: "fontPicker",
            },
          },
        },
        {
          title: "Caption Text",
          controls: {
            captionText: {
              commitMode: "content",
              defaultValue: "Fresh finds, handmade goods, and coffee from 10 AM.",
              label: "Caption",
              orderRole: "primary",
              performanceReason:
                "Caption content changes native DOM text in the product preview.",
              performanceRole: "responsiveness",
              target: "caption.text",
              type: "text",
            },
            captionStyle: {
              defaultValue: {
                color: "#FFFFFF",
                fontId: "inter",
                fontSize: 34,
                fontWeight: "500",
                letterSpacing: "normal",
                lineHeight: "snug",
                opacity: 92,
                textCase: "original",
              },
              label: "Caption Style",
              orderRole: "primary",
              performanceReason:
                "Caption typography updates DOM text style without heavy rendering work.",
              performanceRole: "responsiveness",
              target: "caption.style",
              type: "fontPicker",
            },
          },
        },
        {
          title: "Background",
          controls: {
            includeBackground: {
              defaultValue: true,
              label: "Include",
              orderRole: "mode",
              performanceReason:
                "The background include switch changes preview transparency and PNG alpha.",
              performanceRole: "responsiveness",
              target: "export.includeBackground",
              type: "switch",
            },
            backgroundColor: {
              defaultValue: { hex: "#111827" },
              label: false,
              orderRole: "color",
              performanceReason:
                "Background color changes the product card fill and exported pixels.",
              performanceRole: "responsiveness",
              target: "appearance.background",
              type: "color",
            },
          },
          layoutGroups: [
            {
              columns: 2,
              controls: ["includeBackground", "backgroundColor"],
              layout: "inline",
            },
          ],
        },
        {
          title: "Image Export",
          controls: {
            imageFormat: {
              defaultValue: "png",
              label: "Format",
              options: [
                { label: "PNG", value: "png" },
                { label: "JPG", value: "jpg" },
              ],
              orderRole: "action",
              performanceReason:
                "Image format changes export encoding only when the footer action runs.",
              performanceRole: "responsiveness",
              target: "export.image.format",
              type: "select",
            },
            imageResolution: {
              defaultValue: "4k",
              label: "Resolution",
              options: [
                { label: "2K", value: "2k" },
                { label: "4K", value: "4k" },
                { label: "8K", value: "8k" },
              ],
              orderRole: "action",
              performanceReason:
                "Image resolution affects PNG export pixel dimensions and export workload.",
              performanceRole: "workload",
              target: "export.image.resolution",
              type: "select",
            },
          },
          layoutGroups: [
            {
              columns: 2,
              controls: ["imageFormat", "imageResolution"],
              layout: "inline",
            },
          ],
        },
        {
          actionGroup: "primary",
          title: "Export",
          controls: {
            exportActions: {
              actions: [
                {
                  icon: "upload-simple",
                  label: "Export PNG",
                  value: "export-png",
                },
              ],
              defaultValue: "export-png",
              label: "Export",
              orderRole: "action",
              performanceReason:
                "The footer action creates the final image file from current runtime state.",
              performanceRole: "workload",
              target: "export.actions",
              type: "panelActions",
            },
          },
        },
      ],
      title: "Image Card",
    },
  },
  persistence: {
    include: ["values", "canvas", "panels", "media"],
    key: "toolcraft:image-card-editor:state:v1",
    storage: "localStorage",
    version: 1,
  },
  settingsTransfer: {
    appId: "image-card-editor",
    enabled: true,
    fileName: "image-card-settings",
  },
  toolbar: {
    history: true,
    radar: true,
    theme: true,
    zoom: true,
  },
});
