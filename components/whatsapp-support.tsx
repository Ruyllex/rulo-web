"use client";

import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function WhatsAppSupport() {
  const handleWhatsApp = () => {
    const phoneNumber = "5491130652655"; 
    const message = encodeURIComponent(
      "Hola, necesito ayuda con la plataforma de streaming"
    );
    
    window.open(
      `https://wa.me/${phoneNumber}?text=${message}`,
      "_blank"
    );
  };

  return (
    <Button
      onClick={handleWhatsApp}
      className="fixed bottom-6 right-6 rounded-full h-14 w-14 shadow-lg hover:scale-110 transition-transform z-50"
      size="icon"
    >
      <MessageCircle className="h-6 w-6" />
    </Button>
  );
}