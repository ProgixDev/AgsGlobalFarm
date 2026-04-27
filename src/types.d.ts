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
}

interface UserContextType {
  userType: UserType;
  setUserType: (type: UserType) => void;
  toggleUserType: () => void;
  currentUser: UserProfile | null;
  setCurrentUser: (user: UserProfile | null) => void;
}

// Job Types
interface Job {
  id: string;
  title: string;
  farmName: string;
  location: string;
  region: string;
  department: string;
  contractType: "CDI" | "CDD" | "Saisonnier" | "Stage";
  salaryRange: string;
  description: string;
  requirements: string[];
  postedDate: string;
  applicantsCount: number;
  status: "active" | "paused" | "closed" | "expired";
  createdBy?: string;
}

interface JobApplication {
  id: string;
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

// Training System Types
type ContentType = "video" | "text" | "image" | "pdf" | "quiz";
type DifficultyLevel = "débutant" | "intermédiaire" | "avancé";
type QuestionType = "multiple_choice" | "true_false" | "text";

interface MediaContent {
  type: ContentType;
  url?: string;
  localUri?: string;
  text?: string;
  duration?: number; // for videos in seconds
  thumbnailUrl?: string;
  downloadProgress?: number;
  isDownloaded?: boolean;
}

interface QuizQuestion {
  id: string;
  type: QuestionType;
  question: string;
  options?: string[];
  correctAnswer: string | number;
  explanation?: string;
}

interface Quiz {
  id: string;
  title: string;
  questions: QuizQuestion[];
  passingScore: number; // percentage
  timeLimit?: number; // in minutes
}

interface Lesson {
  id: string;
  title: string;
  description: string;
  content: MediaContent[];
  duration: number; // estimated duration in minutes
  order: number;
  quiz?: Quiz;
  isLocked?: boolean;
}

interface CourseModule {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
  order: number;
}

interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  thumbnailUrl: string;
  difficulty: DifficultyLevel;
  duration: number; // total duration in hours
  modules: CourseModule[];
  tags: string[];
  instructorName?: string;
  requiresCertification: boolean;
  certificationCriteria?: {
    minimumScore: number;
    requiredLessons: number;
    onSiteTrainingRequired?: boolean;
  };
}

interface LessonProgress {
  lessonId: string;
  courseId: string;
  completed: boolean;
  lastPosition?: number; // for video position
  completedAt?: string;
  timeSpent: number; // in seconds
}

interface QuizAttempt {
  quizId: string;
  lessonId: string;
  courseId: string;
  score: number;
  totalQuestions: number;
  answers: Record<string, string | number>;
  attemptedAt: string;
  passed: boolean;
}

interface CourseProgress {
  courseId: string;
  enrolledAt: string;
  lastAccessedAt: string;
  completedLessons: number;
  totalLessons: number;
  progressPercentage: number;
  quizScores: QuizAttempt[];
  certificateEarned: boolean;
  certificateId?: string;
}

interface Bookmark {
  id: string;
  courseId: string;
  lessonId: string;
  timestamp: number; // for video bookmarks
  note?: string;
  createdAt: string;
}

interface Note {
  id: string;
  courseId: string;
  lessonId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

interface Certificate {
  id: string;
  courseId: string;
  userId: string;
  userName: string;
  issuedAt: string;
  expiresAt?: string;
  verificationCode: string;
  pdfUrl?: string;
  onSiteTrainingCompleted: boolean;
  onSiteTrainingDate?: string;
  onSiteTrainingLocation?: string;
}

interface TrainingContextType {
  courses: Course[];
  enrolledCourses: string[];
  courseProgress: Record<string, CourseProgress>;
  lessonProgress: Record<string, LessonProgress>;
  bookmarks: Bookmark[];
  notes: Note[];
  certificates: Certificate[];
  enrollInCourse: (courseId: string) => void;
  updateLessonProgress: (
    lessonId: string,
    courseId: string,
    progress: Partial<LessonProgress>,
  ) => void;
  completeLesson: (lessonId: string, courseId: string) => void;
  submitQuizAttempt: (attempt: QuizAttempt) => void;
  addBookmark: (bookmark: Omit<Bookmark, "id" | "createdAt">) => void;
  removeBookmark: (bookmarkId: string) => void;
  addNote: (note: Omit<Note, "id" | "createdAt" | "updatedAt">) => void;
  updateNote: (noteId: string, content: string) => void;
  deleteNote: (noteId: string) => void;
  downloadLesson: (lessonId: string, courseId: string) => Promise<void>;
  getCourseById: (courseId: string) => Course | undefined;
  getLessonById: (courseId: string, lessonId: string) => Lesson | undefined;
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
