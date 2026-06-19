"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { site } from "@/data/site";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { isStreamOpen, streamDeadline } from "@/lib/types";
import * as I from "@/components/icons";

type StreamRow = {
  id: string;
  title: string;
  stream_date: string;
  ended_at: string;
};

export default function StreamsPage() {
  const [streams, setStreams] = useState<StreamRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/streams")
      .then((r) => r.json())
      .then((j) => setStreams(j.streams ?? []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <section className="relative overflow-hidden py-16 sm:py-20">
        <Image src="/images/streams-bg.png" alt="" fill className="object-cover" sizes="100vw" />
        <div className="absolute inset-0 bg-ink/80" />
        <div className="container-site relative">
          <Breadcrumbs items={[{ label: "Стримы" }]} light />
          <h1 className="mt-6 h-display text-3xl text-pearl sm:text-4xl">Стримы SonyShopKorea</h1>
          <p className="mt-3 max-w-xl text-paper/70">
            Товары с прямых эфиров. Заказ доступен 24 часа после окончания стрима.
          </p>
          <div className="mt-6 flex gap-3">
            <a href={site.contacts.tiktokLink} target="_blank" rel="noreferrer" className="btn-accent">TikTok</a>
            <a href={site.contacts.telegramLink} target="_blank" rel="noreferrer" className="btn-light">Telegram</a>
          </div>
        </div>
      </section>

      <div className="container-site py-10">
        {loading ? (
          <p className="text-muted">Загрузка…</p>
        ) : streams.length === 0 ? (
          <div className="card py-16 text-center">
            <p className="text-lg font-medium text-ink">Стримов пока нет</p>
            <p className="mt-2 text-muted">Следите за анонсами в TikTok и Telegram</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {streams.map((s) => {
              const open = isStreamOpen(s.ended_at);
              const deadline = streamDeadline(s.ended_at);
              return (
                <Link key={s.id} href={`/streams/${s.id}`} className="card group overflow-hidden transition-all hover:shadow-lift">
                  <div className="relative h-32 bg-ink">
                    <Image src="/images/streams-bg.png" alt="" fill className="object-cover opacity-60" sizes="400px" />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink to-transparent" />
                    <span className={`absolute left-4 top-4 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${open ? "bg-success/90 text-white" : "bg-muted/90 text-white"}`}>
                      {open ? "Открыт" : "Закрыт"}
                    </span>
                  </div>
                  <div className="p-5">
                    <p className="text-xs text-faint">{new Date(s.stream_date).toLocaleDateString("ru-RU")}</p>
                    <h2 className="mt-1 font-display text-xl font-semibold text-ink group-hover:text-accent">{s.title}</h2>
                    {open && (
                      <p className="mt-2 flex items-center gap-1.5 text-xs text-accent">
                        <I.Clock size={14} />
                        До {deadline.toLocaleString("ru-RU", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
                      </p>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
