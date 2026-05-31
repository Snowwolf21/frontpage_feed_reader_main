import Link from "next/link";

export const Footer = () => {
  return (
    <footer className="mt-24 p-8 border-t border-zinc-900 bg-zinc-800">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="text-zinc-400 dark:text-zinc-600 text-sm">
          © 2026 Frontpage. Crafted with care for the web.
        </div>
        <div className="flex gap-8">
          <Link href="#" className="text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">Privacy</Link>
          <Link href="#" className="text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">Terms</Link>
          <Link href="#" className="text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">Twitter</Link>
        </div>
      </div>
    </footer>
  );
};
