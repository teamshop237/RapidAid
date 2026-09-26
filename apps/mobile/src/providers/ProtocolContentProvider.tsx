import type { OfflinePackageFailureStatus, OfflineProtocolRepository } from "@rapidaid/protocol-engine";
import { PropsWithChildren, createContext, useContext, useEffect, useState } from "react";

import { createTrustedMobileProtocolRepository } from "@/protocols/mobileProtocolRepository";
import { PresentationGuide, toPresentationGuide } from "@/protocols/presentation";

export type ProtocolContentFailureStatus = OfflinePackageFailureStatus | "not-found";

export type ProtocolContentState =
  | { status: "loading"; guides: readonly [] }
  | { status: "ready"; guides: readonly PresentationGuide[]; packageVersion: string }
  | { status: ProtocolContentFailureStatus; guides: readonly [] };

type ProtocolContentProviderProps = PropsWithChildren<{
  repository?: OfflineProtocolRepository;
}>;

const ProtocolContentContext = createContext<ProtocolContentState | null>(null);
const defaultRepository = createTrustedMobileProtocolRepository();
const loadingState: ProtocolContentState = { status: "loading", guides: [] };

export function ProtocolContentProvider({ children, repository = defaultRepository }: ProtocolContentProviderProps) {
  const [snapshot, setSnapshot] = useState<{
    repository: OfflineProtocolRepository;
    state: ProtocolContentState;
  }>({ repository, state: loadingState });
  const state = snapshot.repository === repository ? snapshot.state : loadingState;

  useEffect(() => {
    let active = true;

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
          },
        });
      })
      .catch(() => {
        if (active) setSnapshot({ repository, state: { status: "storage-error", guides: [] } });
      });

    return () => {
      active = false;
    };
  }, [repository]);

  return <ProtocolContentContext.Provider value={state}>{children}</ProtocolContentContext.Provider>;
}

export function useProtocolContent(): ProtocolContentState {
  const value = useContext(ProtocolContentContext);
  if (!value) throw new Error("useProtocolContent must be used inside ProtocolContentProvider.");
  return value;
}
