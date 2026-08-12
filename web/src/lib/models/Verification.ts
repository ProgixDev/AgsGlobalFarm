export interface Verification {
  _id?: string; // MongoDB ObjectId as string
  id: string; // Better-auth id
  identifier: string;
  value: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}
