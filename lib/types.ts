export interface MenuItem {
  name: string;
  description?: string;
  price: string;
  soldOut?: boolean;
}

export interface ParsedMenu {
  soup: string | null;
  soupPrice: string | null;
  mains: MenuItem[];
}

export interface WidgetConfig {
  // Schedule
  showFrom: string;       // "HH:MM" 24h, e.g. "11:00"
  showUntil: string;      // "HH:MM" 24h, e.g. "15:00"
  // Appearance
  theme: "light" | "dark" | "branded";
  fabPosition: "bottom-right" | "bottom-left";
  fabLabel: string;
  fabColor: string;       // hex
  modalBg: string;        // hex
  modalAccent: string;    // hex — used for left border, soup line, etc.
  modalText: string;      // hex
  borderRadius: "sharp" | "rounded" | "pill";
  // Behaviour
  autoOpen: boolean;           // open the panel automatically on page load
  displayMode: "corner" | "modal"; // corner = above FAB; modal = centered overlay
  // Localisation
  currency: string;            // suffix appended to prices, e.g. "Kč", "€", "$"
  // Panel header
  modalTitle: string;          // custom label shown at the top of the menu panel
  priceColor: string;          // hex — color used for prices (defaults to accent)
}

export const DEFAULT_WIDGET_CONFIG: WidgetConfig = {
  showFrom: "00:00",
  showUntil: "23:59",
  theme: "light",
  fabPosition: "bottom-right",
  fabLabel: "Today's Menu",
  fabColor: "#6366f1",
  modalBg: "#ffffff",
  modalAccent: "#6366f1",
  modalText: "#111111",
  borderRadius: "rounded",
  autoOpen: false,
  displayMode: "corner",
  currency: "",
  modalTitle: "",
  priceColor: "",
};

export interface WidgetData {
  restaurant: {
    name: string;
    brandingColor: string;
    logoUrl: string | null;
  };
  menu: {
    id: string;
    soup: string | null;
    soupPrice: string | null;
    mains: MenuItem[];
  } | null;
  announcement: {
    text: string;
    bgColor: string;
    textColor: string;
  } | null;
  widgetConfig: WidgetConfig;
}
