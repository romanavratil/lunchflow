"use client";
import { useRestaurant } from "../_components/shell";
import { AnnounceSection } from "../_components/sections/announce";

export default function AnnouncementPage() {
  const { id } = useRestaurant();
  return <AnnounceSection restaurantId={id} />;
}
