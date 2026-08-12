"use client";

export default function BackButton() {
  return (
    <button
      onClick={() => window.history.back()}
      className="text-green-600 hover:text-green-700 mb-4 inline-flex items-center"
    >
      ← Retour à mes formations
    </button>
  );
}
