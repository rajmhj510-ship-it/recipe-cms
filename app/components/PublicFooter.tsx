export default function PublicFooter() {
  return (
    <footer className="print:hidden border-t border-gray-200 bg-gray-950 px-4 py-12 text-gray-400 sm:px-6 sm:py-14 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
        <div>
          <img src="/logo.png" alt="Recipe CMS" className="h-12 w-12 rounded-xl object-cover shadow-sm" />
          <p className="mt-2 text-sm">Delicious recipes made simple.</p>
        </div>
        <p className="text-sm">© 2026 Recipe CMS. All rights reserved.</p>
      </div>
    </footer>
  );
}
