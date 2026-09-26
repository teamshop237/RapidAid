import type { AuditEvent, ContentWorkflowStore, ProtocolAggregate } from "./types";
import { WorkflowError } from "./types";

function clone<T>(value: T): T {
  return structuredClone(value);
}

function deepFreeze<T>(value: T): T {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const child of Object.values(value)) deepFreeze(child);
  }
  return value;
}

function immutableClone<T>(value: T): T {
  return deepFreeze(clone(value));
}

export class InMemoryContentWorkflowStore implements ContentWorkflowStore {
  readonly #protocols = new Map<string, ProtocolAggregate>();
  readonly #audit: AuditEvent[] = [];

  listProtocols(): readonly ProtocolAggregate[] {
    return immutableClone([...this.#protocols.values()]);
  }

  getProtocol(protocolId: string): ProtocolAggregate | null {
    const aggregate = this.#protocols.get(protocolId);
    return aggregate ? immutableClone(aggregate) : null;
  }

  commitProtocol(expectedRevision: number | null, aggregate: ProtocolAggregate, event: AuditEvent): void {
    const current = this.#protocols.get(aggregate.protocolId);
    const currentRevision = current?.revision ?? null;
    if (currentRevision !== expectedRevision) {
      throw new WorkflowError("revision-conflict", "Protocol changed during this operation.");
    }
    this.#protocols.set(aggregate.protocolId, immutableClone(aggregate));
    this.#audit.push(immutableClone(event));
  }

  appendAudit(event: AuditEvent): void {
    this.#audit.push(immutableClone(event));
  }

  listAudit(protocolId?: string): readonly AuditEvent[] {
    const events = protocolId ? this.#audit.filter((event) => event.protocolId === protocolId) : this.#audit;
    return immutableClone(events);
  }
}
