"use client";
import { useRestaurant } from "../_components/shell";
import { MenuSection } from "../_components/sections/menu";

export default function MenuPage() {
  const { id, name } = useRestaurant();
  return <MenuSection restaurantId={id} restaurantName={name} />;
}
