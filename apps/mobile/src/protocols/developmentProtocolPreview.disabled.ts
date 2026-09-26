import type { DevelopmentProtocolPreview } from "@/providers/ProtocolContentProvider";

// Metro substitutes this module for production bundles. Draft source content
// is therefore absent from the release graph, in addition to the __DEV__ gate.
export const odersaDevelopmentProtocolPreview: DevelopmentProtocolPreview | undefined = undefined;
