import { existsSync, readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

type Decision = {
  allowedActions: string[];
  approvalRequiredFor: string[];
  decision: string;
  evidence: string[];
  id: string;
  implementationStatus: string;
  scope: string;
  source: string;
  status: string;
};

const REGISTER_PATH = 'docs/authority/owner-decisions.json';
const CONTRACT_PATH = 'docs/authority/owner-authority.md';
const registry = JSON.parse(readFileSync(REGISTER_PATH, 'utf8')) as {
  recognizedImplementationStatuses: string[];
  recognizedStatuses: string[];
  decisions: Decision[];
};

describe('canonical owner authority', () => {
  it('registers unique, traceable decisions with recognized states', () => {
    expect(existsSync(CONTRACT_PATH)).toBe(true);
    expect(registry.decisions).toHaveLength(30);
    expect(new Set(registry.decisions.map(({ id }) => id)).size).toBe(30);

    for (const decision of registry.decisions) {
      expect(registry.recognizedStatuses).toContain(decision.status);
      expect(registry.recognizedImplementationStatuses).toContain(decision.implementationStatus);
      expect(decision.scope).not.toBe('');
      expect(decision.source).not.toBe('');
      expect(decision.allowedActions.length).toBeGreaterThan(0);
      expect(decision.approvalRequiredFor.length).toBeGreaterThan(0);
      expect(decision.evidence.length).toBeGreaterThan(0);
    }
  });

  it('records confirmed product policies separately from unresolved decisions', () => {
    const confirmed = registry.decisions.filter(({ status }) => status !== 'PROPOSED');
    const unresolved = registry.decisions.filter(({ status }) => status === 'PROPOSED');

    expect(confirmed).toHaveLength(18);
    expect(unresolved).toHaveLength(12);
    expect(
      unresolved.every(({ implementationStatus }) => implementationStatus !== 'SATISFIED'),
    ).toBe(true);
  });

  it('preserves consequential-action gates and the owner-authored audio attestation', () => {
    const contract = readFileSync(CONTRACT_PATH, 'utf8');
    for (const gate of [
      'remote push',
      'deployment',
      'Neon action',
      'database mutation',
      'payment operation',
      'reward-balance change',
      'final artistic acceptance',
    ]) {
      expect(contract).toContain(gate);
    }

    expect(registry.decisions.find(({ id }) => id === 'AUDIO-001')).toMatchObject({
      implementationStatus: 'SATISFIED',
      status: 'OWNER_APPROVED_POLICY',
    });
    expect(registry.decisions.find(({ id }) => id === 'GAMES-001')?.approvalRequiredFor).toContain(
      'Create codex/blossomware-system-panic-v1',
    );
  });
});
