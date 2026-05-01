// Signup Form Types
interface SignupFormData {
  firstName: string;
  lastName: string;
  gender: string;
  userType: "job_seeker" | "farm_owner" | "";
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
}

interface SignupFormErrors {
  firstName: string;
  lastName: string;
  userType: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  terms: string;
}

// Login Form Types
interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

interface LoginFormErrors {
  email: string;
  password: string;
}

// Forgot Password Form Types
interface ForgotPasswordFormData {
  email: string;
}

interface ForgotPasswordFormErrors {
  email: string;
}

// Advice Form Types
interface AdviceFormData {
  region: string;
  department: string;
  municipality: string;
  cultivatedArea: string;
  areaUnit: "sqm" | "hectare";
  soilType: string;
  productionType: string;
  crop: string;
}

interface AdviceFormErrors {
  region?: string;
  department?: string;
  municipality?: string;
  cultivatedArea?: string;
  soilType?: string;
  productionType?: string;
  crop?: string;
}

// Map Mode Type
type MapMode = "explorer" | "farm" | "incidents";

// Farm Location Types
type FarmArea = "less_1ha" | "1ha" | "2ha" | "other";
type FarmType =
  | "maraicher"
  | "avicole"
  | "fruitier"
  | "elevage"
  | "agroecologie"
  | "cerealiculture"
  | "aquaculture"
  | "autre";

interface FarmLocation {
  id: string;
  remoteId?: string;
  userId: string;
  name: string;
  geometryType: "point" | "polygon";
  coordinates?: {
    longitude: number;
    latitude: number;
  };
  boundaryCoordinates?: {
    longitude: number;
    latitude: number;
  }[];
  surfaceHectares?: number;
  area?: FarmArea;
  farmType?: FarmType;
  currentCrops?: string;
  contact?: string;
  hidePersonalInfo?: boolean;
  gpsCaptured?: boolean;
  syncStatus?: "pending" | "synced" | "error";
  createdAt: string;
  updatedAt: string;
}

// Incident Report Types
type IncidentCategory =
  | "crop_disease"
  | "pests"
  | "fire"
  | "flood"
  | "drought"
  | "locusts"
  | "storm"
  | "other";

type IncidentSeverity = "low" | "medium" | "high";

interface IncidentReport {
  id: string;
  reporterId: string;
  reporterName: string;
  category: IncidentCategory;
  customCategory?: string;
  title: string;
  description: string;
  severity: IncidentSeverity;
  coordinates: {
    longitude: number;
    latitude: number;
  };
  images: string[];
  createdAt: string;
  status: "active" | "resolved";
}

// User Context Types
type UserType = "job_seeker" | "farm_owner";

interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  userType: UserType;
  gender?: string;
  image?: string;
}

interface UserContextType {
  userType: UserType;
  setUserType: (type: UserType) => void;
  toggleUserType: () => void;
  currentUser: UserProfile | null;
  setCurrentUser: (user: UserProfile | null) => void;
}

// Job Types
type JobContractType = "CDI" | "CDD" | "Saisonnier" | "Stage";
type JobStatus = "active" | "paused" | "closed" | "expired";

