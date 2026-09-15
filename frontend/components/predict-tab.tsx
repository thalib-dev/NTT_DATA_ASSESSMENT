"use client"

import { useState, useEffect } from "react"
import {
  fetchMachines,
  predictRisk,
  checkMLHealth,
  Machine,
  PredictionResult,
} from "@/lib/api"
import { Cpu, Play, AlertTriangle, CheckCircle2, RefreshCw, AlertCircle, Info } from "lucide-react"

export function PredictTab() {
  const [machines, setMachines] = useState<Machine[]>([])
  const [selectedMachineId, setSelectedMachineId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [predicting, setPredicting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<PredictionResult | null>(null)
  const [mlStatus, setMlStatus] = useState<{ status: string; model_features?: string[] } | null>(null)

  const loadData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [fetchedMachines, mlHealth] = await Promise.all([
        fetchMachines(),
        checkMLHealth().catch(() => ({ status: "offline" })),
      ])
      setMachines(fetchedMachines)
      setMlStatus(mlHealth)
      if (fetchedMachines.length > 0 && !selectedMachineId) {
        setSelectedMachineId(fetchedMachines[0].id)
      }
    } catch (err: any) {
      setError(err.message || "Failed to load machines or ML service info.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handlePredict = async () => {
    if (!selectedMachineId) return
    setPredicting(true)
    setError(null)
    setResult(null)

    try {
      const predictionRes = await predictRisk(selectedMachineId)
      setResult(predictionRes)
    } catch (err: any) {
      setError(err.message || "Failed to run risk prediction.")
    } finally {
      setPredicting(false)
    }
  }

  const selectedMachine = machines.find((m) => m.id === selectedMachineId)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-200 pb-6">
        <div>
          <h2 className="font-serif text-3xl md:text-4xl uppercase tracking-tight text-zinc-900">
            ML Risk Predictor
          </h2>
          <p className="font-mono text-xs text-zinc-500 mt-1 uppercase">
            Random Forest Machine Failure Risk Inference
          </p>
        </div>

        {/* ML Service Status Pill */}
        <div className="flex items-center gap-2">
          {mlStatus?.status === "ok" ? (
            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-full font-mono text-xs uppercase font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              ML Service Online
            </span>
          ) : (
            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-200 text-amber-800 rounded-full font-mono text-xs uppercase font-semibold">
              <AlertTriangle size={14} />
              ML Service Offline
            </span>
          )}
          <button
            onClick={loadData}
            className="p-2 border border-zinc-200 bg-white hover:bg-zinc-100 rounded-lg text-zinc-700 transition-colors"
            title="Refresh Status"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* Main Predict Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Machine Selection & Data Preview */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-2xs space-y-4">
            <h3 className="font-serif text-xl uppercase font-bold text-zinc-900 border-b border-zinc-100 pb-3">
              1. Select Target Machine
            </h3>

            {machines.length === 0 ? (
              <p className="font-mono text-xs text-zinc-500 uppercase">
                No machines available. Add machines in the "Machines" tab first.
              </p>
            ) : (
              <div className="space-y-4 font-mono text-sm">
                <div>
                  <label className="block text-xs uppercase text-zinc-500 mb-1.5 font-medium">
                    Choose Machine
                  </label>
                  <select
                    value={selectedMachineId || ""}
                    onChange={(e) => setSelectedMachineId(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-white border border-zinc-200 rounded-lg focus:outline-none focus:border-zinc-900 text-zinc-900 font-bold uppercase text-sm"
                  >
                    {machines.map((m) => {
                      const name =
                        m.data["Machine Name"] || m.data["machine_name"] || m.data["Name"] || `Machine #${m.id}`
                      return (
                        <option key={m.id} value={m.id}>
                          #{m.id} — {name}
                        </option>
                      )
                    })}
                  </select>
                </div>

                {selectedMachine && (
                  <div className="mt-4 p-4 bg-zinc-50 border border-zinc-200 rounded-lg space-y-2">
                    <span className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">
                      Sensor Data Preview:
                    </span>
                    {Object.entries(selectedMachine.data).map(([key, val]) => (
                      <div key={key} className="flex justify-between items-center text-xs border-b border-zinc-200/60 pb-1">
                        <span className="text-zinc-500 uppercase">{key}:</span>
                        <span className="text-zinc-900 font-bold uppercase">{String(val)}</span>
                      </div>
                    ))}
                  </div>
                )}

                <button
                  onClick={handlePredict}
                  disabled={predicting || !selectedMachineId}
                  className="w-full py-3.5 bg-zinc-900 text-white font-mono text-sm uppercase rounded-lg hover:bg-zinc-800 transition-colors flex items-center justify-center gap-2 shadow-xs disabled:opacity-50"
                >
                  <Play size={16} className={predicting ? "animate-spin" : ""} />
                  {predicting ? "Running Inference..." : "Run Risk Prediction"}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Prediction Output / Result */}
        <div className="lg:col-span-7">
          {error && (
            <div className="p-5 bg-red-50 border border-red-200 rounded-xl text-red-800 font-mono text-sm flex items-start gap-3">
              <AlertCircle size={20} className="shrink-0 mt-0.5" />
              <div>
                <p className="font-bold uppercase">Prediction Error</p>
                <p className="text-xs mt-1">{error}</p>
              </div>
            </div>
          )}

          {!result && !error && (
            <div className="h-full min-h-[300px] border border-dashed border-zinc-300 rounded-xl bg-white flex flex-col items-center justify-center p-8 text-center space-y-3">
              <Cpu size={40} className="text-zinc-300" />
              <p className="font-serif text-2xl uppercase text-zinc-800">Awaiting Prediction</p>
              <p className="font-mono text-xs text-zinc-500 max-w-sm uppercase">
                Select a machine on the left and click "Run Risk Prediction" to perform real-time ML risk inference.
              </p>
            </div>
          )}

          {result && (
            <div className="bg-white border border-zinc-200 rounded-xl p-8 space-y-6 shadow-2xs">
              <div className="border-b border-zinc-200 pb-6 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                  <span className="font-mono text-xs text-zinc-400 uppercase font-semibold block">
                    Prediction Result (Machine #{result.machine_id})
                  </span>
                  <h3 className="font-serif text-3xl uppercase font-bold text-zinc-900 mt-1">
                    Risk Assessment
                  </h3>
                </div>

                {/* Risk Level Badge */}
                <div
                  className={`px-6 py-3 rounded-xl border text-center font-serif text-2xl uppercase font-black tracking-wide ${
                    String(result.prediction.risk_level).toLowerCase().includes("high") ||
                    String(result.prediction.risk_level).toLowerCase().includes("critical")
                      ? "bg-red-50 border-red-200 text-red-700"
                      : String(result.prediction.risk_level).toLowerCase().includes("medium") ||
                        String(result.prediction.risk_level).toLowerCase().includes("warning")
                      ? "bg-amber-50 border-amber-200 text-amber-800"
                      : "bg-emerald-50 border-emerald-200 text-emerald-800"
                  }`}
                >
                  {result.prediction.risk_level}
                </div>
              </div>

              {/* Confidence Metric */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono">
                <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-lg">
                  <span className="text-xs text-zinc-500 uppercase block">Model Confidence</span>
                  <span className="text-3xl font-serif font-bold text-zinc-900">
                    {(result.prediction.confidence * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-lg">
                  <span className="text-xs text-zinc-500 uppercase block">Algorithm</span>
                  <span className="text-lg font-serif font-bold text-zinc-900">
                    Random Forest
                  </span>
                </div>
              </div>

              {/* Class Probabilities Breakdown */}
              {result.prediction.probabilities && (
                <div className="space-y-3 font-mono text-xs">
                  <h4 className="uppercase font-bold text-zinc-700 border-b border-zinc-100 pb-2">
                    Class Probability Breakdown
                  </h4>
                  <div className="space-y-2">
                    {Object.entries(result.prediction.probabilities).map(([cls, prob]) => {
                      const percentage = (prob * 100).toFixed(1)
                      return (
                        <div key={cls} className="space-y-1">
                          <div className="flex justify-between text-zinc-700 font-semibold uppercase">
                            <span>{cls}</span>
                            <span>{percentage}%</span>
                          </div>
                          <div className="w-full h-2 bg-zinc-100 rounded-full overflow-hidden border border-zinc-200">
                            <div
                              className="h-full bg-zinc-900 rounded-full transition-all duration-500"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Features Used vs Ignored */}
              <div className="pt-4 border-t border-zinc-100 font-mono text-xs space-y-2 text-zinc-600">
                <div className="flex items-center gap-2 text-zinc-500">
                  <Info size={14} />
                  <span>
                    Features used for inference:{" "}
                    <strong className="text-zinc-900 uppercase">
                      {Object.keys(result.prediction.features_used).join(", ")}
                    </strong>
                  </span>
                </div>

                {result.prediction.ignored_fields && result.prediction.ignored_fields.length > 0 && (
                  <p className="text-amber-700 bg-amber-50 p-2.5 rounded border border-amber-200">
                    {result.prediction.note ||
                      `Ignored fields: ${result.prediction.ignored_fields.join(", ")}`}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
