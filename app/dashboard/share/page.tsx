"use client";
import { useRestaurant } from "../_components/shell";
import { ShareSection } from "../_components/sections/share";

export default function SharePage() {
  const { id, name, brandingColor } = useRestaurant();
  return <ShareSection restaurantId={id} restaurantName={name} brandingColor={brandingColor} />;
}
