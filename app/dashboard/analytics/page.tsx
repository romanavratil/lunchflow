"use client";
import { useRestaurant } from "../_components/shell";
import { AnalyticsSection } from "../_components/sections/analytics";

export default function AnalyticsPage() {
  const { id } = useRestaurant();
  return <AnalyticsSection restaurantId={id} />;
}
