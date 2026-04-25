import { z } from "zod";

// Signup form validation schemas
export const signupStep1Schema = z.object({
  firstName: z.string().min(1, "Le prénom est requis"),
  lastName: z.string().min(1, "Le nom de famille est requis"),
  gender: z.string().optional(),
  userType: z.enum(["job_seeker", "farm_owner"], {
    message: "Veuillez sélectionner un type de compte",
  }),
});

export const signupStep2Schema = z.object({
  email: z.email("L'email n'est pas valide").nonempty("L'email est requis"),
  phone: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val || val.trim() === "") return true;
        const cleaned = val.replace(/^0+/, "").replace(/\s/g, "");
        return cleaned.length >= 9 && /^\d+$/.test(cleaned);
      },
      { message: "Le numéro de téléphone n'est pas valide" },
    ),
});

export const signupStep3Schema = z
  .object({
    password: z
      .string()
      .min(1, "Le mot de passe est requis")
      .min(6, "Le mot de passe doit contenir au moins 6 caractères"),
    confirmPassword: z
      .string()
      .min(1, "La confirmation du mot de passe est requise"),
    acceptTerms: z.boolean().refine((val) => val === true, {
      message: "Vous devez accepter les conditions d'utilisation",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

export const signupFormSchema = z.object({
  firstName: z.string().min(1, "Le prénom est requis"),
  lastName: z.string().min(1, "Le nom de famille est requis"),
  gender: z.string().optional(),
  userType: z.enum(["job_seeker", "farm_owner"], {
    message: "Veuillez sélectionner un type de compte",
  }),
  email: z.email("L'email n'est pas valide").nonempty("L'email est requis"),
  phone: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val || val.trim() === "") return true;
        const cleaned = val.replace(/^0+/, "").replace(/\s/g, "");
        return cleaned.length >= 9 && /^\d+$/.test(cleaned);
      },
      { message: "Le numéro de téléphone n'est pas valide" },
    ),
  password: z
    .string()
    .min(1, "Le mot de passe est requis")
    .min(6, "Le mot de passe doit contenir au moins 6 caractères"),
  confirmPassword: z
    .string()
    .min(1, "La confirmation du mot de passe est requise"),
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: "Vous devez accepter les conditions d'utilisation",
  }),
});

// Login form validation schema
export const loginSchema = z.object({
  email: z.email("L'email n'est pas valide").nonempty("L'email est requis"),
  password: z.string().min(8, "Le mot de passe est requis"),
});

// Forgot password form validation schema
export const forgotPasswordSchema = z.object({
  email: z.email("L'email n'est pas valide").nonempty("L'email est requis"),
});

// Advice form validation schemas - Step by step
export const adviceStep1Schema = z.object({
  region: z.string().min(1, "Veuillez sélectionner une région"),
  department: z.string().min(1, "Veuillez sélectionner un département"),
  municipality: z.string().min(1, "Veuillez sélectionner une commune"),
});

export const adviceStep2Schema = z.object({
  cultivatedArea: z
    .string()
    .min(1, "Veuillez entrer la superficie")
    .refine(
      (val) => {
        const num = Number(val);
        return !isNaN(num) && num > 0;
      },
      { message: "Veuillez entrer une valeur valide supérieure à 0" },
    ),
  areaUnit: z.enum(["sqm", "hectare"], {
    message: "Veuillez sélectionner une unité de mesure",
  }),
});

export const adviceStep3Schema = z.object({
  soilType: z.string().min(1, "Veuillez sélectionner un type de sol"),
});

export const adviceStep4Schema = z.object({
  productionType: z
    .string()
    .min(1, "Veuillez sélectionner un itinéraire technique"),
});

export const adviceStep5Schema = z.object({
  crop: z.string().min(1, "Veuillez sélectionner une culture"),
});

// Complete advice form validation schema
export const adviceFormSchema = z.object({
  region: z.string().min(1, "Veuillez sélectionner une région"),
  department: z.string().min(1, "Veuillez sélectionner un département"),
  municipality: z.string().min(1, "Veuillez sélectionner une commune"),
  cultivatedArea: z
    .string()
    .min(1, "Veuillez entrer la superficie")
    .refine(
      (val) => {
        const num = Number(val);
        return !isNaN(num) && num > 0;
      },
      { message: "Veuillez entrer une valeur valide supérieure à 0" },
    ),
  areaUnit: z.enum(["sqm", "hectare"], {
    message: "Veuillez sélectionner une unité de mesure",
  }),
  soilType: z.string().min(1, "Veuillez sélectionner un type de sol"),
  productionType: z
    .string()
    .min(1, "Veuillez sélectionner un itinéraire technique"),
  crop: z.string().min(1, "Veuillez sélectionner une culture"),
});

// Technical itinerary generator validation schema
export const itineraryGeneratorSchema = z.object({
  cropId: z.string().min(1, "Veuillez sélectionner une culture"),
  areaM2: z
    .string()
    .min(1, "Veuillez entrer la superficie")
    .refine(
      (value) => {
        const normalized = value.replaceAll(" ", "").replace(",", ".");
        const area = Number(normalized);
        return Number.isFinite(area) && area > 0;
      },
      { message: "Veuillez entrer une superficie valide supérieure à 0" },
    ),
  method: z.enum(["serre", "plein_champ"], {
    message: "Veuillez sélectionner un mode de culture",
  }),
});
