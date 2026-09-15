"use client"

import { useState, useEffect } from "react"
import {
  fetchMachines,
  fetchFields,
  createMachine,
  updateMachine,
  deleteMachine,
  FieldConfig,
  Machine,
} from "@/lib/api"
import { Plus, Trash2, Edit3, RefreshCw, AlertCircle, X, Check } from "lucide-react"

export function MachinesTab() {
  const [machines, setMachines] = useState<Machine[]>([])
  const [fields, setFields] = useState<FieldConfig[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingMachine, setEditingMachine] = useState<Machine | null>(null)
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const loadData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [fetchedMachines, fetchedFields] = await Promise.all([
        fetchMachines(),
        fetchFields(),
      ])
      setMachines(fetchedMachines)
      setFields(fetchedFields)
    } catch (err: any) {
      setError(err.message || "Failed to load machine data.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleOpenAddModal = () => {
    setEditingMachine(null)
    const initialData: Record<string, any> = {}
    fields.forEach((f) => {
      if (f.field_type === "dropdown" && f.dropdown_options && f.dropdown_options.length > 0) {
        initialData[f.field_name] = f.dropdown_options[0]
      } else {
        initialData[f.field_name] = ""
      }
    })
    setFormData(initialData)
    setFormError(null)
    setIsModalOpen(true)
  }

  const handleOpenEditModal = (machine: Machine) => {
    setEditingMachine(machine)
    setFormData({ ...machine.data })
    setFormError(null)
    setIsModalOpen(true)
  }

  const handleInputChange = (fieldName: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [fieldName]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)
    setSubmitting(true)

    try {
      if (editingMachine) {
        await updateMachine(editingMachine.id, formData)
      } else {
        await createMachine(formData)
      }
      setIsModalOpen(false)
      await loadData()
    } catch (err: any) {
      setFormError(err.message || "Failed to save machine.")
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this machine?")) return
    try {
      await deleteMachine(id)
      await loadData()
    } catch (err: any) {
      alert(err.message || "Failed to delete machine.")
    }
  }

  return (
    <div className="space-y-8">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-200 pb-6">
        <div>
          <h2 className="font-serif text-3xl md:text-4xl uppercase tracking-tight text-zinc-900">
            Fleet Overview
          </h2>
          <p className="font-mono text-xs text-zinc-500 mt-1 uppercase">
            {machines.length} registered machine{machines.length !== 1 ? "s" : ""}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            className="p-3 border border-zinc-200 bg-white hover:bg-zinc-100 rounded-lg transition-colors text-zinc-700"
            title="Refresh List"
          >
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          </button>
          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-2 px-6 py-3 bg-zinc-900 text-white font-mono text-sm uppercase rounded-lg hover:bg-zinc-800 transition-colors shadow-xs"
          >
            <Plus size={18} />
            Add Machine
          </button>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 font-mono text-sm flex items-center gap-3">
          <AlertCircle size={20} className="shrink-0" />
          <span>{error}</span>
          <button onClick={loadData} className="underline ml-auto font-bold uppercase text-xs">
            Retry
          </button>
        </div>
      )}

      {/* Loading state */}
      {loading && !machines.length && (
        <div className="py-20 text-center font-mono text-sm text-zinc-500 uppercase">
          Loading fleet data...
        </div>
      )}

      {/* Empty state */}
      {!loading && machines.length === 0 && !error && (
        <div className="py-20 border border-dashed border-zinc-300 rounded-xl text-center bg-white">
          <p className="font-serif text-2xl text-zinc-800 uppercase">No Machines Found</p>
          <p className="font-mono text-sm text-zinc-500 mt-2">
            Click "Add Machine" to add your first machine to the fleet.
          </p>
        </div>
      )}

      {/* Machine Grid/Cards */}
      {machines.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {machines.map((machine) => {
            const data = machine.data || {}
            const primaryTitle =
              data["Machine Name"] || data["machine_name"] || data["Name"] || `Machine #${machine.id}`

            return (
              <div
                key={machine.id}
                className="bg-white border border-zinc-200 rounded-xl p-6 flex flex-col justify-between hover:border-zinc-400 transition-colors"
              >
                <div>
                  <div className="flex justify-between items-start gap-2 mb-4 border-b border-zinc-100 pb-3">
                    <div>
                      <span className="font-mono text-xs text-zinc-400 uppercase font-semibold">
                        ID #{machine.id}
                      </span>
                      <h3 className="font-serif text-2xl uppercase tracking-tight text-zinc-900 font-bold">
                        {primaryTitle}
                      </h3>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditModal(machine)}
                        className="p-2 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded-md transition-colors"
                        title="Edit Machine"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(machine.id)}
                        className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                        title="Delete Machine"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Attributes */}
                  <div className="space-y-2 font-mono text-xs">
                    {fields.map((field) => {
                      const val = data[field.field_name]
                      if (val === undefined || val === null || val === "") return null

                      return (
                        <div key={field.id} className="flex justify-between items-center py-1 border-b border-zinc-50">
                          <span className="text-zinc-500 uppercase">{field.field_name}:</span>
                          <span className="text-zinc-900 font-semibold uppercase">{String(val)}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div className="mt-6 pt-3 border-t border-zinc-100 flex justify-between items-center text-[10px] font-mono text-zinc-400 uppercase">
                  <span>Created: {new Date(machine.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white border border-zinc-200 rounded-xl max-w-lg w-full p-8 shadow-xl space-y-6">
            <div className="flex justify-between items-center border-b border-zinc-200 pb-4">
              <h3 className="font-serif text-2xl uppercase font-bold text-zinc-900">
                {editingMachine ? `Edit Machine #${editingMachine.id}` : "Add New Machine"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-zinc-500 hover:text-zinc-900 rounded-lg hover:bg-zinc-100"
              >
                <X size={20} />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 font-mono text-xs">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 font-mono text-sm">
              {fields.map((field) => (
                <div key={field.id} className="space-y-1">
                  <label className="block text-xs uppercase font-medium text-zinc-700">
                    {field.field_name}
                    {field.is_required && <span className="text-red-500 ml-1">*</span>}
                  </label>

                  {field.field_type === "dropdown" ? (
                    <select
                      value={formData[field.field_name] || ""}
                      onChange={(e) => handleInputChange(field.field_name, e.target.value)}
                      required={field.is_required}
                      className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg focus:outline-none focus:border-zinc-900 text-zinc-900 text-sm uppercase"
                    >
                      <option value="">Select {field.field_name}</option>
                      {(field.dropdown_options || []).map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={field.field_type === "number" ? "number" : "text"}
                      step={field.field_type === "number" ? "any" : undefined}
                      value={formData[field.field_name] ?? ""}
                      onChange={(e) => handleInputChange(field.field_name, e.target.value)}
                      required={field.is_required}
                      placeholder={`Enter ${field.field_name}`}
                      className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg focus:outline-none focus:border-zinc-900 text-zinc-900 text-sm"
                    />
                  )}
                </div>
              ))}

              <div className="pt-4 flex justify-end gap-3 border-t border-zinc-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 border border-zinc-200 text-zinc-700 font-mono text-xs uppercase rounded-lg hover:bg-zinc-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-zinc-900 text-white font-mono text-xs uppercase rounded-lg hover:bg-zinc-800 transition-colors disabled:opacity-50"
                >
                  {submitting ? "Saving..." : editingMachine ? "Update Machine" : "Save Machine"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
