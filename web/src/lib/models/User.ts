export interface User {
  _id?: string; // MongoDB ObjectId as string
  id: string; // Better-auth id
  firstName: string;
  lastName: string;
  email: string;
  emailVerified: boolean;
  image?: string | null;
  gender?: "male" | "female" | "other";
  createdAt: Date;
  updatedAt: Date;
}
