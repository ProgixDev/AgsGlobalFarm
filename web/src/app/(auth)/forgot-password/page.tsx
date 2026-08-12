"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Mail,
  ArrowLeft,
  CheckCircle,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

const COOLDOWN_SECONDS = 60;

export default function ForgotPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  // Determine mode based on token presence
  const mode = token ? "reset" : "request";

  // Request mode state
  const [email, setEmail] = useState("");
  const [requestSuccess, setRequestSuccess] = useState(false);
  const [emailActuallySent, setEmailActuallySent] = useState(false);

  // Cooldown state
  const [cooldownRemaining, setCooldownRemaining] = useState(0);

  // Reset mode state
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  // Common state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Cooldown timer effect
  useEffect(() => {
    if (cooldownRemaining <= 0) return;

    const timer = setInterval(() => {
      setCooldownRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [cooldownRemaining]);

  useEffect(() => {
    // Validate token presence for reset mode
    if (mode === "reset" && !token) {
      setError("Lien de réinitialisation invalide ou expiré");
    }
  }, [mode, token]);

  const sendPasswordResetRequest = useCallback(async (emailAddress: string) => {
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/request-password-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailAddress }),
      });

      const data = await response.json();

      if (data.cooldown) {
        setCooldownRemaining(data.timeRemaining);
        setError(data.error);
        return false;
      }

      if (!data.success) {
        setError(data.error || "Une erreur est survenue");
        return false;
      }

      setEmailActuallySent(data.emailSent);
      setRequestSuccess(true);
      setCooldownRemaining(COOLDOWN_SECONDS);
      return true;
    } catch {
      setError("Une erreur est survenue. Veuillez réessayer.");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await sendPasswordResetRequest(email);
  };

  const handleResendEmail = async () => {
    if (cooldownRemaining > 0) return;
    setRequestSuccess(false);
    await sendPasswordResetRequest(email);
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères");
      return;
    }

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }

    if (!token) {
      setError("Lien de réinitialisation invalide");
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await authClient.resetPassword({
        newPassword: password,
        token: token!,
      });

      if (error) {
        setError(error.message || "Erreur lors de la réinitialisation");
      } else {
        setResetSuccess(true);
        setTimeout(() => {
          router.push("/login");
        }, 3000);
      }
    } catch {
      setError("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <section className="relative h-full overflow-hidden bg-emerald-900 flex items-center justify-center">
        {/* Decorative SVG Top */}
        <div className="absolute inset-0 opacity-10">
          <svg
            className="w-full h-full"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <path d="M0 100 C 20 0 50 0 100 100 Z" fill="white" />
          </svg>
        </div>

        {/* Background Pattern */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(var(--color-brand) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        ></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-lg mx-auto">
            {/* Form Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-white rounded-2xl p-8 shadow-2xl backdrop-blur-sm"
            >
              {mode === "request" ? (
                <>
                  {/* Back Link */}
                  <Link
                    href="/login"
                    className="inline-flex items-center text-emerald-600 hover:text-emerald-700 mb-6 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Retour à la connexion
                  </Link>

                  {!requestSuccess ? (
                    <>
                      {/* Header */}
                      <div className="text-center mb-8">
                        <h1 className="text-3xl md:text-4xl font-bold text-orange-500 mb-3">
                          Mot de passe oublié
                        </h1>
                        <p className="text-gray-600">
                          Entrez votre adresse email pour recevoir un lien de
                          réinitialisation
                        </p>
                      </div>

                      <form
                        onSubmit={handleRequestSubmit}
                        className="space-y-6"
                      >
                        {/* Error Message */}
                        {error && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm"
                          >
                            {error}
                          </motion.div>
                        )}

                        {/* Email Field */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-600" />
                            <input
                              type="email"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              required
                              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                              placeholder="votre@email.com"
                            />
                          </div>
                        </div>

                        {/* Submit Button */}
                        <Button
                          type="submit"
                          disabled={isLoading}
                          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-6 text-base font-semibold transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                        >
                          {isLoading ? (
                            <>
                              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                              Envoi en cours...
                            </>
                          ) : (
                            <>
                              <Mail className="w-5 h-5 mr-2" />
                              Envoyer le lien
                            </>
                          )}
                        </Button>
                      </form>
                    </>
                  ) : (
                    <>
                      {/* Success Message */}
                      <div className="text-center py-8">
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", duration: 0.5 }}
                          className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                            emailActuallySent ? "bg-green-100" : "bg-yellow-100"
                          }`}
                        >
                          {emailActuallySent ? (
                            <CheckCircle className="w-8 h-8 text-green-600" />
                          ) : (
                            <Mail className="w-8 h-8 text-yellow-600" />
                          )}
                        </motion.div>

                        <h2 className="text-2xl font-bold text-gray-900 mb-3">
                          {emailActuallySent
                            ? "Email envoyé avec succès !"
                            : "Demande traitée"}
                        </h2>

                        <p className="text-gray-600 mb-6">
                          {emailActuallySent ? (
                            <>
                              Un email de réinitialisation a été envoyé à{" "}
                              <strong>{email}</strong>. Vérifiez votre boîte de
                              réception.
                            </>
                          ) : (
                            <>
                              Si un compte existe avec l&apos;adresse{" "}
                              <strong>{email}</strong>, vous recevrez un email
                              avec les instructions pour réinitialiser votre mot
                              de passe.
                            </>
                          )}
                        </p>

                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                          <p className="text-sm text-blue-800">
                            💡 <strong>Astuce :</strong> Vérifiez également
                            votre dossier spam si vous ne voyez pas
                            l&apos;email.
                          </p>
                        </div>

                        {/* Resend Email Button */}
                        <div className="space-y-3">
                          <Button
                            onClick={handleResendEmail}
                            disabled={cooldownRemaining > 0 || isLoading}
                            variant="outline"
                            className="w-full border-emerald-600 text-emerald-600 hover:bg-emerald-50 py-3"
                          >
                            {isLoading ? (
                              <>
                                <div className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mr-2" />
                                Envoi en cours...
                              </>
                            ) : cooldownRemaining > 0 ? (
                              <>
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Renvoyer l&apos;email ({cooldownRemaining}s)
                              </>
                            ) : (
                              <>
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Renvoyer l&apos;email
                              </>
                            )}
                          </Button>

                          <Link href="/login">
                            <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3">
                              Retour à la connexion
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </>
                  )}
                </>
              ) : (
                <>
                  {/* Reset Password Mode */}
                  {!resetSuccess ? (
                    <>
                      {/* Header */}
                      <div className="text-center mb-8">
                        <h1 className="text-3xl md:text-4xl font-bold text-orange-500 mb-3">
                          Nouveau mot de passe
                        </h1>
                        <p className="text-gray-600">
                          Choisissez un nouveau mot de passe sécurisé pour votre
                          compte
                        </p>
                      </div>

                      <form onSubmit={handleResetSubmit} className="space-y-6">
                        {/* Error Message */}
                        {error && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-start"
                          >
                            <AlertCircle className="w-5 h-5 mr-2 shrink-0 mt-0.5" />
                            <span>{error}</span>
                          </motion.div>
                        )}

                        {/* Password Field */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nouveau mot de passe{" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-600" />
                            <input
                              type={showPassword ? "text" : "password"}
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              required
                              minLength={8}
                              className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                              placeholder="Minimum 8 caractères"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-emerald-600 transition-colors"
                            >
                              {showPassword ? (
                                <EyeOff className="w-5 h-5" />
                              ) : (
                                <Eye className="w-5 h-5" />
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Confirm Password Field */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Confirmer le mot de passe{" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-600" />
                            <input
                              type={showConfirmPassword ? "text" : "password"}
                              value={confirmPassword}
                              onChange={(e) =>
                                setConfirmPassword(e.target.value)
                              }
                              required
                              minLength={8}
                              className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                              placeholder="Confirmer le mot de passe"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                setShowConfirmPassword(!showConfirmPassword)
                              }
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-emerald-600 transition-colors"
                            >
                              {showConfirmPassword ? (
                                <EyeOff className="w-5 h-5" />
                              ) : (
                                <Eye className="w-5 h-5" />
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Password Requirements */}
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                          <p className="text-sm text-gray-700 font-medium mb-2">
                            Exigences du mot de passe :
                          </p>
                          <ul className="text-sm text-gray-600 space-y-1">
                            <li
                              className={
                                password.length >= 8
                                  ? "text-green-600"
                                  : "text-gray-600"
                              }
                            >
                              • Minimum 8 caractères
                            </li>
                            <li
                              className={
                                password === confirmPassword &&
                                password.length > 0
                                  ? "text-green-600"
                                  : "text-gray-600"
                              }
                            >
                              • Les deux mots de passe correspondent
                            </li>
                          </ul>
                        </div>

                        {/* Submit Button */}
                        <Button
                          type="submit"
                          disabled={isLoading || !token}
                          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-6 text-base font-semibold transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                        >
                          {isLoading ? (
                            <>
                              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                              Réinitialisation...
                            </>
                          ) : (
                            <>
                              <Lock className="w-5 h-5 mr-2" />
                              Réinitialiser le mot de passe
                            </>
                          )}
                        </Button>

                        {/* Login Link */}
                        <div className="text-center pt-4 border-t border-gray-200">
                          <p className="text-sm text-gray-600">
                            Vous vous souvenez de votre mot de passe ?{" "}
                            <Link
                              href="/login"
                              className="text-emerald-600 hover:text-emerald-700 font-semibold transition-colors"
                            >
                              Se connecter
                            </Link>
                          </p>
                        </div>
                      </form>
                    </>
                  ) : (
                    <>
                      {/* Success Message */}
                      <div className="text-center py-8">
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", duration: 0.5 }}
                          className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
                        >
                          <CheckCircle className="w-8 h-8 text-green-600" />
                        </motion.div>

                        <h2 className="text-2xl font-bold text-gray-900 mb-3">
                          Mot de passe réinitialisé !
                        </h2>

                        <p className="text-gray-600 mb-6">
                          Votre mot de passe a été modifié avec succès. Vous
                          allez être redirigé vers la page de connexion...
                        </p>

                        <Link href="/login">
                          <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3">
                            Se connecter maintenant
                          </Button>
                        </Link>
                      </div>
                    </>
                  )}
                </>
              )}
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
