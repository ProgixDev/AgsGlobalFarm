import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  Platform,
  Alert,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useJobsStore } from "@/stores/jobsStore";
import {
  senegalRegions,
  senegalDepartments,
  contractTypes,
} from "@/data/senegalData";
import { AnimatedPressable } from "@/components/animated";
import { haptic } from "@/utils/haptics";
import { colors } from "@/theme/colors";
import ScreenHeader from "@/components/ui/ScreenHeader";
import { TAB_BAR_HEIGHT } from "@/components/ui/FloatingTabBar";

export default function JobPostScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const createJob = useJobsStore((state) => state.createJob);
  const updateJob = useJobsStore((state) => state.updateJob);
  const getJobById = useJobsStore((state) => state.getJobById);

  const jobId = params.id as string | undefined;
  const isEditing = !!jobId;

  // Job form state
  const [jobFormData, setJobFormData] = useState<JobPostingFormData>({
    title: "",
    farmName: "",
    location: "",
    region: "",
    department: "",
    contractType: "",
    salaryRange: "",
    description: "",
    requirements: "",
  });

  const [jobFormErrors, setJobFormErrors] = useState<JobPostingFormErrors>({
    title: "",
    farmName: "",
    location: "",
    region: "",
    department: "",
    contractType: "",
    salaryRange: "",
    description: "",
    requirements: "",
  });

  // Load job data if editing
  useEffect(() => {
    if (isEditing && jobId) {
      const job = getJobById(jobId);
      if (job) {
        setJobFormData({
          title: job.title,
          farmName: job.farmName,
          location: job.location,
          region: job.region,
          department: job.department,
          contractType: job.contractType,
          salaryRange: job.salaryRange,
          description: job.description,
          requirements: job.requirements.join("\n"),
        });
      }
    }
  }, [jobId, isEditing, getJobById]);

  // Validate form
  const validateForm = (): boolean => {
    const errors: JobPostingFormErrors = {
      title: "",
      farmName: "",
      location: "",
      region: "",
      department: "",
      contractType: "",
      salaryRange: "",
      description: "",
      requirements: "",
    };

    let isValid = true;

    if (!jobFormData.title.trim()) {
      errors.title = "Le titre est requis";
      isValid = false;
    }

    if (!jobFormData.farmName.trim()) {
      errors.farmName = "Le nom de la ferme est requis";
      isValid = false;
    }

    if (!jobFormData.location.trim()) {
      errors.location = "La localisation est requise";
      isValid = false;
    }

    if (!jobFormData.region) {
      errors.region = "La région est requise";
      isValid = false;
    }

    if (!jobFormData.department) {
      errors.department = "Le département est requis";
      isValid = false;
    }

    if (!jobFormData.contractType) {
      errors.contractType = "Le type de contrat est requis";
      isValid = false;
    }

    if (!jobFormData.salaryRange.trim()) {
      errors.salaryRange = "Le salaire est requis";
      isValid = false;
    }

    if (!jobFormData.description.trim()) {
      errors.description = "La description est requise";
      isValid = false;
    }

    if (!jobFormData.requirements.trim()) {
      errors.requirements = "Les exigences sont requises";
      isValid = false;
    }

    setJobFormErrors(errors);
    return isValid;
  };

  // Handle submit
  const handleSubmit = () => {
    if (!validateForm()) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs requis");
      return;
    }

    const requirementsArray = jobFormData.requirements
      .split("\n")
      .filter((r) => r.trim() !== "");

    if (isEditing && jobId) {
      updateJob(jobId, {
        title: jobFormData.title,
        farmName: jobFormData.farmName,
        location: jobFormData.location,
        region: jobFormData.region,
        department: jobFormData.department,
        contractType: jobFormData.contractType as any,
        salaryRange: jobFormData.salaryRange,
        description: jobFormData.description,
        requirements: requirementsArray,
      });
    } else {
      createJob({
        title: jobFormData.title,
        farmName: jobFormData.farmName,
        location: jobFormData.location,
        region: jobFormData.region,
        department: jobFormData.department,
        contractType: jobFormData.contractType as any,
        salaryRange: jobFormData.salaryRange,
        description: jobFormData.description,
        requirements: requirementsArray,
      });
    }

    haptic.success();
    router.back();
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAwareScrollView bottomOffset={20} className="flex-1">
        {/* Header */}
        <ScreenHeader
          title={isEditing ? "Modifier l'offre" : "Publier une offre"}
          showBack
        />

        <ScrollView
          className="flex-1 px-4 py-6"
          contentContainerStyle={{ paddingBottom: TAB_BAR_HEIGHT }}
        >
          {/* Title */}
          <View className="mb-4">
            <Text className="text-sm font-sans-medium text-gray-700 mb-2">
              Titre du poste <Text className="text-red-500">*</Text>
            </Text>
            <TextInput
              className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-base"
              placeholder="Ex: Ouvrier Agricole"
              value={jobFormData.title}
              onChangeText={(text) => {
                setJobFormData({ ...jobFormData, title: text });
                if (jobFormErrors.title)
                  setJobFormErrors({ ...jobFormErrors, title: "" });
              }}
            />
            {jobFormErrors.title ? (
              <Text className="text-red-500 text-xs font-sans mt-1">
                {jobFormErrors.title}
              </Text>
            ) : null}
          </View>

          {/* Farm Name */}
          <View className="mb-4">
            <Text className="text-sm font-sans-medium text-gray-700 mb-2">
              Nom de la ferme/entreprise <Text className="text-red-500">*</Text>
            </Text>
            <TextInput
              className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-base"
              placeholder="Ex: Ferme Bio Thiès"
              value={jobFormData.farmName}
              onChangeText={(text) => {
                setJobFormData({ ...jobFormData, farmName: text });
                if (jobFormErrors.farmName)
                  setJobFormErrors({ ...jobFormErrors, farmName: "" });
              }}
            />
            {jobFormErrors.farmName ? (
              <Text className="text-red-500 text-xs font-sans mt-1">
                {jobFormErrors.farmName}
              </Text>
            ) : null}
          </View>

          {/* Region */}
          <View className="mb-4">
            <Text className="text-sm font-sans-medium text-gray-700 mb-2">
              Région <Text className="text-red-500">*</Text>
            </Text>
            <View className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">
              <Picker
                selectedValue={jobFormData.region}
                onValueChange={(value) => {
                  setJobFormData({
                    ...jobFormData,
                    region: value,
                    department: "",
                  });
                  if (jobFormErrors.region)
                    setJobFormErrors({ ...jobFormErrors, region: "" });
                }}
                style={{
                  height: Platform.OS === "ios" ? 180 : 50,
                  color: colors.black,
                }}
              >
                <Picker.Item
                  label="Sélectionnez une région"
                  value=""
                  color={colors.placeholder}
                />
                {senegalRegions.map((region) => (
                  <Picker.Item
                    key={region.value}
                    label={region.label}
                    value={region.value}
                  />
                ))}
              </Picker>
            </View>
            {jobFormErrors.region ? (
              <Text className="text-red-500 text-xs font-sans mt-1">
                {jobFormErrors.region}
              </Text>
            ) : null}
          </View>

          {/* Department */}
          {jobFormData.region && (
            <View className="mb-4">
              <Text className="text-sm font-sans-medium text-gray-700 mb-2">
                Département <Text className="text-red-500">*</Text>
              </Text>
              <View className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">
                <Picker
                  selectedValue={jobFormData.department}
                  onValueChange={(value) => {
                    setJobFormData({ ...jobFormData, department: value });
                    if (jobFormErrors.department)
                      setJobFormErrors({ ...jobFormErrors, department: "" });
                  }}
                  style={{
                    height: Platform.OS === "ios" ? 180 : 50,
                    color: colors.black,
                  }}
                >
                  <Picker.Item
                    label="Sélectionnez un département"
                    value=""
                    color={colors.placeholder}
                  />
                  {senegalDepartments[jobFormData.region]?.map((dept) => (
                    <Picker.Item
                      key={dept.value}
                      label={dept.label}
                      value={dept.value}
                    />
                  ))}
                </Picker>
              </View>
              {jobFormErrors.department ? (
                <Text className="text-red-500 text-xs font-sans mt-1">
                  {jobFormErrors.department}
                </Text>
              ) : null}
            </View>
          )}

          {/* Location */}
          <View className="mb-4">
            <Text className="text-sm font-sans-medium text-gray-700 mb-2">
              Localité précise <Text className="text-red-500">*</Text>
            </Text>
            <TextInput
              className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-base"
              placeholder="Ex: Thiès"
              value={jobFormData.location}
              onChangeText={(text) => {
                setJobFormData({ ...jobFormData, location: text });
                if (jobFormErrors.location)
                  setJobFormErrors({ ...jobFormErrors, location: "" });
              }}
            />
            {jobFormErrors.location ? (
              <Text className="text-red-500 text-xs font-sans mt-1">
                {jobFormErrors.location}
              </Text>
            ) : null}
          </View>

          {/* Contract Type */}
          <View className="mb-4">
            <Text className="text-sm font-sans-medium text-gray-700 mb-2">
              Type de contrat <Text className="text-red-500">*</Text>
            </Text>
            <View className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">
              <Picker
                selectedValue={jobFormData.contractType}
                onValueChange={(value) => {
                  setJobFormData({ ...jobFormData, contractType: value });
                  if (jobFormErrors.contractType)
                    setJobFormErrors({ ...jobFormErrors, contractType: "" });
                }}
                style={{
                  height: Platform.OS === "ios" ? 180 : 50,
                  color: colors.black,
                }}
              >
                <Picker.Item
                  label="Sélectionnez un type de contrat"
                  value=""
                  color={colors.placeholder}
                />
                {contractTypes.map((type) => (
                  <Picker.Item
                    key={type.value}
                    label={type.label}
                    value={type.value}
                  />
                ))}
              </Picker>
            </View>
            {jobFormErrors.contractType ? (
              <Text className="text-red-500 text-xs font-sans mt-1">
                {jobFormErrors.contractType}
              </Text>
            ) : null}
          </View>

          {/* Salary Range */}
          <View className="mb-4">
            <Text className="text-sm font-sans-medium text-gray-700 mb-2">
              Salaire proposé <Text className="text-red-500">*</Text>
            </Text>
            <TextInput
              className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-base"
              placeholder="Ex: 150 000 - 200 000 FCFA/mois"
              value={jobFormData.salaryRange}
              onChangeText={(text) => {
                setJobFormData({ ...jobFormData, salaryRange: text });
                if (jobFormErrors.salaryRange)
                  setJobFormErrors({ ...jobFormErrors, salaryRange: "" });
              }}
            />
            {jobFormErrors.salaryRange ? (
              <Text className="text-red-500 text-xs font-sans mt-1">
                {jobFormErrors.salaryRange}
              </Text>
            ) : null}
          </View>

          {/* Description */}
          <View className="mb-4">
            <Text className="text-sm font-sans-medium text-gray-700 mb-2">
              Description du poste <Text className="text-red-500">*</Text>
            </Text>
            <TextInput
              className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-base"
              placeholder="Décrivez le poste en détail..."
              value={jobFormData.description}
              onChangeText={(text) => {
                setJobFormData({ ...jobFormData, description: text });
                if (jobFormErrors.description)
                  setJobFormErrors({ ...jobFormErrors, description: "" });
              }}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
            {jobFormErrors.description ? (
              <Text className="text-red-500 text-xs font-sans mt-1">
                {jobFormErrors.description}
              </Text>
            ) : null}
          </View>

          {/* Requirements */}
          <View className="mb-4">
            <Text className="text-sm font-sans-medium text-gray-700 mb-2">
              Exigences du poste <Text className="text-red-500">*</Text>
            </Text>
            <Text className="text-xs font-sans text-gray-500 mb-2">
              Séparez chaque exigence par une nouvelle ligne
            </Text>
            <TextInput
              className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-base"
              placeholder="Ex:&#10;Expérience de 2 ans minimum&#10;Permis de conduire&#10;Disponibilité immédiate"
              value={jobFormData.requirements}
              onChangeText={(text) => {
                setJobFormData({ ...jobFormData, requirements: text });
                if (jobFormErrors.requirements)
                  setJobFormErrors({ ...jobFormErrors, requirements: "" });
              }}
              multiline
              numberOfLines={5}
              textAlignVertical="top"
            />
            {jobFormErrors.requirements ? (
              <Text className="text-red-500 text-xs font-sans mt-1">
                {jobFormErrors.requirements}
              </Text>
            ) : null}
          </View>
        </ScrollView>

        {/* Submit Button */}
        <View className="px-4 py-4 bg-white border-t border-gray-200">
          <AnimatedPressable
            onPress={handleSubmit}
            className="bg-primary rounded-xl py-4 flex-row items-center justify-center"
          >
            <Ionicons name="checkmark-circle" size={20} color="white" />
            <Text className="text-white text-lg font-sans-bold ml-2">
              {isEditing ? "Enregistrer les modifications" : "Publier l'offre"}
            </Text>
          </AnimatedPressable>
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}
