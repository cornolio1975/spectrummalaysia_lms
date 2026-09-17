"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Layers, 
  ArrowLeft, 
  Plus, 
  CheckCircle2, 
  ArrowRight, 
  Award, 
  BookOpen, 
  ShieldCheck, 
  Trash2, 
  Sparkles,
  Loader2
} from "lucide-react";
import { createCredentialStack } from "@/app/actions/credentials";
import { toast } from "sonner";

interface Props {
  stacks: any[];
  allCredentials: any[];
}

export function CredentialStackingClient({ stacks, allCredentials }: Props) {
  const [creating, setCreating] = useState(false);
  const [stackName, setStackName] = useState("");
  const [description, setDescription] = useState("");
  const [resultingCredId, setResultingCredId] = useState(allCredentials[0]?.id || "");
  const [selectedItems, setSelectedItems] = useState<{ credId: string; isMandatory: boolean }[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const handleAddItem = (credId: string) => {
    if (selectedItems.some((item) => item.credId === credId)) return;
    setSelectedItems([...selectedItems, { credId, isMandatory: true }]);
  };

  const handleRemoveItem = (credId: string) => {
    setSelectedItems(selectedItems.filter((item) => item.credId !== credId));
  };

  const handleToggleMandatory = (credId: string) => {
    setSelectedItems(
      selectedItems.map((item) =>
        item.credId === credId ? { ...item, isMandatory: !item.isMandatory } : item
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stackName.trim()) {
      toast.error("Please enter a pathway stack name");
      return;
    }
    if (!resultingCredId) {
      toast.error("Please select the target qualification");
      return;
    }
    if (selectedItems.length === 0) {
      toast.error("Please add at least one micro-credential to this stack");
      return;
    }

    setSubmitting(true);
    try {
      const res = await createCredentialStack({
        name: stackName,
        description,
        resulting_credential_id: resultingCredId,
        items: selectedItems.map((item, idx) => ({
          credential_id: item.credId,
          is_mandatory: item.isMandatory,
          order_seq: idx + 1,
        })),
      });

      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Stackable pathway successfully registered!");
        setCreating(false);
        setStackName("");
        setDescription("");
        setSelectedItems([]);
        window.location.reload();
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to create stack");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <Link href="/credentials" className="hover:text-indigo-600 flex items-center gap-1">
              <ArrowLeft className="h-4 w-4" /> Back to Registry
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <Layers className="h-7 w-7 text-indigo-600" />
            Stackable Micro-Credentials Builder
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Combine multiple modular micro-credentials into higher-tier certifications and professional diplomas.
          </p>
        </div>

        <button
          onClick={() => setCreating(!creating)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 shadow-sm transition"
        >
          <Plus className="h-4 w-4" />
          {creating ? "Cancel Stacking" : "Build New Stack"}
        </button>
      </div>

      {/* Creation Modal / Inline Drawer */}
      {creating && (
        <div className="bg-white rounded-xl border border-indigo-200 shadow-lg p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-indigo-600" />
              Define Stacking Pathway (Micro-Credential A + B + C = Major Award)
            </h2>
            <span className="text-xs font-semibold px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-full">
              Modular Architecture
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                  Stack Pathway Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Executive Diploma in Applied Artificial Intelligence"
                  value={stackName}
                  onChange={(e) => setStackName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                  Target Resulting Credential *
                </label>
                <select
                  value={resultingCredId}
                  onChange={(e) => setResultingCredId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {allCredentials.map((c) => (
                    <option key={c.id} value={c.id}>
                      [{c.credential_code}] {c.name} ({c.level})
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                  Stack Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Explain how these modular credentials assemble together to satisfy this professional qualification..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Modular Components Selector */}
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-gray-700 uppercase">
                Select Modular Credentials in this Pathway
              </label>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Available catalog */}
                <div className="border border-gray-200 rounded-lg p-3 bg-gray-50/50 max-h-60 overflow-y-auto space-y-2">
                  <span className="text-xs font-bold text-gray-500 block uppercase">
                    Available Micro-Credentials
                  </span>
                  {allCredentials.map((cred) => {
                    const isAdded = selectedItems.some((i) => i.credId === cred.id);
                    return (
                      <div
                        key={cred.id}
                        className="flex items-center justify-between p-2 bg-white rounded border border-gray-200 text-xs"
                      >
                        <div>
                          <p className="font-semibold text-gray-800">{cred.name}</p>
                          <span className="text-gray-400 font-mono">{cred.credential_code}</span>
                        </div>
                        <button
                          type="button"
                          disabled={isAdded || cred.id === resultingCredId}
                          onClick={() => handleAddItem(cred.id)}
                          className="px-2 py-1 bg-indigo-50 text-indigo-600 rounded hover:bg-indigo-100 disabled:opacity-30 font-medium"
                        >
                          {isAdded ? "Added" : "+ Add"}
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* Stack Sequence Blueprint */}
                <div className="border border-indigo-100 rounded-lg p-3 bg-indigo-50/20 max-h-60 overflow-y-auto space-y-2">
                  <span className="text-xs font-bold text-indigo-900 block uppercase">
                    Stacked Pathway Sequence ({selectedItems.length} modules)
                  </span>
                  {selectedItems.length === 0 ? (
                    <div className="text-xs text-gray-400 py-6 text-center">
                      No modules added yet. Click "+ Add" on the left to include credentials.
                    </div>
                  ) : (
                    selectedItems.map((item, idx) => {
                      const cred = allCredentials.find((c) => c.id === item.credId);
                      return (
                        <div
                          key={item.credId}
                          className="flex items-center justify-between p-2 bg-white rounded border border-indigo-200 text-xs shadow-2xs"
                        >
                          <div className="flex items-center gap-2">
                            <span className="h-5 w-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-[10px]">
                              {idx + 1}
                            </span>
                            <div>
                              <p className="font-semibold text-gray-900">{cred?.name}</p>
                              <span className="text-[10px] text-gray-500 font-mono">
                                {cred?.credential_code}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleToggleMandatory(item.credId)}
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                item.isMandatory
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-gray-100 text-gray-600"
                              }`}
                            >
                              {item.isMandatory ? "Mandatory" : "Elective"}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(item.credId)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setCreating(false)}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 px-5 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 shadow-sm disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Registering...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" /> Save Stack Pathway
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Existing Stacks Grid */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-gray-900">Registered Stacking Pathways</h2>

        {stacks.length === 0 ? (
          <div className="bg-white p-12 rounded-xl border border-gray-200 text-center text-gray-500">
            <Layers className="h-10 w-10 text-gray-300 mx-auto mb-3" />
            <p className="font-medium text-gray-700">No Stackable Pathways Registered Yet</p>
            <p className="text-xs text-gray-400 mt-1">
              Click &quot;Build New Stack&quot; above to combine micro-credentials into a full qualification.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {stacks.map((stack) => (
              <div
                key={stack.id}
                className="bg-white rounded-xl border border-gray-200 p-6 shadow-xs space-y-4"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-gray-100 pb-3">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{stack.name}</h3>
                    <p className="text-xs text-gray-500">{stack.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">Awards Capstone:</span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700">
                      <Award className="h-3.5 w-3.5" />
                      {stack.resulting_credential?.name || "Target Credential"}
                    </span>
                  </div>
                </div>

                {/* Pathway Visualizer */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  {stack.credential_stack_items?.map((item: any, idx: number) => (
                    <div key={item.id} className="flex items-center gap-2">
                      <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-xs shadow-2xs">
                        <span className="font-bold text-gray-800 block">
                          {item.credential?.name}
                        </span>
                        <div className="flex items-center justify-between gap-2 mt-1">
                          <span className="font-mono text-indigo-600 text-[10px]">
                            {item.credential?.credential_code}
                          </span>
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                              item.is_mandatory
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {item.is_mandatory ? "Mandatory" : "Elective"}
                          </span>
                        </div>
                      </div>

                      {idx < stack.credential_stack_items.length - 1 && (
                        <span className="font-bold text-gray-300 text-base">+</span>
                      )}
                    </div>
                  ))}

                  <ArrowRight className="h-5 w-5 text-indigo-500 mx-2" />

                  <div className="p-3.5 bg-indigo-600 text-white rounded-xl shadow-sm text-xs">
                    <span className="text-[10px] uppercase tracking-wider text-indigo-200 block font-bold">
                      Stacked Qualification
                    </span>
                    <span className="font-bold text-white text-sm block mt-0.5">
                      {stack.resulting_credential?.name}
                    </span>
                    <span className="text-[10px] text-indigo-100 font-mono mt-0.5 block">
                      {stack.resulting_credential?.credential_code}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
