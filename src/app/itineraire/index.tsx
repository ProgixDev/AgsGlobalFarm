import { type Href, Redirect } from "expo-router";

export default function ItineraryIndexScreen() {
  return <Redirect href={"/itineraire/generator" as Href} />;
}
