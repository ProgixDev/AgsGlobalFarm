import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useJobsStore } from "@/stores/jobsStore";
import { useUserStore } from "@/stores/userStore";
import { senegalRegions, senegalDepartments } from "@/data/senegalData";

const desiredPositions = [
  { label: "Ouvrier agricole", value: "Ouvrier agricole" },
  { label: "Technicien agricole", value: "Technicien agricole" },
  { label: "Conducteur d'engins", value: "Conducteur d'engins" },
  { label: "Responsable de production", value: "Responsable de production" },
  { label: "Chef de culture", value: "Chef de culture" },
  { label: "Responsable d'élevage", value: "Responsable d'élevage" },
  { label: "Technicien horticole", value: "Technicien horticole" },
  { label: "Maraîcher", value: "Maraîcher" },
  { label: "Agent d'irrigation", value: "Agent d'irrigation" },
  { label: "Autre", value: "Autre" },
];

const educationLevels = [
  { label: "Sans diplôme", value: "Sans diplôme" },
  { label: "CFEE / Primaire", value: "CFEE / Primaire" },
  { label: "BFEM / Collège", value: "BFEM / Collège" },
  { label: "BAC", value: "BAC" },
  { label: "BTS / DUT", value: "BTS / DUT" },
  { label: "Licence", value: "Licence" },
  { label: "Master", value: "Master" },
  { label: "Ingénieur", value: "Ingénieur" },
  { label: "Doctorat", value: "Doctorat" },
  { label: "Formation professionnelle", value: "Formation professionnelle" },
];

