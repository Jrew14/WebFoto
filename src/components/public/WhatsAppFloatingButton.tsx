import { MessageCircle } from "lucide-react";

const WHATSAPP_URL = "https://wa.me/6285287229898";

export function WhatsAppFloatingButton() {
  return (
    <a
      href={WHATSAPP_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 inline-flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-3 text-sm font-semibold text-white shadow-lg transition-transform hover:scale-105 hover:shadow-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#128C7E]"
      aria-label="Hubungi admin via WhatsApp"
    >
      <MessageCircle className="h-5 w-5" />
      <span>WhatsApp Admin</span>
    </a>
  );
}
