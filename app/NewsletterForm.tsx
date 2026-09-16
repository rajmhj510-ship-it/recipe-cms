"use client";

import { FormEvent, useState } from "react";

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error || "Something went wrong.");
        return;
      }

      setMessage(data.message);
      setEmail("");
    } catch {
      setMessage("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <form
        onSubmit={handleSubmit}
        className="mx-auto mt-8 flex max-w-xl overflow-hidden rounded-full bg-white"
      >
        <input
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Your email address"
          className="min-w-0 flex-1 px-6 py-4 text-gray-900 outline-none"
        />

        <button
          type="submit"
          disabled={loading}
          className="px-7 font-semibold text-orange-600 disabled:opacity-50"
        >
          {loading ? "..." : "Subscribe"}
        </button>
      </form>

      {message && (
        <p className="mt-4 font-medium text-white">
          {message}
        </p>
      )}
    </div>
  );
}
