export type ShopCategory = "engrais" | "phyto" | "semence" | "petit_materiel";

export type Product = {
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
};

export type PaydunyaCartItem = {
  quantity: number;
  price: number;
  _id?: string;
  id?: number;
  title?: string;
  name?: string;
  category?: string;
} & Record<string, unknown>;

export interface PaydunyaInvoice {
  token?: string;
  total_amount: number;
  description?: string;
}

export interface PaydunyaActions {
  cancel_url?: string;
  return_url?: string;
  callback_url?: string;
}

export interface PaydunyaCustomer {
  name?: string;
  email?: string;
  phone?: string;
}

export interface PaydunyaCustomData {
  userId: string;
  cart: any[];
  address?: Address;
}

export interface PaydunyaCallbackData {
  response_code?: string;
  response_text?: string;
  hash: string;
  invoice: PaydunyaInvoice;
  custom_data: PaydunyaCustomData;
  actions?: PaydunyaActions;
  mode?: string;
  status: string;
  customer?: PaydunyaCustomer;
  receipt_url?: string;
  fail_reason?: string;
  errors?: {
    message?: string;
    description?: string;
  };
}

export type Lesson = {
  id: number;
  title: string;
  content?: string;
};

export type Section = {
  id: number;
  title: string;
  description?: string;
  lessons: Lesson[];
};

export type TimeFrame = {
  from: string;
  to: string;
  name: string;
  description?: string;
};

export type Day = {
  name: string;
  timeFrames: TimeFrame[];
};

export type FormationSession = {
  id: number;
  startDate: Date;
  endDate: Date;
  location: string;
  availableSpots: number;
  participants?: string[];
  reservedSpots?: number;
  owned?: boolean;
  status: "open" | "ongoing" | "done";
};

export type OnlineFormation = {
  _id: string;
  title: string;
  description: string;
  image: string;
  duration?: string;
  level: string;
  price: number;
  category: string;
  type: "online";
  sections?: Section[];
  quiz?: {
    sections: QuizSection[];
  };
  icon: string;
  owners?: {
    userId: string;
    purchaseDate: Date;
  }[];
  accessExpiresAt?: Date;
  owned?: boolean;
  stats?: {
    totalSections: number;
    totalLessons: number;
  };
  createdAt: Date;
  updatedAt: Date;
};

export type PresentialFormation = {
  _id: string;
  title: string;
  description: string;
  image: string;
  durationDays: number;
  level: string;
  price: number;
  category: string;
  type: "presentiel";
  program: Day[];
  sessions: FormationSession[];
  address: string;
  contactPhone?: string;
  contactEmail?: string;
  icon: string;
  maxParticipants?: number;
  owned?: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type Formation = OnlineFormation | PresentialFormation;

export type CartItem = (Product | OnlineFormation | PresentialFormation) & {
  quantity: number;
  selectedSessionId?: number; // For presentiel formations with multiple sessions
};

// User form data type for registration
export type UserFormData = {
  firstName: string;
  lastName: string;
  gender: string;
  email: string;
  phone?: string;
  address?: Address;
  password: string;
  confirmPassword: string;
};

// Address type
export type Address = {
  id?: string;
  street: string;
  city: string;
  postalCode: string;
  country: string;
  isDefault?: boolean;
};

// Better Auth types
export type User = {
  id: string;
  email: string;
  name?: string;
  firstName: string;
  lastName: string;
  gender?: "male" | "female" | "other";
  phone?: string;
  addresses?: Address[];
  image?: string | null;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type Session = {
  user: User;
  session: {
    id: string;
    expiresAt: Date;
    ipAddress?: string;
    userAgent?: string;
  };
};

export type OrderItem = CartItem & { sessionId?: number; id?: number };

export type Order = {
  _id?: string;
  userId: string;
  items: OrderItem[];
  totalAmount: number;
  paymentStatus: "paid" | "pending" | "failed";
  paymentMethod?: string;
  address?: Address;
  paydunyaToken?: string;
  paydunyaStatus?: string;
  paydunyaReceiptUrl?: string;
  paydunyaCustomer?: PaydunyaCustomer;
  paydunyaFailReason?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type JobContractType = "CDI" | "CDD" | "Saisonnier" | "Stage";
export type JobStatus = "active" | "paused" | "closed" | "expired";
export type JobApplicationStatus =
  | "pending"
  | "reviewed"
  | "accepted"
  | "rejected";

export type Job = {
  _id?: string;
  title: string;
  farmName: string;
  location: string;
  region: string;
  department: string;
  contractType: JobContractType;
  salaryRange: string;
  description: string;
  requirements: string[];
  applicantsCount: number;
  status: JobStatus;
  createdBy: string;
  postedDate: Date | string;
  createdAt: Date | string;
  updatedAt: Date | string;
};

export type JobApplication = {
  _id?: string;
  jobId: string;
  applicantId: string;
  applicantName: string;
  applicantEmail: string;
  applicantPhone: string;
  applicantAddress?: string;
  region?: string;
  department?: string;
  education: string;
  experience: string;
  desiredPosition: string;
  salaryExpectation: string;
  coverLetter?: string;
  status: JobApplicationStatus;
  appliedDate: Date | string;
  createdAt: Date | string;
  updatedAt: Date | string;
};

export type ContactFormData = {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
};

export type FormationProgress = {
  _id?: string;
  userId: string;
  formationId: number;
  completedLessons: string[]; // Format: "sectionId-lessonId"
  lastAccessedAt: Date;
  createdAt: Date;
  updatedAt: Date;
};

export type QuizOption = {
  id: string;
  text: string;
};

export type QuizQuestion = {
  id: number;
  question: string;
  image?: string; // optional image URL for the question
  points: number;
  options: QuizOption[];
  correctAnswer: string; // id of the correct option
};

export type QuizSection = {
  id: number;
  title: string;
  questions: QuizQuestion[];
};

export type QuizResult = {
  _id?: string;
  userId: string;
  formationId: number;
  score: number;
  totalQuestions: number;
  passed: boolean;
  certificateSent?: boolean;
  answers: {
    sectionId: number;
    questionId: number;
    selectedAnswer: string;
    correct: boolean;
  }[];
  attemptDate: Date;
  completedAt: Date;
  createdAt: Date;
  updatedAt: Date;
};

export type CertificateData = {
  userName: string;
  formationTitle: string;
  completionDate: Date;
};

export type EmailAttachment = {
  filename: string;
  content: Buffer | Uint8Array;
  contentType?: string;
};
