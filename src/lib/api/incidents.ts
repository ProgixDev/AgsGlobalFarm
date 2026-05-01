import { apiFetch } from "@/lib/api/client";

export interface IncidentDTO {
  _id: string;
  reporterId: string;
  reporterName: string;
  category: IncidentCategory;
  customCategory?: string;
  title: string;
  description: string;
  severity: IncidentSeverity;
  coordinates: { longitude: number; latitude: number };
  region?: string;
  images: string[];
  status: "active" | "resolved";
  createdAt: string;
  updatedAt: string;
}

export type IncidentInput = Omit<
  IncidentDTO,
  "_id" | "reporterId" | "reporterName" | "status" | "createdAt" | "updatedAt"
>;

export interface IncidentsQuery {
  category?: IncidentCategory;
  status?: "active" | "resolved";
  region?: string;
  limit?: number;
  offset?: number;
}

function buildQuery(params: IncidentsQuery): string {
  const search = new URLSearchParams();
  if (params.category) search.set("category", params.category);
  if (params.status) search.set("status", params.status);
  if (params.region) search.set("region", params.region);
  if (params.limit !== undefined) search.set("limit", String(params.limit));
  if (params.offset !== undefined) search.set("offset", String(params.offset));
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

export async function fetchIncidents(
  params: IncidentsQuery = {},
): Promise<{ incidents: IncidentDTO[]; total: number }> {
  return apiFetch(`/api/incidents${buildQuery(params)}`);
}

export async function fetchMyIncidents(): Promise<IncidentDTO[]> {
  const data = await apiFetch<{ incidents: IncidentDTO[] }>(
    "/api/incidents/mine",
    { auth: true },
  );
  return data.incidents || [];
}

export async function createIncidentApi(
  input: IncidentInput,
): Promise<IncidentDTO> {
  const data = await apiFetch<{ incident: IncidentDTO }>("/api/incidents", {
    method: "POST",
    body: input,
    auth: true,
  });
  return data.incident;
}

export async function updateIncidentApi(
  id: string,
  input: Partial<IncidentInput> & { status?: "active" | "resolved" },
): Promise<IncidentDTO> {
  const data = await apiFetch<{ incident: IncidentDTO }>(
    `/api/incidents/${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      body: input,
      auth: true,
    },
  );
  return data.incident;
}

export async function deleteIncidentApi(id: string): Promise<void> {
  await apiFetch(`/api/incidents/${encodeURIComponent(id)}`, {
    method: "DELETE",
    auth: true,
  });
}