interface Job {
  _id?: string;
  id?: string;
  title: string;
  farmName: string;
  location: string;
  region: string;
  department: string;
  contractType: JobContractType;
  salaryRange: string;
  description: string;
  requirements: string[];
  postedDate: string;
  applicantsCount: number;
  status: JobStatus;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface JobApplication {
  _id?: string;
  id?: string;
  jobId: string;
  applicantId?: string;
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
  appliedDate: string;
  status: "pending" | "reviewed" | "accepted" | "rejected";
  coverLetter?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Job Application Form Types (candidate)
interface JobApplicationFormData {
  firstName: string;
  lastName: string;
  address: string;
  region: string;
  department: string;
  phone: string;
  email: string;
  education: string;
  experience: string;
  desiredPosition: string;
  salaryExpectation: string;
  coverLetter: string;
}

interface JobApplicationFormErrors {
  firstName: string;
  lastName: string;
  address: string;
  region: string;
  department: string;
  phone: string;
  email: string;
  education: string;
  experience: string;
  desiredPosition: string;
  salaryExpectation: string;
}

// Job Posting Form Types
interface JobPostingFormData {
  title: string;
  farmName: string;
  location: string;
  region: string;
  department: string;
  contractType: "CDI" | "CDD" | "Saisonnier" | "Stage" | "";
  status: "active" | "paused" | "closed" | "expired" | "";
  salaryRange: string;
  description: string;
  requirements: string;
}

interface JobPostingFormErrors {
  title: string;
  farmName: string;
  location: string;
  region: string;
  department: string;
  contractType: string;
  status: string;
  salaryRange: string;
  description: string;
  requirements: string;
}

// Formation Types (mirrors web schema)

interface FormationLesson {
  id: number;
  title: string;
  content?: string;
}

interface FormationSection {
  id: number;
  title: string;
  description?: string;
  lessons: FormationLesson[];
}

interface FormationQuizOption {
  id: string;
  text: string;
}

interface FormationQuizQuestion {
  id: number;
  question: string;
  image?: string;
  points: number;
  options: FormationQuizOption[];
}

interface FormationQuizSection {
  id: number;
  title: string;
  questions: FormationQuizQuestion[];
}

interface FormationStats {
  totalSections: number;
  totalLessons: number;
}

interface OnlineFormation {
  _id: string;
  title: string;
  description: string;
  image: string;
  duration?: string;
  level: string;
  price: number;
  category: string;
  type: "online";
  icon: string;
  sections?: FormationSection[];
  owned?: boolean;
  stats?: FormationStats;
  accessExpiresAt?: string | Date;
  createdAt: string | Date;
  updatedAt: string | Date;
}

interface PresentialTimeFrame {
  from: string;
  to: string;
  name: string;
  description?: string;
}

interface PresentialDay {
  name: string;
  timeFrames: PresentialTimeFrame[];
}

interface PresentialSession {
  id: number;
  startDate: string | Date;
  endDate: string | Date;
  location: string;
  availableSpots: number;
  reservedSpots?: number;
  status: "open" | "ongoing" | "done";
  owned?: boolean;
}

interface PresentialFormation {
  _id: string;
  title: string;
  description: string;
  image: string;
  durationDays: number;
  level: string;
  price: number;
  category: string;
  type: "presentiel";
  icon: string;
  program: PresentialDay[];
  sessions: PresentialSession[];
  address: string;
  contactPhone?: string;
  contactEmail?: string;
  maxParticipants?: number;
  owned?: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
}

type Formation = OnlineFormation | PresentialFormation;

interface FormationProgress {
  formationId: string;
  completedLessons: string[]; // "sectionId-lessonId"
  lastAccessedAt: string | Date;
}

interface QuizAnswerInput {
  questionId: number;
  selectedAnswer: string;
}

interface QuizGradedAnswer {
  sectionId: number;
  questionId: number;
  correct: boolean;
}

interface QuizSubmitResult {
  score: number;
  total: number;
  passed: boolean;
  certificateSent: boolean;
  answers: QuizGradedAnswer[];
}

interface QuizResult {
  formationId: string;
  score: number;
  totalQuestions: number;
  passed: boolean;
  certificateSent?: boolean;
  attemptDate: string | Date;
  completedAt: string | Date;
}

interface QuizAttemptsInfo {
  attemptsToday: number;
  maxDailyAttempts: number;
  remaining: number;
}

// Orders
interface OrderItem {
  id?: number | string;
  _id?: string;
  name?: string;
  title?: string;
  category?: string;
  unit?: string;
  quantity: number;
  price?: number;
  priceTTC?: number;
  image?: string;
  imageUrl?: string;
  description?: string;
  shortDescription?: string;
  selectedSessionId?: number;
  sessionId?: number;
}

interface OrderAddress {
  street: string;
  city: string;
  postalCode: string;
  country: string;
}

interface Order {
  _id: string;
  userId: string;
  items: OrderItem[];
  totalAmount: number;
  paymentStatus: "paid" | "pending" | "failed";
  paymentMethod?: string;
  address?: OrderAddress;
  paydunyaToken?: string;
  paydunyaStatus?: string;
  paydunyaReceiptUrl?: string;
  paydunyaFailReason?: string;
  createdAt: string | Date;
  updatedAt: string | Date;
}

// Shop Types
type ShopCategory = "engrais" | "phyto" | "semence" | "petit_materiel";
type ShopOrigin = "tabs" | "tabs-job-seeker";
type ShopSortOption = "none" | "price_asc" | "price_desc";

interface ShopProduct {
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
}

interface ShopCartItem {
  productId: string;
  quantity: number;
}

interface ShopCartTotals {
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
}

// Itinerary Generator Types
type ItineraryScheduleType = "weekly" | "phase" | "stage";
type ItineraryDoseUnit = "kg" | "g" | "ml" | "l";

interface ItineraryDoseDefinition {
  product: string;
  dose: number;
  unit: ItineraryDoseUnit;
}

interface ItineraryFertilizationStep {
  id: string;
  label: string;
  schedule: string;
  doses: ItineraryDoseDefinition[];
}

interface ItineraryPhytoCategory {
  id: string;
  label: string;
  products: string[];
  notes?: string;
}

interface ItineraryPhytoProtocol {
  frequency: string;
  emergencyFrequency: string;
  disclaimer: string;
  categories: ItineraryPhytoCategory[];
}

interface ItineraryProgramDefinition {
  scheduleType: ItineraryScheduleType;
  fertilization: ItineraryFertilizationStep[];
  phyto: ItineraryPhytoProtocol;
  notes?: string[];
}

interface CropItineraryDefinition {
  id: string;
  cropName: string;
  emoji: string;
  tagline: string;
  baselineAreaM2: number;
  sourcePdf: string[];
  cultivationNote: string;
  program: ItineraryProgramDefinition;
}

interface ScaledItineraryDose extends ItineraryDoseDefinition {
  scaledDose: number;
}

interface ScaledItineraryFertilizationStep
  extends Omit<ItineraryFertilizationStep, "doses"> {
  doses: ScaledItineraryDose[];
}

interface ScaledItineraryProgram {
  scheduleType: ItineraryScheduleType;
  fertilization: ScaledItineraryFertilizationStep[];
  phyto: ItineraryPhytoProtocol;
  notes?: string[];
}

interface ScaledCropItinerary {
  id: string;
  cropName: string;
  emoji: string;
  cultivationNote: string;
  areaM2: number;
  scaleFactor: number;
  baselineAreaM2: number;
  sourcePdf: string[];
  program: ScaledItineraryProgram;
}

interface ItineraryGeneratorFormData {
  cropId: string;
  areaM2: string;
}

interface ItineraryGeneratorFormErrors {
  cropId?: string;
  areaM2?: string;
}

interface ItineraryHistoryEntry {
  id: string;
  cropId: string;
  cropName: string;
  emoji: string;
  areaM2: number;
  generatedAt: string;
  pdfUri: string | null;
  pdfFileName: string;
  savedToDownloads: boolean;
}
