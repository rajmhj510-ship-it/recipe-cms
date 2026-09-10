const recipes = [
  {
    name: "Creamy Garlic Pasta",
    category: "Dinner",
    description: "Creamy, comforting pasta with garlic and parmesan.",
    image:
      "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Classic Chicken Curry",
    category: "Dinner",
    description: "A flavorful chicken curry packed with warm spices.",
    image:
      "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Fresh Garden Salad",
    category: "Healthy",
    description: "Fresh vegetables tossed together for a light meal.",
    image:
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=900&q=80",
  },
];

const categories = [
  { name: "Breakfast", icon: "🍳" },
  { name: "Lunch", icon: "🥗" },
  { name: "Dinner", icon: "🍝" },
  { name: "Desserts", icon: "🍰" },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <a href="#" className="text-2xl font-bold tracking-tight">
            Recipe<span className="text-orange-600">CMS</span>
          </a>

          <nav className="hidden items-center gap-8 md:flex">
            <a
              href="#"
              className="font-medium text-orange-600"
            >
              Home
            </a>

            <a
              href="#recipes"
              className="font-medium text-gray-600 transition hover:text-orange-600"
            >
              Recipes
            </a>

            <a
              href="#categories"
              className="font-medium text-gray-600 transition hover:text-orange-600"
            >
              Categories
            </a>

            <a
              href="#blog"
              className="font-medium text-gray-600 transition hover:text-orange-600"
            >
              Blog
            </a>
          </nav>

          <button className="rounded-full bg-orange-600 px-5 py-2.5 font-semibold text-white transition hover:bg-orange-700">
            Admin
          </button>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-orange-50">
        <div className="mx-auto max-w-7xl px-6 py-24 text-center">
          <p className="mb-4 text-sm font-bold uppercase tracking-[0.25em] text-orange-600">
            Welcome to Recipe CMS
          </p>

          <h1 className="mx-auto max-w-4xl text-5xl font-bold leading-tight tracking-tight md:text-6xl">
            Discover delicious recipes for every occasion
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-gray-600">
            Find simple, delicious recipes and discover your next favorite
            meal.
          </p>

          {/* Search */}
          <div className="mx-auto mt-10 flex max-w-2xl overflow-hidden rounded-full border border-gray-200 bg-white shadow-sm">
            <input
              type="text"
              placeholder="Search recipes..."
              className="min-w-0 flex-1 px-6 py-4 outline-none"
            />

            <button className="bg-orange-600 px-8 font-semibold text-white transition hover:bg-orange-700">
              Search
            </button>
          </div>
        </div>
      </section>

      {/* Featured Recipes */}
      <section id="recipes" className="mx-auto max-w-7xl px-6 py-20">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-orange-600">
              Our picks
            </p>

            <h2 className="mt-2 text-4xl font-bold tracking-tight">
              Featured Recipes
            </h2>
          </div>

          <a
            href="#"
            className="hidden font-semibold text-orange-600 transition hover:text-orange-700 sm:block"
          >
            View all →
          </a>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {recipes.map((recipe) => (
            <article
              key={recipe.name}
              className="group overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="h-64 overflow-hidden">
                <img
                  src={recipe.image}
                  alt={recipe.name}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
              </div>

              <div className="p-6">
                <p className="text-sm font-semibold text-orange-600">
                  {recipe.category}
                </p>

                <h3 className="mt-2 text-2xl font-bold">
                  {recipe.name}
                </h3>

                <p className="mt-3 leading-7 text-gray-600">
                  {recipe.description}
                </p>

                <button className="mt-5 font-semibold text-orange-600 transition hover:text-orange-700">
                  View Recipe →
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section id="categories" className="bg-gray-50">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="text-center">
            <p className="text-sm font-bold uppercase tracking-widest text-orange-600">
              Explore
            </p>

            <h2 className="mt-2 text-4xl font-bold tracking-tight">
              Popular Categories
            </h2>

            <p className="mx-auto mt-4 max-w-xl text-gray-600">
              Browse recipes by category and find something delicious to cook.
            </p>
          </div>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((category) => (
              <a
                href="#recipes"
                key={category.name}
                className="group rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="text-5xl">{category.icon}</div>

                <h3 className="mt-5 text-xl font-bold group-hover:text-orange-600">
                  {category.name}
                </h3>

                <p className="mt-2 text-gray-500">
                  Explore recipes →
                </p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section id="blog" className="mx-auto max-w-7xl px-6 py-20">
        <div className="rounded-3xl bg-orange-600 px-8 py-16 text-center text-white md:px-16">
          <p className="text-sm font-bold uppercase tracking-widest">
            Stay inspired
          </p>

          <h2 className="mt-3 text-4xl font-bold">
            Get delicious recipes in your inbox
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-orange-100">
            Subscribe for new recipes, cooking ideas, and helpful kitchen
            inspiration.
          </p>

          <div className="mx-auto mt-8 flex max-w-xl overflow-hidden rounded-full bg-white">
            <input
              type="email"
              placeholder="Your email address"
              className="min-w-0 flex-1 px-6 py-4 text-gray-900 outline-none"
            />

            <button className="px-7 font-semibold text-orange-600">
              Subscribe
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-950 px-6 py-12 text-gray-400">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-5 md:flex-row">
          <div>
            <p className="text-xl font-bold text-white">
              Recipe<span className="text-orange-500">CMS</span>
            </p>

            <p className="mt-2 text-sm">
              Delicious recipes made simple.
            </p>
          </div>

          <p className="text-sm">
            © 2026 Recipe CMS. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}
