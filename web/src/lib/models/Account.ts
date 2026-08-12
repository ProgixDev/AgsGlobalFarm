export interface Account {
  _id?: string; // MongoDB ObjectId as string
  id: string; // Better-auth id
  accountId: string;
  providerId: string;
  userId: string; // Reference to User.id
  accessToken?: string;
  refreshToken?: string;
  idToken?: string;
  accessTokenExpiresAt?: Date;
  refreshTokenExpiresAt?: Date;
  scope?: string;
  password?: string;
  createdAt: Date;
  updatedAt: Date;
}
