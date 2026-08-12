import mongoose from "mongoose";
import { connectToDatabase } from "./db";
import IncidentModel, {
  IIncident,
  IncidentCategory,
  IncidentStatus,
} from "./models/Incident";

export type IncidentDTO = Omit<IIncident, keyof mongoose.Document> & {
  _id: string;
  createdAt: string;
  updatedAt: string;
};

function toDTO(doc: IIncident): IncidentDTO {
  const obj = doc.toObject ? doc.toObject() : doc;
  return {
    ...(obj as unknown as IncidentDTO),
    _id: String(obj._id),
    createdAt:
      obj.createdAt instanceof Date
        ? obj.createdAt.toISOString()
        : obj.createdAt,
    updatedAt:
      obj.updatedAt instanceof Date
        ? obj.updatedAt.toISOString()
        : obj.updatedAt,
  };
}

export interface IncidentsQuery {
  category?: IncidentCategory;
  status?: IncidentStatus;
  region?: string;
  limit?: number;
  offset?: number;
}

export async function listIncidents(
  params: IncidentsQuery = {},
): Promise<{ incidents: IncidentDTO[]; total: number }> {
  await connectToDatabase();

  const filter: Record<string, unknown> = {};
  if (params.status) filter.status = params.status;
  if (params.category) filter.category = params.category;
  if (params.region) filter.region = params.region;

  const limit = Math.min(Math.max(params.limit ?? 200, 1), 500);
  const offset = Math.max(params.offset ?? 0, 0);

  const total = await IncidentModel.countDocuments(filter);
  const incidents = await IncidentModel.find(filter)
    .sort({ createdAt: -1 })
    .skip(offset)
    .limit(limit);

  return {
    incidents: incidents.map(toDTO),
    total,
  };
}

export async function listMyIncidents(
  reporterId: string,
): Promise<IncidentDTO[]> {
  await connectToDatabase();
  const incidents = await IncidentModel.find({ reporterId }).sort({
    createdAt: -1,
  });
  return incidents.map(toDTO);
}

export async function getIncidentById(
  id: string,
): Promise<IncidentDTO | null> {
  if (!mongoose.isValidObjectId(id)) return null;
  await connectToDatabase();
  const incident = await IncidentModel.findById(id);
  return incident ? toDTO(incident) : null;
}

export async function createIncident(
  reporterId: string,
  reporterName: string,
  data: Partial<IIncident>,
): Promise<IncidentDTO> {
  await connectToDatabase();
  const incident = await IncidentModel.create({
    ...data,
    reporterId,
    reporterName,
    status: "active",
  });
  return toDTO(incident);
}

export async function updateIncident(
  id: string,
  reporterId: string,
  data: Partial<IIncident>,
): Promise<{
  ok: boolean;
  status: number;
  incident?: IncidentDTO;
  error?: string;
}> {
  if (!mongoose.isValidObjectId(id)) {
    return { ok: false, status: 400, error: "ID invalide" };
  }
  await connectToDatabase();
  const existing = await IncidentModel.findById(id);
  if (!existing) {
    return { ok: false, status: 404, error: "Incident introuvable" };
  }
  if (existing.reporterId !== reporterId) {
    return { ok: false, status: 403, error: "Action non autorisée" };
  }
  const {
    reporterId: _ignoredReporterId,
    _id: _ignoredId,
    ...rest
  } = data as Record<string, unknown>;
  Object.assign(existing, rest);
  await existing.save();
  return { ok: true, status: 200, incident: toDTO(existing) };
}

export async function deleteIncident(
  id: string,
  reporterId: string,
): Promise<{ ok: boolean; status: number; error?: string }> {
  if (!mongoose.isValidObjectId(id)) {
    return { ok: false, status: 400, error: "ID invalide" };
  }
  await connectToDatabase();
  const existing = await IncidentModel.findById(id);
  if (!existing) {
    return { ok: false, status: 404, error: "Incident introuvable" };
  }
  if (existing.reporterId !== reporterId) {
    return { ok: false, status: 403, error: "Action non autorisée" };
  }
  await IncidentModel.deleteOne({ _id: id });
  return { ok: true, status: 200 };
}
