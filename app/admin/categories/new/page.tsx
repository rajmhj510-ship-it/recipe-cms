import Link from "next/link";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin-auth";
import { revalidatePath } from "next/cache";
import { prisma } from "../../../../lib/prisma";

async function createCategory(formData: FormData) {
  "use server";
  await requireAdmin();

  const name = String(formData.get("name") || "").trim();
  const slug = String(formData.get("slug") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const image = String(formData.get("image") || "").trim();

  if (!name || !slug) {
    throw new Error("Category name and slug are required.");
  }

  if (name.length > 120 || slug.length > 180) {
    throw new Error("Category name or slug is too long.");
  }

  if (!/^[-a-z0-9]+$/.test(slug)) {
    throw new Error("Slug must contain only lowercase letters, numbers, and hyphens.");
  }

  if (description.length > 5000) {
    throw new Error("Category description is too long.");
  }

  if (image) {
    try {
      const url = new URL(image);
      if (url.protocol !== "http:" && url.protocol !== "https:") {
        throw new Error("Invalid image URL.");
      }
    } catch {
      throw new Error("Image must be a valid HTTP(S) URL.");
    }
  }

  await prisma.category.create({
    data: {
      name,
      slug,
      description: description || null,
      image: image || null,
    },
  });
  revalidatePath("/");
  revalidatePath("/recipes");

  redirect("/admin/categories");
}

export default async function NewCategoryPage() {
  await requireAdmin();
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
