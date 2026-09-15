"use client"

import { useState, useEffect } from "react"
import { fetchFields, createField, updateField, deleteField, FieldConfig } from "@/lib/api"
import { Plus, Trash2, Edit3, RefreshCw, AlertCircle, X, Layers } from "lucide-react"

export function FieldsTab() {
  const [fields, setFields] = useState<FieldConfig[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingField, setEditingField] = useState<FieldConfig | null>(null)

  // Form State
  const [fieldName, setFieldName] = useState("")
  const [fieldType, setFieldType] = useState<"text" | "number" | "dropdown">("text")
  const [isRequired, setIsRequired] = useState(false)
  const [dropdownOptionsText, setDropdownOptionsText] = useState("")
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const loadFields = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchFields()
      setFields(data)
    } catch (err: any) {
      setError(err.message || "Failed to load field configurations.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadFields()
  }, [])

  const handleOpenAddModal = () => {
    setEditingField(null)
    setFieldName("")
    setFieldType("text")
    setIsRequired(false)
    setDropdownOptionsText("")
    setFormError(null)
    setIsModalOpen(true)
  }

  const handleOpenEditModal = (field: FieldConfig) => {
    setEditingField(field)
    setFieldName(field.field_name)
    setFieldType(field.field_type)
    setIsRequired(field.is_required)
    setDropdownOptionsText(field.dropdown_options ? field.dropdown_options.join(", ") : "")
    setFormError(null)
    setIsModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    if (!fieldName.trim()) {
      setFormError("Field name is required.")
      return
    }

    let parsedOptions: string[] | undefined = undefined
    if (fieldType === "dropdown") {
      parsedOptions = dropdownOptionsText
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)

      if (parsedOptions.length === 0) {
        setFormError("Dropdown fields require at least one option.")
        return
      }
    }

    setSubmitting(true)
    try {
      const payload = {
        field_name: fieldName.trim(),
        field_type: fieldType,
        is_required: isRequired,
        dropdown_options: parsedOptions,
      }

      if (editingField) {
        await updateField(editingField.id, payload)
      } else {
        await createField(payload)
      }
      setIsModalOpen(false)
      await loadFields()
    } catch (err: any) {
      setFormError(err.message || "Failed to save field configuration.")
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this field configuration?")) return
    try {
      await deleteField(id)
      await loadFields()
    } catch (err: any) {
      alert(err.message || "Failed to delete field.")
    }
  }

  return (
    <div className="space-y-8">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-200 pb-6">
        <div>
          <h2 className="font-serif text-3xl md:text-4xl uppercase tracking-tight text-zinc-900">
            Schema Configuration
          </h2>
          <p className="font-mono text-xs text-zinc-500 mt-1 uppercase">
            {fields.length} dynamic field{fields.length !== 1 ? "s" : ""} defined
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadFields}
            className="p-3 border border-zinc-200 bg-white hover:bg-zinc-100 rounded-lg transition-colors text-zinc-700"
            title="Refresh Fields"
          >
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          </button>
          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-2 px-6 py-3 bg-zinc-900 text-white font-mono text-sm uppercase rounded-lg hover:bg-zinc-800 transition-colors shadow-xs"
          >
            <Plus size={18} />
            Add Field
          </button>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 font-mono text-sm flex items-center gap-3">
          <AlertCircle size={20} className="shrink-0" />
          <span>{error}</span>
          <button onClick={loadFields} className="underline ml-auto font-bold uppercase text-xs">
            Retry
          </button>
        </div>
      )}

      {/* Loading state */}
      {loading && !fields.length && (
        <div className="py-20 text-center font-mono text-sm text-zinc-500 uppercase">
          Loading schema fields...
        </div>
      )}

      {/* Empty state */}
      {!loading && fields.length === 0 && !error && (
        <div className="py-20 border border-dashed border-zinc-300 rounded-xl text-center bg-white">
          <p className="font-serif text-2xl text-zinc-800 uppercase">No Schema Fields</p>
          <p className="font-mono text-sm text-zinc-500 mt-2">
            Add a field configuration to define attributes for machines.
          </p>
        </div>
      )}

      {/* Fields Table / List */}
      {fields.length > 0 && (
        <div className="border border-zinc-200 bg-white rounded-xl overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead className="bg-zinc-100 border-b border-zinc-200 uppercase text-zinc-700">
                <tr>
                  <th className="p-4 font-semibold">Order</th>
                  <th className="p-4 font-semibold">Field Name</th>
                  <th className="p-4 font-semibold">Type</th>
                  <th className="p-4 font-semibold">Required</th>
                  <th className="p-4 font-semibold">Options / Notes</th>
                  <th className="p-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {fields.map((field) => (
                  <tr key={field.id} className="hover:bg-zinc-50/80 transition-colors">
                    <td className="p-4 text-zinc-400 font-bold">#{field.display_order}</td>
                    <td className="p-4 text-zinc-900 font-bold text-sm uppercase">
                      {field.field_name}
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 bg-zinc-100 border border-zinc-200 rounded-md text-zinc-800 font-semibold uppercase">
                        {field.field_type}
                      </span>
                    </td>
                    <td className="p-4">
                      {field.is_required ? (
                        <span className="text-emerald-700 font-bold uppercase">Required</span>
                      ) : (
                        <span className="text-zinc-400 uppercase">Optional</span>
                      )}
                    </td>
                    <td className="p-4 text-zinc-600">
                      {field.field_type === "dropdown" ? (
                        <div className="flex flex-wrap gap-1">
                          {(field.dropdown_options || []).map((opt) => (
                            <span
                              key={opt}
                              className="px-2 py-0.5 bg-zinc-50 border border-zinc-200 rounded text-[11px]"
                            >
                              {opt}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-zinc-400">—</span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEditModal(field)}
                          className="p-2 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded-md transition-colors"
                          title="Edit Field"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(field.id)}
                          className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                          title="Delete Field"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white border border-zinc-200 rounded-xl max-w-lg w-full p-8 shadow-xl space-y-6">
            <div className="flex justify-between items-center border-b border-zinc-200 pb-4">
              <h3 className="font-serif text-2xl uppercase font-bold text-zinc-900">
                {editingField ? `Edit Field #${editingField.id}` : "Add New Field"}
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
              <div className="space-y-1">
                <label className="block text-xs uppercase font-medium text-zinc-700">
                  Field Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={fieldName}
                  onChange={(e) => setFieldName(e.target.value)}
                  placeholder="e.g. Temperature, Pressure, Vibration"
                  required
                  className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg focus:outline-none focus:border-zinc-900 text-zinc-900 text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs uppercase font-medium text-zinc-700">
                  Field Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={fieldType}
                  onChange={(e) => setFieldType(e.target.value as any)}
                  className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg focus:outline-none focus:border-zinc-900 text-zinc-900 text-sm uppercase"
                >
                  <option value="text">Text</option>
                  <option value="number">Number</option>
                  <option value="dropdown">Dropdown</option>
                </select>
              </div>

              {fieldType === "dropdown" && (
                <div className="space-y-1">
                  <label className="block text-xs uppercase font-medium text-zinc-700">
                    Dropdown Options (comma separated) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={dropdownOptionsText}
                    onChange={(e) => setDropdownOptionsText(e.target.value)}
                    placeholder="e.g. Low, Medium, High"
                    required
                    className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg focus:outline-none focus:border-zinc-900 text-zinc-900 text-sm"
                  />
                  <p className="text-[10px] text-zinc-400">Separate options with commas.</p>
                </div>
              )}

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isRequired"
                  checked={isRequired}
                  onChange={(e) => setIsRequired(e.target.checked)}
                  className="w-4 h-4 rounded border-zinc-300 text-zinc-900 focus:ring-0"
                />
                <label htmlFor="isRequired" className="text-xs uppercase font-medium text-zinc-800 cursor-pointer">
                  Is Required Field
                </label>
              </div>

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
                  {submitting ? "Saving..." : editingField ? "Update Field" : "Save Field"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