export default function JobApplyScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const getJobById = useJobsStore((state) => state.getJobById);
  const submitApplication = useJobsStore((state) => state.submitApplication);
  const currentUser = useUserStore((state) => state.currentUser);

  const jobId = params.id as string;
  const job = getJobById(jobId);

  const [formData, setFormData] = useState<JobApplicationFormData>({
    firstName: currentUser?.firstName ?? "",
    lastName: currentUser?.lastName ?? "",
    address: "",
    region: "",
    department: "",
    phone: currentUser?.phone ?? "",
    email: currentUser?.email ?? "",
    education: "",
    experience: "",
    desiredPosition: "",
    salaryExpectation: "",
    coverLetter: "",
  });

  const [errors, setErrors] = useState<JobApplicationFormErrors>({
    firstName: "",
    lastName: "",
    address: "",
    region: "",
    department: "",
    phone: "",
    email: "",
    education: "",
    experience: "",
    desiredPosition: "",
    salaryExpectation: "",
  });

  const validate = (): boolean => {
    const newErrors: JobApplicationFormErrors = {
      firstName: "",
      lastName: "",
      address: "",
      region: "",
      department: "",
      phone: "",
      email: "",
      education: "",
      experience: "",
      desiredPosition: "",
      salaryExpectation: "",
    };
    let valid = true;

    if (!formData.firstName.trim()) {
      newErrors.firstName = "Le prénom est requis";
      valid = false;
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = "Le nom est requis";
      valid = false;
    }
    if (!formData.address.trim()) {
      newErrors.address = "L'adresse est requise";
      valid = false;
    }
    if (!formData.region) {
      newErrors.region = "La région est requise";
      valid = false;
    }
    if (!formData.department) {
      newErrors.department = "Le département est requis";
      valid = false;
    }
    if (!formData.phone.trim()) {
      newErrors.phone = "Le numéro de téléphone est requis";
      valid = false;
    }
    if (!formData.email.trim()) {
      newErrors.email = "L'adresse email est requise";
      valid = false;
    }
    if (!formData.education) {
      newErrors.education = "Le niveau d'études est requis";
      valid = false;
    }
    if (!formData.experience.trim()) {
      newErrors.experience = "L'expérience professionnelle est requise";
      valid = false;
    }
    if (!formData.desiredPosition) {
      newErrors.desiredPosition = "Le poste souhaité est requis";
      valid = false;
    }
    if (!formData.salaryExpectation.trim()) {
      newErrors.salaryExpectation = "Les prétentions salariales sont requises";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    submitApplication({
      jobId,
      applicantId: currentUser?.id,
      applicantName: `${formData.firstName} ${formData.lastName}`,
      applicantEmail: formData.email,
      applicantPhone: formData.phone,
      applicantAddress: formData.address,
      region: formData.region,
      department: formData.department,
      education: formData.education,
      experience: formData.experience,
      desiredPosition: formData.desiredPosition,
      salaryExpectation: formData.salaryExpectation,
      coverLetter: formData.coverLetter || undefined,
    });

    Alert.alert(
      "Candidature envoyée",
      "Votre candidature a été transmise au recruteur. Vous serez notifié dès qu'elle sera examinée.",
      [{ text: "OK", onPress: () => router.back() }],
    );
  };

  const setField = <K extends keyof JobApplicationFormData>(
    key: K,
    value: JobApplicationFormData[K],
  ) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    if (key in errors && errors[key as keyof JobApplicationFormErrors]) {
      setErrors((prev) => ({ ...prev, [key]: "" }));
    }
  };

  if (!job) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="bg-primary px-4 py-4">
          <View className="flex-row items-center">
            <TouchableOpacity onPress={() => router.back()} className="mr-3">
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <Text className="text-white text-lg font-bold">Candidature</Text>
          </View>
        </View>
        <View className="flex-1 justify-center items-center px-6">
          <Ionicons name="alert-circle-outline" size={64} color="#d1d5db" />
          <Text className="text-gray-500 text-center mt-4">
            Offre introuvable
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        {/* Header */}
        <View className="bg-primary px-4 py-4">
          <View className="flex-row items-center">
            <TouchableOpacity onPress={() => router.back()} className="mr-3">
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <View className="flex-1">
              <Text className="text-white text-lg font-bold">
                Formulaire de candidature
              </Text>
              <Text className="text-white/80 text-sm" numberOfLines={1}>
                {job.title} — {job.farmName}
              </Text>
            </View>
          </View>
        </View>

        <ScrollView className="flex-1 px-4 py-6">
          {/* Section: Informations personnelles */}
          <Text className="text-base font-bold text-gray-800 mb-4">
            Informations personnelles
          </Text>

          {/* First Name */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Prénom <Text className="text-red-500">*</Text>
            </Text>
            <TextInput
              className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-base"
              placeholder="Ex: Amadou"
              value={formData.firstName}
              onChangeText={(v) => setField("firstName", v)}
            />
            {!!errors.firstName && (
              <Text className="text-red-500 text-xs mt-1">
                {errors.firstName}
              </Text>
            )}
          </View>

          {/* Last Name */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Nom <Text className="text-red-500">*</Text>
            </Text>
            <TextInput
              className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-base"
              placeholder="Ex: Diallo"
              value={formData.lastName}
              onChangeText={(v) => setField("lastName", v)}
            />
            {!!errors.lastName && (
              <Text className="text-red-500 text-xs mt-1">
                {errors.lastName}
              </Text>
            )}
          </View>

          {/* Address */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Adresse complète <Text className="text-red-500">*</Text>
            </Text>
            <TextInput
              className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-base"
              placeholder="Ex: Quartier Liberté 6, Dakar"
              value={formData.address}
              onChangeText={(v) => setField("address", v)}
            />
            {!!errors.address && (
              <Text className="text-red-500 text-xs mt-1">
                {errors.address}
              </Text>
            )}
          </View>

          {/* Region */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Région <Text className="text-red-500">*</Text>
            </Text>
            <View className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">
              <Picker
                selectedValue={formData.region}
                onValueChange={(v) => {
                  setField("region", v);
                  setField("department", "");
                }}
              >
                <Picker.Item label="Sélectionnez une région" value="" />
                {senegalRegions.map((r) => (
                  <Picker.Item key={r.value} label={r.label} value={r.value} />
                ))}
              </Picker>
            </View>
            {!!errors.region && (
              <Text className="text-red-500 text-xs mt-1">{errors.region}</Text>
            )}
          </View>

          {/* Department */}
          {formData.region ? (
            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Département <Text className="text-red-500">*</Text>
              </Text>
              <View className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">
                <Picker
                  selectedValue={formData.department}
                  onValueChange={(v) => setField("department", v)}
                >
                  <Picker.Item label="Sélectionnez un département" value="" />
                  {(senegalDepartments[formData.region] ?? []).map((d) => (
                    <Picker.Item
                      key={d.value}
                      label={d.label}
                      value={d.value}
                    />
                  ))}
                </Picker>
              </View>
              {!!errors.department && (
                <Text className="text-red-500 text-xs mt-1">
                  {errors.department}
                </Text>
              )}
            </View>
          ) : null}

          {/* Phone */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Téléphone <Text className="text-red-500">*</Text>
            </Text>
            <TextInput
              className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-base"
              placeholder="Ex: 77 123 45 67"
              value={formData.phone}
              onChangeText={(v) => setField("phone", v)}
              keyboardType="phone-pad"
            />
            {!!errors.phone && (
              <Text className="text-red-500 text-xs mt-1">{errors.phone}</Text>
            )}
          </View>

          {/* Email */}
          <View className="mb-6">
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Email <Text className="text-red-500">*</Text>
            </Text>
            <TextInput
              className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-base"
              placeholder="Ex: amadou@example.com"
              value={formData.email}
              onChangeText={(v) => setField("email", v)}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {!!errors.email && (
              <Text className="text-red-500 text-xs mt-1">{errors.email}</Text>
            )}
          </View>

          {/* Section: Profil professionnel */}
          <Text className="text-base font-bold text-gray-800 mb-4">
            Profil professionnel
          </Text>

          {/* Education */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Niveau d&apos;études <Text className="text-red-500">*</Text>
            </Text>
            <View className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">
              <Picker
                selectedValue={formData.education}
                onValueChange={(v) => setField("education", v)}
              >
                <Picker.Item
                  label="Sélectionnez votre niveau d'études"
                  value=""
                />
                {educationLevels.map((e) => (
                  <Picker.Item key={e.value} label={e.label} value={e.value} />
                ))}
              </Picker>
            </View>
            {!!errors.education && (
              <Text className="text-red-500 text-xs mt-1">
                {errors.education}
              </Text>
            )}
          </View>

          {/* Experience */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Expérience professionnelle <Text className="text-red-500">*</Text>
            </Text>
            <TextInput
              className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-base"
              placeholder="Ex: 3 ans en maraîchage, conduite de tracteur..."
              value={formData.experience}
              onChangeText={(v) => setField("experience", v)}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
            {!!errors.experience && (
              <Text className="text-red-500 text-xs mt-1">
                {errors.experience}
              </Text>
            )}
          </View>

          {/* Desired Position */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Poste souhaité <Text className="text-red-500">*</Text>
            </Text>
            <View className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">
              <Picker
                selectedValue={formData.desiredPosition}
                onValueChange={(v) => setField("desiredPosition", v)}
              >
                <Picker.Item label="Sélectionnez un poste" value="" />
                {desiredPositions.map((p) => (
                  <Picker.Item key={p.value} label={p.label} value={p.value} />
                ))}
              </Picker>
            </View>
            {!!errors.desiredPosition && (
              <Text className="text-red-500 text-xs mt-1">
                {errors.desiredPosition}
              </Text>
            )}
          </View>

          {/* Salary Expectation */}
          <View className="mb-6">
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Prétentions salariales <Text className="text-red-500">*</Text>
            </Text>
            <TextInput
              className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-base"
              placeholder="Ex: 200 000 FCFA/mois"
              value={formData.salaryExpectation}
              onChangeText={(v) => setField("salaryExpectation", v)}
            />
            {!!errors.salaryExpectation && (
              <Text className="text-red-500 text-xs mt-1">
                {errors.salaryExpectation}
              </Text>
            )}
          </View>

          {/* Section: Lettre de motivation */}
          <Text className="text-base font-bold text-gray-800 mb-4">
            Lettre de motivation{" "}
            <Text className="text-gray-400 text-sm font-normal">
              (facultatif)
            </Text>
          </Text>

          <View className="mb-8">
            <TextInput
              className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-base"
              placeholder="Présentez-vous brièvement et expliquez pourquoi vous postulez à ce poste..."
              value={formData.coverLetter}
              onChangeText={(v) => setField("coverLetter", v)}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />
          </View>
        </ScrollView>

        {/* Submit */}
        <View className="px-4 py-4 bg-white border-t border-gray-200">
          <TouchableOpacity
            onPress={handleSubmit}
            className="bg-primary rounded-xl py-4 flex-row items-center justify-center"
          >
            <Ionicons name="send" size={20} color="white" />
            <Text className="text-white text-lg font-bold ml-2">
              Envoyer ma candidature
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
