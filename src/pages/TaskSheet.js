import React, { memo, useCallback, useId, useState } from "react";

/**
 * TaskSheet.js
 * Single-file React + Tailwind page: "Internship Tasks".
 *
 * Design notes
 * - Data is separated from presentation (TASKS is the only thing you edit).
 * - Each bar is an accessible accordion (button + aria-expanded + aria-controls).
 * - Presentational components are memoized; toggle handler is stable (useCallback).
 * - Links open in a new tab with rel="noopener noreferrer".
 *
 * Requires Tailwind CSS to be configured in your project.
 */

/** @typedef {{ id: string, name: string, description: string[], blogUrl: string, projectUrl: string }} Task */

/** @type {ReadonlyArray<Task>} */
const TASKS = [
  {
    id: "task-1",
    name: "Order Tracking Service",
    description: [
      "Built REST APIs for order creation and status lookup using Spring Boot.",
      "Added Redis caching, cutting p95 read latency by roughly 40%.",
      "Wrote integration tests with Testcontainers and reached 85% coverage.",
      "Introduced idempotency keys to prevent duplicate order submissions.",
    ],
    blogUrl: "https://example.com/blog/order-tracking-service",
    projectUrl: "https://example.com/company/order-tracking",
  },
  {
    id: "task-2",
    name: "Internal Analytics Dashboard",
    description: [
      "Built a React dashboard that charts weekly active usage per team.",
      "Moved data fetching to a shared hook with request deduplication.",
      "Added CSV export and filters synced to the URL query string.",
    ],
    blogUrl: "https://example.com/blog/analytics-dashboard",
    projectUrl: "https://example.com/company/analytics",
  },
  {
    id: "task-3",
    name: "CI Pipeline Optimization",
    description: [
      "Profiled the build and found the slowest stages.",
      "Parallelized test suites and cached dependencies between runs.",
      "Reduced average pipeline time from 18 to 9 minutes.",
      "Documented the setup so other teams could reuse it.",
      "Added flaky-test detection with automatic retry reporting.",
    ],
    blogUrl: "https://example.com/blog/ci-optimization",
    projectUrl: "https://example.com/company/ci-pipeline",
  },
];

/* ----------------------------- Small pieces ----------------------------- */

const ChevronIcon = memo(function ChevronIcon({ open }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      className={`h-5 w-5 shrink-0 text-slate-500 transition-transform duration-200 ${
        open ? "rotate-180" : ""
      }`}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 8l5 5 5-5" />
    </svg>
  );
});

const ExternalLink = memo(function ExternalLink({ href, children, variant }) {
  const styles =
    variant === "primary"
      ? "bg-indigo-600 text-white hover:bg-indigo-700"
      : "border border-slate-300 text-slate-800 hover:bg-slate-100";

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center rounded-md px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 ${styles}`}
    >
      {children}
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
});

/* ------------------------------ Task row -------------------------------- */

const TaskBar = memo(function TaskBar({ task, isOpen, onToggle }) {
  const panelId = useId();

  return (
    <li className="overflow-hidden rounded-lg border border-slate-200 bg-white">
      <h2>
        <button
          type="button"
          onClick={() => onToggle(task.id)}
          aria-expanded={isOpen}
          aria-controls={panelId}
          className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-500"
        >
          <span className="text-lg font-semibold text-slate-900">
            {task.name}
          </span>
          <ChevronIcon open={isOpen} />
        </button>
      </h2>

      <div
        id={panelId}
        role="region"
        aria-label={`${task.name} details`}
        hidden={!isOpen}
        className="border-t border-slate-200 px-5 py-4"
      >
        <ul className="list-disc space-y-2 pl-5 text-slate-700">
          {task.description.map((point) => (
            <li key={point}>{point}</li>
          ))}
        </ul>

        <div className="mt-5 flex flex-wrap gap-3">
          <ExternalLink href={task.blogUrl} variant="primary">
            Read the detailed blog
          </ExternalLink>
          <ExternalLink href={task.projectUrl} variant="secondary">
            View company project
          </ExternalLink>
        </div>
      </div>
    </li>
  );
});

/* -------------------------------- Page ---------------------------------- */

export default function TaskSheet() {
  // Single-open accordion: store only the id of the expanded task.
  const [openId, setOpenId] = useState(TASKS[0]?.id ?? null);

  const handleToggle = useCallback(
    (id) => setOpenId((current) => (current === id ? null : id)),
    []
  );

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-12 font-sans text-slate-900">
      <div className="mx-auto max-w-3xl">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Internship Tasks
          </h1>
          <p className="mt-2 text-slate-600">
            Projects I worked on during my internship, with a blog post and the
            company project for each.
          </p>
        </header>

        {TASKS.length === 0 ? (
          <p className="rounded-lg border border-dashed border-slate-300 p-6 text-center text-slate-600">
            No tasks yet. Add your first project to the TASKS array.
          </p>
        ) : (
          <ul className="space-y-3">
            {TASKS.map((task) => (
              <TaskBar
                key={task.id}
                task={task}
                isOpen={openId === task.id}
                onToggle={handleToggle}
              />
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
