import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-site flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <span className="font-serif text-7xl font-light text-accent">404</span>
      <h1 className="mt-4 h-display text-2xl">Страница не найдена</h1>
      <p className="mt-2 max-w-sm text-muted">Возможно, ссылка устарела или товар больше недоступен.</p>
      <div className="mt-6 flex gap-3">
        <Link href="/" className="btn-primary">На главную</Link>
        <Link href="/c/cosmetics" className="btn-outline">В каталог</Link>
      </div>
    </div>
  );
}
