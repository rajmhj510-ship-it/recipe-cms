export default function PublicFooter() {
  return (
    <footer className="border-t border-gray-200 bg-gray-950 px-4 py-10 text-gray-400 sm:px-6 sm:py-12 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
        <div>
          <p className="text-xl font-extrabold text-white">
            Recipe<span className="text-orange-500">CMS</span>
          </p>
          <p className="mt-2 text-sm">Delicious recipes made simple.</p>
        </div>
        <p className="text-sm">© 2026 Recipe CMS. All rights reserved.</p>
      </div>
    </footer>
  );
}
