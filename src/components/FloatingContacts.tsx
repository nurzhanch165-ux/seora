"use client";

import { useState } from "react";
import { site } from "@/data/site";
import * as I from "./icons";

export function FloatingContacts() {
  const [open, setOpen] = useState(false);
  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-3">
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
        className="flex h-14 w-14 items-center justify-center rounded-full bg-accent text-white shadow-lift transition-transform hover:scale-105 active:scale-95"
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
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="group flex items-center gap-2"
    >
      <span className="rounded-full bg-ink px-3 py-1.5 text-xs font-medium text-paper opacity-0 transition-opacity group-hover:opacity-100">
        {label}
      </span>
      <span className={`flex h-12 w-12 items-center justify-center rounded-full text-white shadow-soft ${tone}`}>
        {children}
      </span>
    </a>
  );
}
