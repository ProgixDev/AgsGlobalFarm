import mongoose, { Schema, Document } from "mongoose";

export type ShopCategory = "engrais" | "phyto" | "semence" | "petit_materiel";

export interface IProduct extends Document {
  id: string;
  name: string;
  category: ShopCategory;
  priceTTC: number;
  unit: string;
  imageUrl: string;
  cloudinaryPublicId?: string;
  shortDescription: string;
  longDescription: string;
  isInStock: boolean;
  stockQty: number;
  brand?: string;
  origin?: string;
  usage?: string;
  safety?: string;
  dosage?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    category: {
      type: String,
      required: true,
      enum: ["engrais", "phyto", "semence", "petit_materiel"],
      index: true,
    },
    priceTTC: { type: Number, required: true },
    unit: { type: String, required: true },
    imageUrl: { type: String, required: true },
    cloudinaryPublicId: { type: String },
    shortDescription: { type: String, required: true },
    longDescription: { type: String, required: true },
    isInStock: { type: Boolean, required: true, default: true },
    stockQty: { type: Number, required: true, default: 0 },
    brand: { type: String },
    origin: { type: String },
    usage: { type: String },
    safety: { type: String },
    dosage: { type: String },
  },
  {
    timestamps: true,
  },
);

ProductSchema.index({
  name: "text",
  shortDescription: "text",
  longDescription: "text",
  brand: "text",
});

const Product =
  mongoose.models.Product || mongoose.model<IProduct>("Product", ProductSchema);

export default Product;
