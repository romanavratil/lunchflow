"use client";
import { useRestaurant } from "../_components/shell";
import { WidgetSection } from "../_components/sections/widget";

export default function WidgetPage() {
  const { id, name } = useRestaurant();
  return <WidgetSection restaurantId={id} restaurantName={name} />;
}
