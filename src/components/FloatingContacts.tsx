"use client";

import { useState } from "react";
import { site } from "@/data/site";
import * as I from "./icons";

export function FloatingContacts() {
  const [open, setOpen] = useState(false);
  return (
    <div className="fixed bottom-4 right-4 z-40 flex flex-col items-end gap-3 pb-[env(safe-area-inset-bottom)] pr-[env(safe-area-inset-right)] sm:bottom-5 sm:right-5">
      {open && (
        <div className="flex flex-col items-end gap-2 animate-fadeUp">
          <ContactBtn href={site.contacts.whatsappLink} label="WhatsApp" tone="bg-[#25D366]">
            <I.Whatsapp size={20} />
          </ContactBtn>
          <ContactBtn href={site.contacts.telegramLink} label="Telegram" tone="bg-[#2AABEE]">
            <I.Telegram size={20} />
          </ContactBtn>
          <ContactBtn href={`mailto:${site.contacts.email}`} label="Email" tone="bg-ink">
            <I.Mail size={20} />
          </ContactBtn>
        </div>
      )}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Связаться с менеджером"
        className="flex h-12 w-12 items-center justify-center rounded-full bg-ink text-pearl shadow-lift transition-transform hover:scale-105 active:scale-95 sm:h-14 sm:w-14"
      >
        {open ? <I.Close size={22} /> : <I.Phone size={22} />}
      </button>
    </div>
  );
}

function ContactBtn({
  href,
  label,
  tone,
  children,
}: {
  href: string;
  label: string;
  tone: string;
  children: React.ReactNode;
}) {
  return (
    <a href={href} target="_blank" rel="noreferrer" className="group flex items-center gap-2">
      <span className="rounded-full bg-ink px-3 py-1.5 text-xs font-medium text-pearl opacity-0 transition-opacity group-hover:opacity-100">
        {label}
      </span>
      <span className={`flex h-11 w-11 items-center justify-center rounded-full text-white shadow-soft ${tone}`}>
        {children}
      </span>
    </a>
  );
}
