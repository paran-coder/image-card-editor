import { ToolcraftApp } from "@/toolcraft/runtime/react";

import {
  handleImageCardPanelAction,
  ImageCardRenderer,
} from "../app/2026-07-02-image-card-renderer";
import { appSchema } from "../app/app-schema";

export function AppHome(): React.JSX.Element {
  return (
    <ToolcraftApp
      canvasContent={<ImageCardRenderer />}
      className="h-dvh min-h-dvh"
      onPanelAction={handleImageCardPanelAction}
      renderDefaultCanvasMedia={false}
      schema={appSchema}
    />
  );
}
