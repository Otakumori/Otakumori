// DEPRECATED: This component is a duplicate. Use app\sign-in\[[...sign-in]]\page.tsx instead.
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit, Trash2, Save, X, Crown, Sparkles } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import {
  type CanonicalRuneId,
  type RuneDef,
  type RuneComboDef,
  DEFAULT_RUNE_DISPLAYS,
} from '../../../types/runes';
import { AdminLayout } from '@/components/admin/AdminNav';
import RuneGlyph from '@/app/components/runes/RuneGlyph';

interface EditableRuneDef extends Omit<RuneDef, 'createdAt' | 'updatedAt'> {
  createdAt?: Date;
  updatedAt?: Date;
}

interface EditableComboDef extends Omit<RuneComboDef, 'createdAt' | 'updatedAt'> {
  createdAt?: Date;
  updatedAt?: Date;
}

export default function AdminRunesPage() {
  const { user, isSignedIn, isLoaded } = useUser();
  const router = useRouter();
  const [runes, setRunes] = useState<EditableRuneDef[]>([]);
  const [combos, setCombos] = useState<EditableComboDef[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingRune, setEditingRune] = useState<EditableRuneDef | null>(null);
  const [editingCombo, setEditingCombo] = useState<EditableComboDef | null>(null);
  const [showRuneForm, setShowRuneForm] = useState(false);
  const [showComboForm, setShowComboForm] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/sign-in');
      return;
    }

    if (isSignedIn) {
      // Check if user is admin (you can implement your own admin check)
      loadRunes();
      loadCombos();
    }
  }, [isLoaded, isSignedIn, router]);

  const loadRunes = async () => {
    try {
      const response = await fetch('/api/admin/runes');
      if (response.ok) {
        const data = await response.json();
        setRunes(data.runes || []);
      }
    } catch (error) {
      console.error('Failed to load runes:', error);
    }
  };

  const loadCombos = async () => {
    try {
      const response = await fetch('/api/admin/runes/combos');
      if (response.ok) {
        const data = await response.json();
        setCombos(data.combos || []);
      }
    } catch (error) {
      console.error('Failed to load combos:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveRune = async (rune: EditableRuneDef) => {
    setSaving(true);
    try {
      const response = await fetch('/api/admin/runes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rune),
      });

      if (response.ok) {
        await loadRunes();
        setShowRuneForm(false);
        setEditingRune(null);
      }
    } catch (error) {
      console.error('Failed to save rune:', error);
    } finally {
      setSaving(false);
    }
  };

  const saveCombo = async (combo: EditableComboDef) => {
    setSaving(true);
    try {
      const response = await fetch('/api/admin/runes/combos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(combo),
      });

      if (response.ok) {
        await loadCombos();
        setShowComboForm(false);
        setEditingCombo(null);
      }
    } catch (error) {
      console.error('Failed to save combo:', error);
    } finally {
      setSaving(false);
    }
  };

  const deleteRune = async (runeId: string) => {
    if (!confirm('Are you sure you want to delete this rune?')) return;

    try {
      const response = await fetch(`/api/admin/runes/${runeId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await loadRunes();
      }
    } catch (error) {
      console.error('Failed to delete rune:', error);
    }
  };

  const deleteCombo = async (comboId: string) => {
    if (!confirm('Are you sure you want to delete this combo?')) return;

    try {
      const response = await fetch(`/api/admin/runes/combos/${comboId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await loadCombos();
      }
    } catch (error) {
      console.error('Failed to delete combo:', error);
    }
  };

  const getDefaultRuneDisplay = (canonicalId: CanonicalRuneId) => {
    return DEFAULT_RUNE_DISPLAYS[canonicalId] || { name: 'Unknown Rune', glyph: '✶' };
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950">
        <div className="text-center">
          <div className="mx-auto mb-4 h-32 w-32 animate-spin rounded-full border-b-2 border-pink-500"></div>
          <p className="text-lg text-pink-300">Loading rune system...</p>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold text-white">Rune System Admin</h1>
          <p className="text-xl text-neutral-300">
            Manage rune definitions, combos, and gacha settings
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Runes Section */}
          <div className="rounded-2xl border border-neutral-700 bg-neutral-900/50 p-6">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="flex items-center text-2xl font-bold text-white">
                <Sparkles className="mr-2 h-6 w-6 text-pink-400" />
                Rune Definitions
              </h2>
              <button
                onClick={() => setShowRuneForm(true)}
                className="flex items-center rounded-lg bg-pink-600 px-4 py-2 text-white transition-colors hover:bg-pink-700"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Rune
              </button>
            </div>

            <div className="space-y-4">
              {runes.map((rune) => (
                <motion.div
                  key={rune.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-lg border border-neutral-600 bg-neutral-800/50 p-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">
                        <RuneGlyph
                          runeId={rune.canonicalId as CanonicalRuneId}
                          glyphOverride={rune.glyph}
                          style="emoji"
                        />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">
                          {rune.displayName ||
                            getDefaultRuneDisplay(rune.canonicalId as CanonicalRuneId).name}
                        </h3>
                        <p className="text-sm text-neutral-400">{rune.canonicalId}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setEditingRune(rune)}
                        className="rounded p-2 text-blue-400 transition-colors hover:bg-blue-400/10 hover:text-blue-300"
                        aria-label={`Edit rune ${rune.canonicalId}`}
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => deleteRune(rune.id)}
                        className="rounded p-2 text-red-400 transition-colors hover:bg-red-400/10 hover:text-red-300"
                        aria-label={`Delete rune ${rune.canonicalId}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {rune.printifyUPCs && rune.printifyUPCs.length > 0 && (
                    <div className="mt-3 border-t border-neutral-600 pt-3">
                      <p className="mb-1 text-xs text-neutral-500">Mapped UPCs:</p>
                      <div className="flex flex-wrap gap-1">
                        {rune.printifyUPCs.map((upc, index) => (
                          <span
                            key={index}
                            className="rounded bg-neutral-700 px-2 py-1 text-xs text-neutral-300"
                          >
                            {upc}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>

          {/* Combos Section */}
          <div className="rounded-2xl border border-neutral-700 bg-neutral-900/50 p-6">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="flex items-center text-2xl font-bold text-white">
                <Crown className="mr-2 h-6 w-6 text-yellow-400" />
                Rune Combos
              </h2>
              <button
                onClick={() => setShowComboForm(true)}
                className="flex items-center rounded-lg bg-yellow-600 px-4 py-2 text-white transition-colors hover:bg-yellow-700"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Combo
              </button>
            </div>

            <div className="space-y-4">
              {combos.map((combo) => (
                <motion.div
                  key={combo.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-lg border border-neutral-600 bg-neutral-800/50 p-4"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="font-semibold text-white">{combo.comboId}</h3>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setEditingCombo(combo)}
                        className="rounded p-2 text-blue-400 transition-colors hover:bg-blue-400/10 hover:text-blue-300"
                        aria-label={`Edit combo ${combo.comboId}`}
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => deleteCombo(combo.id)}
                        className="rounded p-2 text-red-400 transition-colors hover:bg-red-400/10 hover:text-red-300"
                        aria-label={`Delete combo ${combo.comboId}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="mb-2 text-sm text-neutral-400">
                    Members: {combo.members.join(', ')}
                  </div>

                  {combo.revealCopy && (
                    <p className="text-sm italic text-neutral-300">"{combo.revealCopy}"</p>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Rune Form Modal */}
        <AnimatePresence>
          {showRuneForm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="mx-4 w-full max-w-md rounded-2xl border border-neutral-700 bg-neutral-900 p-6"
              >
                <h3 className="mb-4 text-xl font-bold text-white">
                  {editingRune ? 'Edit Rune' : 'Add New Rune'}
                </h3>

                <RuneForm
                  rune={editingRune}
                  onSave={saveRune}
                  onCancel={() => {
                    setShowRuneForm(false);
                    setEditingRune(null);
                  }}
                  saving={saving}
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Combo Form Modal */}
        <AnimatePresence>
          {showComboForm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="mx-4 w-full max-w-md rounded-2xl border border-neutral-700 bg-neutral-900 p-6"
              >
                <h3 className="mb-4 text-xl font-bold text-white">
                  {editingCombo ? 'Edit Combo' : 'Add New Combo'}
                </h3>

                <ComboForm
                  combo={editingCombo}
                  availableRunes={runes.map((r) => r.canonicalId)}
                  onSave={saveCombo}
                  onCancel={() => {
                    setShowComboForm(false);
                    setEditingCombo(null);
                  }}
                  saving={saving}
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AdminLayout>
  );
}

// Rune Form Component
function RuneForm({
  rune,
  onSave,
  onCancel,
  saving,
}: {
  rune: EditableRuneDef | null;
  onSave: (rune: EditableRuneDef) => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const [formData, setFormData] = useState<Partial<EditableRuneDef>>({
    canonicalId: 'rune_a',
    displayName: '',
    glyph: '',
    lore: '',
    printifyUPCs: [],
    isActive: true,
    ...rune,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.canonicalId) {
      onSave({
        id: rune?.id || `rune_${Date.now()}`,
        canonicalId: formData.canonicalId as CanonicalRuneId,
        displayName: formData.displayName || undefined,
        glyph: formData.glyph || undefined,
        lore: formData.lore || undefined,
        printifyUPCs: formData.printifyUPCs || [],
        isActive: formData.isActive ?? true,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="canonicalId" className="mb-2 block text-sm font-medium text-neutral-300">
          Canonical ID
        </label>
        <select
          id="canonicalId"
          name="canonicalId"
          value={formData.canonicalId}
          onChange={(e) =>
            setFormData({ ...formData, canonicalId: e.target.value as CanonicalRuneId })
          }
          className="w-full rounded-lg border border-neutral-600 bg-neutral-800 px-3 py-2 text-white"
          required
        >
          {Object.keys(DEFAULT_RUNE_DISPLAYS).map((id) => (
            <option key={id} value={id}>
              {id} - {DEFAULT_RUNE_DISPLAYS[id as CanonicalRuneId].name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="displayName" className="mb-2 block text-sm font-medium text-neutral-300">
          Display Name (optional)
        </label>
        <input
          id="displayName"
          name="displayName"
          type="text"
          value={formData.displayName || ''}
          onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
          className="w-full rounded-lg border border-neutral-600 bg-neutral-800 px-3 py-2 text-white"
          placeholder="Custom name for this rune"
        />
      </div>

      <div>
        <label htmlFor="glyph" className="mb-2 block text-sm font-medium text-neutral-300">
          Glyph (optional)
        </label>
        <input
          id="glyph"
          name="glyph"
          type="text"
          value={formData.glyph || ''}
          onChange={(e) => setFormData({ ...formData, glyph: e.target.value })}
          className="w-full rounded-lg border border-neutral-600 bg-neutral-800 px-3 py-2 text-white"
          placeholder="Symbol or emoji"
        />
      </div>

      <div>
        <label htmlFor="lore" className="mb-2 block text-sm font-medium text-neutral-300">
          Lore (optional)
        </label>
        <textarea
          id="lore"
          name="lore"
          value={formData.lore || ''}
          onChange={(e) => setFormData({ ...formData, lore: e.target.value })}
          className="w-full rounded-lg border border-neutral-600 bg-neutral-800 px-3 py-2 text-white"
          rows={3}
          placeholder="Mysterious description..."
        />
      </div>

      <div>
        <label htmlFor="printifyUPCs" className="mb-2 block text-sm font-medium text-neutral-300">
          Printify UPCs (comma-separated)
        </label>
        <input
          id="printifyUPCs"
          name="printifyUPCs"
          type="text"
          value={formData.printifyUPCs?.join(', ') || ''}
          onChange={(e) =>
            setFormData({
              ...formData,
              printifyUPCs: e.target.value
                .split(',')
                .map((s) => s.trim())
                .filter(Boolean),
            })
          }
          className="w-full rounded-lg border border-neutral-600 bg-neutral-800 px-3 py-2 text-white"
          placeholder="UPC1, UPC2, UPC3"
        />
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="isActive"
          checked={formData.isActive}
          onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
          className="rounded border-neutral-600 bg-neutral-800 text-pink-500"
        />
        <label htmlFor="isActive" className="text-sm text-neutral-300">
          Active
        </label>
      </div>

      <div className="flex space-x-3 pt-4">
        <button
          type="submit"
          disabled={saving}
          className="flex-1 rounded-lg bg-pink-600 px-4 py-2 text-white transition-colors hover:bg-pink-700 disabled:bg-pink-800"
        >
          {saving ? 'Saving...' : 'Save Rune'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 rounded-lg bg-neutral-700 px-4 py-2 text-white transition-colors hover:bg-neutral-600"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

// Combo Form Component
function ComboForm({
  combo,
  availableRunes,
  onSave,
  onCancel,
  saving,
}: {
  combo: EditableComboDef | null;
  availableRunes: string[];
  onSave: (combo: EditableComboDef) => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const [formData, setFormData] = useState<Partial<EditableComboDef>>({
    comboId: '',
    members: [],
    revealCopy: '',
    cosmeticBurst: 'small',
    isActive: true,
    ...combo,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.comboId && formData.members && formData.members.length > 0) {
      onSave({
        id: combo?.id || `combo_${Date.now()}`,
        comboId: formData.comboId,
        members: formData.members as CanonicalRuneId[],
        revealCopy: formData.revealCopy || undefined,
        cosmeticBurst: formData.cosmeticBurst || 'small',
        isActive: formData.isActive ?? true,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-2 block text-sm font-medium text-neutral-300">Combo ID</label>
        <input
          type="text"
          value={formData.comboId}
          onChange={(e) => setFormData({ ...formData, comboId: e.target.value })}
          className="w-full rounded-lg border border-neutral-600 bg-neutral-800 px-3 py-2 text-white"
          placeholder="e.g., sakura_power"
          required
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-neutral-300">Required Runes</label>
        <div className="max-h-32 space-y-2 overflow-y-auto">
          {availableRunes.map((runeId) => (
            <label key={runeId} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.members?.includes(runeId as CanonicalRuneId)}
                onChange={(e) => {
                  const currentMembers = formData.members || [];
                  if (e.target.checked) {
                    setFormData({
                      ...formData,
                      members: [...currentMembers, runeId as CanonicalRuneId],
                    });
                  } else {
                    setFormData({
                      ...formData,
                      members: currentMembers.filter((m) => m !== runeId),
                    });
                  }
                }}
                className="rounded border-neutral-600 bg-neutral-800 text-pink-500"
              />
              <span className="text-sm text-neutral-300">{runeId}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-neutral-300">
          Reveal Copy (optional)
        </label>
        <textarea
          value={formData.revealCopy || ''}
          onChange={(e) => setFormData({ ...formData, revealCopy: e.target.value })}
          className="w-full rounded-lg border border-neutral-600 bg-neutral-800 px-3 py-2 text-white"
          rows={2}
          placeholder="Message shown when combo is completed..."
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-neutral-300">Cosmetic Burst</label>
        <select
          value={formData.cosmeticBurst}
          onChange={(e) => setFormData({ ...formData, cosmeticBurst: e.target.value as any })}
          className="w-full rounded-lg border border-neutral-600 bg-neutral-800 px-3 py-2 text-white"
          aria-label="Select cosmetic burst size"
        >
          <option value="small">Small</option>
          <option value="medium">Medium</option>
          <option value="large">Large</option>
        </select>
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="comboIsActive"
          checked={formData.isActive}
          onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
          className="rounded border-neutral-600 bg-neutral-800 text-pink-500"
        />
        <label htmlFor="comboIsActive" className="text-sm text-neutral-300">
          Active
        </label>
      </div>

      <div className="flex space-x-3 pt-4">
        <button
          type="submit"
          disabled={
            saving || !formData.comboId || !formData.members || formData.members.length === 0
          }
          className="flex-1 rounded-lg bg-yellow-600 px-4 py-2 text-white transition-colors hover:bg-yellow-700 disabled:bg-yellow-800"
        >
          {saving ? 'Saving...' : 'Save Combo'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 rounded-lg bg-neutral-700 px-4 py-2 text-white transition-colors hover:bg-neutral-600"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
