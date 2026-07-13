import Link from "next/link";

export const Footer = () => {
  return (
    <footer className="mt-24 p-8 border-t border-zinc-900 bg-slate-900">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="text-zinc-400 dark:text-zinc-600 text-sm font-semibold tracking-tight">
          © 2026 Frontpage. Crafted with care for the web.
        </div>
        <div className="flex gap-8 text-sm font-semibold tracking-tight">
          <Link href="#" className="text-slate-100 dark:text-slate-600 hover:text-slate-200 dark:hover:text-slate-500 transition-colors">Privacy</Link>
          <Link href="#" className="text-slate-100 dark:text-slate-600 hover:text-slate-200 dark:hover:text-slate-500 transition-colors">Terms</Link>
          <Link href="#" className="text-slate-100 dark:text-slate-600 hover:text-slate-200 dark:hover:text-slate-500 transition-colors">Twitter</Link>
        </div>
      </div>
    </footer>
  );
};
