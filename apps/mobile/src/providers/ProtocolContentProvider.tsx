import type { OfflinePackageFailureStatus, OfflineProtocolRepository } from "@rapidaid/protocol-engine";
import { PropsWithChildren, createContext, useContext, useEffect, useState } from "react";

import { createTrustedMobileProtocolRepository } from "@/protocols/mobileProtocolRepository";
import { PresentationGuide, toPresentationGuide } from "@/protocols/presentation";

export type ProtocolContentFailureStatus = OfflinePackageFailureStatus | "not-found";

export type ProtocolContentState =
  | { status: "loading"; guides: readonly [] }
  | {
    status: "ready";
    guides: readonly PresentationGuide[];
    packageVersion: string;
    mode: "trusted-release" | "development-preview";
  }
  | { status: ProtocolContentFailureStatus; guides: readonly [] };

export type DevelopmentProtocolPreview = Readonly<{
  previewVersion: string;
  guides: readonly PresentationGuide[];
}>;

type ProtocolContentProviderProps = PropsWithChildren<{
  repository?: OfflineProtocolRepository;
  developmentPreview?: DevelopmentProtocolPreview;
}>;

const ProtocolContentContext = createContext<ProtocolContentState | null>(null);
const defaultRepository = createTrustedMobileProtocolRepository();
const loadingState: ProtocolContentState = { status: "loading", guides: [] };

export function resolveDevelopmentProtocolPreview(
  preview: DevelopmentProtocolPreview | undefined,
  isDevelopmentBuild: boolean,
): DevelopmentProtocolPreview | undefined {
  return isDevelopmentBuild ? preview : undefined;
}

export function ProtocolContentProvider({
  children,
  repository = defaultRepository,
  developmentPreview,
}: ProtocolContentProviderProps) {
  const activePreview = resolveDevelopmentProtocolPreview(developmentPreview, __DEV__);
  const [snapshot, setSnapshot] = useState<{
    repository: OfflineProtocolRepository;
    state: ProtocolContentState;
  }>({ repository, state: loadingState });
  const trustedState = snapshot.repository === repository ? snapshot.state : loadingState;
  const state: ProtocolContentState = activePreview ? {
    status: "ready",
    packageVersion: activePreview.previewVersion,
    guides: activePreview.guides,
    mode: "development-preview",
  } : trustedState;

  useEffect(() => {
    let active = true;

    if (activePreview) {
      return () => { active = false; };
    }

    repository.loadPackage()
      .then((result) => {
        if (!active) return;
        if (result.status !== "ready") {
          setSnapshot({ repository, state: { status: result.status, guides: [] } });
          return;
        }
        setSnapshot({
          repository,
          state: {
            status: "ready",
            packageVersion: result.protocolPackage.manifest.packageVersion,
            guides: result.protocolPackage.protocols.map(toPresentationGuide),
            mode: "trusted-release",
          },
        });
      })
      .catch(() => {
        if (active) setSnapshot({ repository, state: { status: "storage-error", guides: [] } });
      });

    return () => {
      active = false;
    };
  }, [activePreview, repository]);

  return <ProtocolContentContext.Provider value={state}>{children}</ProtocolContentContext.Provider>;
}

export function useProtocolContent(): ProtocolContentState {
  const value = useContext(ProtocolContentContext);
  if (!value) throw new Error("useProtocolContent must be used inside ProtocolContentProvider.");
  return value;
}
