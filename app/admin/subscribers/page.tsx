import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { revalidatePath } from "next/cache";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const dynamic = "force-dynamic";

export default async function SubscribersPage() {
  await requireAdmin();
  async function addSubscriber(formData: FormData) {
    "use server";
    await requireAdmin();

    const email = String(formData.get("email") || "")
      .trim()
      .toLowerCase();

    if (!emailRegex.test(email)) {
      return;
    }

    try {
      await prisma.subscriber.create({
        data: {
          email,
        },
      });

      revalidatePath("/admin/subscribers");
      revalidatePath("/admin");
    } catch (error) {
      console.error("Subscriber add error:", error);
    }
  }

  async function updateSubscriber(formData: FormData) {
    "use server";
    await requireAdmin();

    const id = Number(formData.get("id"));
    const email = String(formData.get("email") || "")
      .trim()
      .toLowerCase();

    if (!Number.isInteger(id) || id <= 0 || !emailRegex.test(email)) {
      return;
    }

    try {
      await prisma.subscriber.update({
        where: {
          id,
        },
        data: {
          email,
        },
      });

      revalidatePath("/admin/subscribers");
      revalidatePath("/admin");
    } catch (error) {
      console.error("Subscriber update error:", error);
    }
  }

  async function deleteSubscriber(formData: FormData) {
    "use server";
    await requireAdmin();

    const id = Number(formData.get("id"));

    if (!Number.isInteger(id) || id <= 0) {
      return;
    }

    try {
      await prisma.subscriber.delete({
        where: {
          id,
        },
      });

      revalidatePath("/admin/subscribers");
      revalidatePath("/admin");
    } catch (error) {
      console.error("Subscriber delete error:", error);
    }
  }

  const subscribers = await prisma.subscriber.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-orange-600">
              Newsletter
            </p>

            <h1 className="mt-2 text-4xl font-bold text-gray-900">
              Subscribers
            </h1>

            <p className="mt-2 text-gray-600">
              {subscribers.length} subscriber
              {subscribers.length === 1 ? "" : "s"}
            </p>
          </div>

          <Link
            href="/admin"
            className="rounded-full bg-gray-900 px-5 py-2.5 text-center font-semibold text-white transition hover:bg-gray-800"
          >
            Back to Dashboard
          </Link>
        </div>

        <div className="mb-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900">
            Add Subscriber
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Add a newsletter subscriber manually.
          </p>

          <form
            action={addSubscriber}
            className="mt-5 flex flex-col gap-3 sm:flex-row"
          >
            <input
              type="email"
              name="email"
              required
              placeholder="Email address"
              className="min-w-0 flex-1 rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
            />

            <button
              type="submit"
              className="rounded-xl bg-orange-600 px-6 py-3 font-semibold text-white transition hover:bg-orange-700"
            >
              Add Subscriber
            </button>
          </form>
        </div>

        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          {subscribers.length === 0 ? (
            <div className="p-12 text-center">
              <h2 className="text-xl font-bold text-gray-900">
                No subscribers yet
              </h2>

              <p className="mt-2 text-gray-600">
                Newsletter subscribers will appear here.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {subscribers.map((subscriber) => (
                <div key={subscriber.id} className="px-6 py-6">
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-500">
                        Subscriber #{subscriber.id}
                      </p>

                      <p className="mt-1 text-sm text-gray-500">
                        Subscribed{" "}
                        {subscriber.createdAt.toLocaleDateString()}
                      </p>
                    </div>

                    <span className="text-sm font-medium text-green-600">
                      Active
                    </span>
                  </div>

                  <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                    <form
                      action={updateSubscriber}
                      className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row"
                    >
                      <input
                        type="hidden"
                        name="id"
                        value={subscriber.id}
                      />

                      <input
                        type="email"
                        name="email"
                        required
                        defaultValue={subscriber.email}
                        className="min-w-0 flex-1 rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                      />

                      <button
                        type="submit"
                        className="rounded-xl bg-orange-600 px-5 py-3 font-semibold text-white transition hover:bg-orange-700"
                      >
                        Edit
                      </button>
                    </form>

                    <form action={deleteSubscriber}>
                      <input
                        type="hidden"
                        name="id"
                        value={subscriber.id}
                      />

                      <button
                        type="submit"
                        className="w-full rounded-xl border border-red-200 bg-white px-5 py-3 font-semibold text-red-600 transition hover:bg-red-50 sm:w-auto"
                      >
                        Delete
                      </button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
