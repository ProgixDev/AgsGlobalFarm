export interface Session {
  _id?: string; // MongoDB ObjectId as string
  id: string; // Better-auth id
  expiresAt: Date;
  token: string;
  createdAt: Date;
  updatedAt: Date;
  ipAddress?: string;
  userAgent?: string;
  userId: string; // Reference to User.id
}
