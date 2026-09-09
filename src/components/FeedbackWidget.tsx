"use client";

import { useState, useTransition } from "react";
import { usePathname } from "next/navigation";
import { hasSupabaseConfig } from "@/lib/supabase/client";
import { submitFeedback } from "@/lib/actions";

/**
 * A site-wide feedback tab, styled after Qualtrics' Website/App Feedback
 * (Site Intercept) widget: a small tab pinned to the edge of the viewport
 * on every page, which opens a lightweight form on click. Submissions save
 * straight to the `feedback` table (see supabase/migrations/0002_feedback.sql)
 * — there's no separate feedback service to configure.
 */
export function FeedbackWidget() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [rating, setRating] = useState<number | null>(null);
  const [contactEmail, setContactEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sent" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function reset() {
    setMessage("");
    setRating(null);
    setContactEmail("");
    setStatus("idle");
    setError(null);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim()) {
      setError("Say a little about what's on your mind first.");
      return;
    }
    startTransition(async () => {
      const result = await submitFeedback({
        message,
        rating,
        pagePath: pathname,
        contactEmail,
      });
      if (result.ok) {
        setStatus("sent");
        setError(null);
      } else {
        setStatus("error");
        setError(result.error);
      }
    });
  }

  return (
    <>
      {/* The tab itself — fixed to the right edge, vertically centered. */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label="Give feedback"
        className="fixed right-0 top-1/2 z-40 -translate-y-1/2 rounded-l-md bg-emerald-700 px-2 py-3 text-sm font-medium tracking-wide text-white shadow-lg hover:bg-emerald-800"
        style={{ writingMode: "vertical-rl" }}
      >
        Feedback
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/30 sm:items-center sm:justify-center">
          {/* Backdrop click-to-close */}
          <button
            type="button"
            aria-label="Close feedback"
            className="absolute inset-0 cursor-default"
            onClick={() => {
              setOpen(false);
              reset();
            }}
          />

          <div className="relative m-4 w-full max-w-sm rounded-lg bg-white p-5 shadow-xl">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-semibold text-neutral-900">Got feedback?</h2>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  reset();
                }}
                className="text-neutral-400 hover:text-neutral-600"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            {!hasSupabaseConfig ? (
              <p className="text-sm text-neutral-600">
                Feedback isn&apos;t wired up yet in demo mode — connect Supabase (see the README) to start
                collecting it.
              </p>
            ) : status === "sent" ? (
              <div className="py-2 text-sm text-emerald-700">
                Thanks — that&apos;s been sent through. Really appreciate you taking the time.
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-neutral-500">
                    How&apos;s it going so far?
                  </label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setRating(n === rating ? null : n)}
                        aria-label={`${n} out of 5`}
                        className={`h-8 w-8 rounded text-sm ${
                          rating !== null && n <= rating
                            ? "bg-emerald-600 text-white"
                            : "bg-neutral-100 text-neutral-400 hover:bg-neutral-200"
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-neutral-500" htmlFor="feedback-message">
                    What&apos;s on your mind?
                  </label>
                  <textarea
                    id="feedback-message"
                    required
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="A bug, an idea, a store we're missing — anything."
                    className="w-full rounded border border-neutral-300 p-2 text-sm text-neutral-900 focus:border-emerald-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-neutral-500" htmlFor="feedback-email">
                    Email (optional, if you&apos;d like a reply)
                  </label>
                  <input
                    id="feedback-email"
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full rounded border border-neutral-300 p-2 text-sm text-neutral-900 focus:border-emerald-600 focus:outline-none"
                  />
                </div>

                {error && <p className="text-sm text-red-600">{error}</p>}

                <button
                  type="submit"
                  disabled={isPending}
                  className="w-full rounded bg-emerald-700 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-800 disabled:opacity-60"
                >
                  {isPending ? "Sending…" : "Send feedback"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
