import { apiFetch } from "@/lib/api/client";

export interface FarmDTO {
  _id: string;
  userId: string;
  name: string;
  geometryType: "point" | "polygon";
  coordinates?: { longitude: number; latitude: number };
  boundaryCoordinates?: { longitude: number; latitude: number }[];
  surfaceHectares?: number;
  area?: FarmArea;
  farmType?: FarmType;
  currentCrops?: string;
  contact?: string;
  hidePersonalInfo?: boolean;
  gpsCaptured?: boolean;
  createdAt: string;
  updatedAt: string;
}

export type FarmInput = Omit<
  FarmDTO,
  "_id" | "userId" | "createdAt" | "updatedAt"
>;

export async function fetchMyFarms(): Promise<FarmDTO[]> {
  const data = await apiFetch<{ farms: FarmDTO[] }>("/api/farms", {
    auth: true,
  });
  return data.farms || [];
}

export async function createFarmApi(input: FarmInput): Promise<FarmDTO> {
  const data = await apiFetch<{ farm: FarmDTO }>("/api/farms", {
    method: "POST",
    body: input,
    auth: true,
  });
  return data.farm;
}

export async function updateFarmApi(
  id: string,
  input: Partial<FarmInput>,
): Promise<FarmDTO> {
  const data = await apiFetch<{ farm: FarmDTO }>(
    `/api/farms/${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      body: input,
      auth: true,
    },
  );
  return data.farm;
}

export async function deleteFarmApi(id: string): Promise<void> {
  await apiFetch(`/api/farms/${encodeURIComponent(id)}`, {
    method: "DELETE",
    auth: true,
  });
}
