import mongoose from "mongoose";
import { connectToDatabase } from "./db";
import FarmModel, { IFarm } from "./models/Farm";

export type FarmDTO = Omit<IFarm, keyof mongoose.Document> & {
  _id: string;
  createdAt: string;
  updatedAt: string;
};

function toDTO(doc: IFarm): FarmDTO {
  const obj = doc.toObject ? doc.toObject() : doc;
  return {
    ...(obj as unknown as FarmDTO),
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

export async function listMyFarms(userId: string): Promise<FarmDTO[]> {
  await connectToDatabase();
  const farms = await FarmModel.find({ userId }).sort({ createdAt: -1 });
  return farms.map(toDTO);
}

export async function createFarm(
  userId: string,
  data: Partial<IFarm>,
): Promise<FarmDTO> {
  await connectToDatabase();
  const farm = await FarmModel.create({ ...data, userId });
  return toDTO(farm);
}

export async function updateFarm(
  id: string,
  userId: string,
  data: Partial<IFarm>,
): Promise<{
  ok: boolean;
  status: number;
  farm?: FarmDTO;
  error?: string;
}> {
  if (!mongoose.isValidObjectId(id)) {
    return { ok: false, status: 400, error: "ID invalide" };
  }
  await connectToDatabase();
  const existing = await FarmModel.findById(id);
  if (!existing) {
    return { ok: false, status: 404, error: "Ferme introuvable" };
  }
  if (existing.userId !== userId) {
    return { ok: false, status: 403, error: "Action non autorisée" };
  }
  const { userId: _ignoredUserId, _id: _ignoredId, ...rest } = data as Record<
    string,
    unknown
  >;
  Object.assign(existing, rest);
  await existing.save();
  return { ok: true, status: 200, farm: toDTO(existing) };
}

export async function deleteFarm(
  id: string,
  userId: string,
): Promise<{ ok: boolean; status: number; error?: string }> {
  if (!mongoose.isValidObjectId(id)) {
    return { ok: false, status: 400, error: "ID invalide" };
  }
  await connectToDatabase();
  const existing = await FarmModel.findById(id);
  if (!existing) {
    return { ok: false, status: 404, error: "Ferme introuvable" };
  }
  if (existing.userId !== userId) {
    return { ok: false, status: 403, error: "Action non autorisée" };
  }
  await FarmModel.deleteOne({ _id: id });
  return { ok: true, status: 200 };
}
