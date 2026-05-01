import { useCallback, useState } from "react";
import * as Location from "expo-location";

export type LocationErrorCode =
  | "permission_denied"
  | "services_disabled"
  | "timeout"
  | "unavailable"
  | "unknown";

export interface DeviceLocationError {
  code: LocationErrorCode;
  message: string;
}

export interface DeviceCoordinates {
  longitude: number;
  latitude: number;
}

const ERROR_MESSAGES: Record<LocationErrorCode, string> = {
  permission_denied:
    "Permission de localisation refusée. Activez-la dans les réglages.",
  services_disabled: "Activez le GPS de votre appareil pour continuer.",
  timeout: "Position introuvable. Vérifiez votre signal GPS.",
  unavailable: "Service de localisation indisponible.",
  unknown: "Impossible d'obtenir votre position. Réessayez.",
};

export function useDeviceLocation() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<DeviceLocationError | null>(null);

  const requestLocation =
    useCallback(async (): Promise<DeviceCoordinates | null> => {
      setLoading(true);
      setError(null);
      try {
        const servicesEnabled = await Location.hasServicesEnabledAsync();
        if (!servicesEnabled) {
          setError({
            code: "services_disabled",
            message: ERROR_MESSAGES.services_disabled,
          });
          return null;
        }

        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== Location.PermissionStatus.GRANTED) {
          setError({
            code: "permission_denied",
            message: ERROR_MESSAGES.permission_denied,
          });
          return null;
        }

        const position = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });

        return {
          longitude: position.coords.longitude,
          latitude: position.coords.latitude,
        };
      } catch (err) {
        const message = err instanceof Error ? err.message : "";
        const code: LocationErrorCode = message.toLowerCase().includes("time")
          ? "timeout"
          : "unknown";
        setError({ code, message: ERROR_MESSAGES[code] });
        return null;
      } finally {
        setLoading(false);
      }
    }, []);

  const reset = useCallback(() => setError(null), []);

  return { loading, error, requestLocation, reset };
}
