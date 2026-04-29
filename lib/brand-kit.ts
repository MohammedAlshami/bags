/**
 * Queen Gold Beauty — design tokens (single source of truth for non-Tailwind usage)
 * Mirror in app/globals.css @theme for utility classes
 */
export const QGB = {
  color: {
    primary: "#B63A6B",
    accent: "#E67FA6",
    light: "#F2C6D6",
    dark: "#99284F",
    white: "#FFFFFF",
    textBody: "#444444",
    textCaption: "#AAAAAA",
    textTitle: "#222222",
    textOldPrice: "#CCCCCC",
  },
  radius: {
    card: "14px",
    button: "9999px",
    input: "8px",
    image: "12px",
    badge: "9999px",
  },
} as const;

/** Ticker copy for the top offers bar (edit as needed) */
export const QGB_OFFERS = [
  "عروض رمضان: خصم حتى 20٪ على مختارات العناية",
  "شحن مجاني للطلبات فوق 199 ر.س",
  "فرع اليمن — توصيل سريع",
] as const;

export type QgbColor = (typeof QGB.color)[keyof typeof QGB.color];
