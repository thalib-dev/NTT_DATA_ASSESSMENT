function getApiBase(): string {
  const envUrl = process.env.NEXT_PUBLIC_API_URL
  if (envUrl && envUrl.trim().length > 0) {
    return envUrl.replace(/\/+$/, '')
  }
  return "http://localhost:4000/api"
}

export interface FieldConfig {
  id: number
  field_name: string
  field_type: "text" | "number" | "dropdown"
  is_required: boolean
  dropdown_options?: string[] | null
  display_order: number
  created_at?: string
}

export interface Machine {
  id: number
  data: Record<string, any>
  created_at: string
  updated_at: string
}

export interface PredictionResult {
  machine_id: number
  machine_data: Record<string, any>
  prediction: {
    risk_level: string
    confidence: number
    probabilities: Record<string, number>
    model_features: string[]
    features_used: Record<string, any>
    ignored_fields?: string[]
    note?: string
  }
}

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const apiBase = getApiBase()
  const res = await fetch(`${apiBase}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    ...options,
  })

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}))
    throw new Error(errorBody.error || `Request failed with status ${res.status}`)
  }

  return res.json()
}

export async function fetchFields(): Promise<FieldConfig[]> {
  return request<FieldConfig[]>("/fields")
}

export async function createField(data: {
  field_name: string
  field_type: "text" | "number" | "dropdown"
  is_required: boolean
  dropdown_options?: string[] | null
}): Promise<FieldConfig> {
  return request<FieldConfig>("/fields", {
    method: "POST",
    body: JSON.stringify(data),
  })
}

export async function updateField(
  id: number,
  data: {
    field_name: string
    field_type: "text" | "number" | "dropdown"
    is_required: boolean
    dropdown_options?: string[] | null
  }
): Promise<FieldConfig> {
  return request<FieldConfig>(`/fields/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  })
}

export async function deleteField(id: number): Promise<{ message: string }> {
  return request<{ message: string }>(`/fields/${id}`, {
    method: "DELETE",
  })
}

export async function fetchMachines(): Promise<Machine[]> {
  return request<Machine[]>("/machines")
}

export async function fetchMachine(id: number): Promise<Machine> {
  return request<Machine>(`/machines/${id}`)
}

export async function createMachine(data: Record<string, any>): Promise<Machine> {
  return request<Machine>("/machines", {
    method: "POST",
    body: JSON.stringify({ data }),
  })
}

export async function updateMachine(id: number, data: Record<string, any>): Promise<Machine> {
  return request<Machine>(`/machines/${id}`, {
    method: "PUT",
    body: JSON.stringify({ data }),
  })
}

export async function deleteMachine(id: number): Promise<{ message: string }> {
  return request<{ message: string }>(`/machines/${id}`, {
    method: "DELETE",
  })
}

export async function predictRisk(id: number): Promise<PredictionResult> {
  return request<PredictionResult>(`/predict/${id}`, {
    method: "POST",
  })
}

export async function checkBackendHealth(): Promise<{ status: string; timestamp?: string }> {
  return request<{ status: string; timestamp?: string }>("/health")
}

export async function checkMLHealth(): Promise<{ status: string; model_features?: string[] }> {
  return request<{ status: string; model_features?: string[] }>("/ml-health")
}
