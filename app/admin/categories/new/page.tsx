import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "../../../../lib/prisma";

async function createCategory(formData: FormData) {
  "use server";

  const name = String(formData.get("name") || "").trim();
  const slug = String(formData.get("slug") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const image = String(formData.get("image") || "").trim();

  if (!name || !slug) {
    throw new Error("Category name and slug are required.");
  }

  await prisma.category.create({
    data: {
      name,
      slug,
      description: description || null,
      image: image || null,
    },
  });

  redirect("/admin/categories");
}

export default function NewCategoryPage() {
  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <Link
            href="/admin/categories"
            className="text-sm text-gray-600 hover:text-black"
          >
            ← Back to Categories
          </Link>

          <h1 className="mt-4 text-3xl font-bold text-gray-900">
            Add New Category
          </h1>

          <p className="mt-2 text-gray-600">
            Create a new recipe category.
          </p>
        </div>

        <form
          action={createCategory}
          className="space-y-6 rounded-xl bg-white p-8 shadow-sm"
        >
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Category Name
            </label>

            <input
              type="text"
              name="name"
              placeholder="e.g. Breakfast"
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Slug
            </label>

            <input
              type="text"
              name="slug"
              placeholder="e.g. breakfast"
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Description
            </label>

            <textarea
              name="description"
              rows={4}
              placeholder="Describe this category..."
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Image URL
            </label>

            <input
              type="url"
              name="image"
              placeholder="https://example.com/category-image.jpg"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black"
            />
          </div>

          <div className="flex gap-3 border-t pt-6">
            <button
              type="submit"
              className="rounded-lg bg-black px-6 py-3 text-sm font-medium text-white hover:bg-gray-800"
            >
              Save Category
            </button>

            <Link
              href="/admin/categories"
              className="rounded-lg border border-gray-300 px-6 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}
