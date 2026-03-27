"use client";
import { useRestaurant } from "../_components/shell";
import { SettingsSection } from "../_components/sections/settings";

export default function SettingsPage() {
  const { id, name, brandingColor } = useRestaurant();
  return <SettingsSection restaurantId={id} restaurantName={name} brandingColor={brandingColor} />;
}
