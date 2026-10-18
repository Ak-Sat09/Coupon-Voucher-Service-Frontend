import React, { memo, useCallback, useId, useMemo, useState } from "react";

/**
 * TaskSheet.js - Internship Tasks page (React + Tailwind, single file).
 * Edit only the TASKS array to change content. Replace the example.com links.
 *
 * @typedef {{
 *   id: string, title: string, project: string, group: string,
 *   problem: string[], did: string[], learned: string[],
 *   blogUrl: string, projectUrl: string
 * }} Task
 */

/* Full class strings so Tailwind can detect them at build time. */
const THEMES = {
  "User Preference": {
    accent: "border-l-indigo-500",
    badge: "bg-indigo-50 text-indigo-700 ring-indigo-200",
    chip: "bg-indigo-600 text-white",
    number: "bg-indigo-600",
  },
  "Unified Mailer": {
    accent: "border-l-teal-500",
    badge: "bg-teal-50 text-teal-700 ring-teal-200",
    chip: "bg-teal-600 text-white",
    number: "bg-teal-600",
  },
  "Offer Engine": {
    accent: "border-l-amber-500",
    badge: "bg-amber-50 text-amber-800 ring-amber-200",
    chip: "bg-amber-600 text-white",
    number: "bg-amber-600",
  },
  "Centralized Data API": {
    accent: "border-l-rose-500",
    badge: "bg-rose-50 text-rose-700 ring-rose-200",
    chip: "bg-rose-600 text-white",
    number: "bg-rose-600",
  },
};

/** @type {ReadonlyArray<Task>} */
const TASKS = [
  {
    id: "t1",
    title: "Fix Duplicate Watchlists",
    project: "User Preference",
    group: "User Preference",
    problem: [
      "Due to a concurrency issue, sometimes multiple default watchlists were created for the same user. Ideally, every user should have only one default watchlist.",
      "Because of this, stocks were sometimes added to one watchlist while another empty watchlist was returned to the user.",
    ],
    did: [
      "I created a cleanup job to find duplicate watchlists. I merged the stocks into a single watchlist and removed the duplicate data. The latest updated watchlist was considered while merging the records.",
    ],
    learned: ["Concurrency issues", "MongoDB data handling", "Cron jobs", "Data cleanup"],
    blogUrl: "https://example.com/blog/duplicate-watchlists",
    projectUrl: "https://example.com/project/user-preference",
  },
  {
    id: "t2",
    title: "Fix Missing Stock Prices",
    project: "User Preference",
    group: "User Preference",
    problem: [
      "When a user adds a stock to the watchlist, we call the Market team's API to get the stock price.",
      "Sometimes this API fails or returns a 404 response. Because of this, some stocks were saved without price information.",
    ],
    did: [
      "I created a cron job that finds stocks with missing prices. It calls the Market API again and updates the price when the data is available.",
    ],
    learned: ["External APIs", "Failure handling", "Cron jobs", "Data recovery"],
    blogUrl: "https://example.com/blog/missing-stock-prices",
    projectUrl: "https://example.com/project/user-preference",
  },
  {
    id: "t3",
    title: "Support Multiple Watchlists",
    project: "User Preference",
    group: "User Preference",
    problem: [
      "Earlier, a user could have only one default watchlist. Later, we introduced a feature where users could create multiple watchlists with their own names.",
      "The existing code was designed only for the default watchlist, so it was difficult to extend.",
    ],
    did: [
      "I changed the existing design so that it could support both default and user-created watchlists. I made the code reusable and easier to extend for future watchlist types.",
      "I also used SOLID principles and design patterns while restructuring the code.",
    ],
    learned: ["Java design", "SOLID principles", "Design patterns", "Extendable code"],
    blogUrl: "https://example.com/blog/multiple-watchlists",
    projectUrl: "https://example.com/project/user-preference",
  },
  {
    id: "t4",
    title: "UID API Performance Improvement",
    project: "User Preference",
    group: "User Preference",
    problem: [
      "We had an API that checks whether a UID already exists for a user in the SQL database.",
      "As the database became larger, the query became slow. This increased API response time and sometimes caused timeout issues.",
    ],
    did: [
      "I investigated the slow query and found that the required composite index was missing.",
      "I added the composite index to improve the database query. I also integrated Redis caching to reduce unnecessary database calls and improve API performance.",
    ],
    learned: [
      "SQL query optimization",
      "Composite indexes",
      "Redis caching",
      "API latency",
      "Debugging",
    ],
    blogUrl: "https://example.com/blog/uid-api-performance",
    projectUrl: "https://example.com/project/user-preference",
  },
  {
    id: "t5",
    title: "Failed Email Retry System",
    project: "Unified Mailer Platform",
    group: "Unified Mailer",
    problem: [
      "Our email platform sends millions of emails. Some emails can fail during processing and need to be retried.",
    ],
    did: [
      "I created a retry mechanism for failed emails.",
      "Failed emails were tracked separately and picked up again by a scheduled job. Redis and Kafka were used to push them back for processing.",
      "Each failed email could be retried up to 3 times. After the retry limit was reached, it was moved to the dead-letter flow instead of retrying forever.",
    ],
    learned: [
      "Kafka",
      "Redis",
      "Cron jobs",
      "Retry mechanisms",
      "Failure handling",
      "Dead-letter queues",
    ],
    blogUrl: "https://example.com/blog/email-retry-system",
    projectUrl: "https://example.com/project/unified-mailer",
  },
  {
    id: "t6",
    title: "Handling Multiple Large Email Jobs",
    project: "Unified Mailer",
    group: "Unified Mailer",
    problem: [
      "Our platform can send very large email campaigns. Sometimes multiple campaigns were running at the same time.",
      "Under heavy load, one campaign could get paused while another campaign started processing. This sometimes caused campaigns to appear stuck.",
    ],
    did: [
      "I added tracking for paused email jobs. We maintained information about which job was paused and how many times it was paused.",
      "This helped us understand and manage large email campaigns more reliably.",
    ],
    learned: [
      "Kafka",
      "Large-scale processing",
      "Job management",
      "Debugging",
      "Production issues",
    ],
    blogUrl: "https://example.com/blog/large-email-jobs",
    projectUrl: "https://example.com/project/unified-mailer",
  },
  {
    id: "t7",
    title: "Make Offer Engine Support Multiple Projects",
    project: "Offer Engine",
    group: "Offer Engine",
    problem: [
      "The Offer Engine was originally developed for only one project.",
      "Later, other projects also needed to use the same Offer Engine, but the existing code was not designed for this.",
    ],
    did: [
      "I changed the architecture so the same system could support multiple projects.",
      "This required changes in different parts of the application, including project-type filtering, Redis keys, Kafka messages, DTOs, and database-related logic.",
      "The application was a large multi-module project, so the changes had to work correctly across different modules.",
    ],
    learned: [
      "Java",
      "Multi-module projects",
      "Kafka",
      "Redis",
      "DTO design",
      "Extendable architecture",
    ],
    blogUrl: "https://example.com/blog/offer-engine-multi-project",
    projectUrl: "https://example.com/project/offer-engine",
  },
  {
    id: "t8",
    title: "Form Drop-Off Email, SMS and WhatsApp",
    project: "Centralized Data API",
    group: "Centralized Data API",
    problem: [
      "Users sometimes start a registration form but leave it without completing all the steps.",
      "We needed to identify where the user stopped and send a reminder based on that step.",
    ],
    did: [
      "I worked on a system that tracks the user's current form stage. For example, if a user completed login but did not complete basic details, the system could send a reminder.",
      "Depending on the project, reminders could be sent through Email, SMS, or WhatsApp.",
      "I designed the implementation so it could be reused for multiple projects with different form fields and requirements.",
    ],
    learned: [
      "Email",
      "SMS",
      "WhatsApp",
      "Scheduled jobs",
      "User journey tracking",
      "Reusable design",
      "Multi-project support",
    ],
    blogUrl: "https://example.com/blog/form-drop-off",
    projectUrl: "https://example.com/project/centralized-data-api",
  },
];

const ALL = "All";
const GROUPS = [ALL, ...Array.from(new Set(TASKS.map((t) => t.group)))];

/* ------------------------------ Small parts ------------------------------ */

const Chevron = memo(function Chevron({ open }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      className={`h-5 w-5 shrink-0 text-slate-400 transition-transform duration-200 motion-reduce:transition-none ${
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

const Section = memo(function Section({ heading, paragraphs }) {
  return (
    <section>
      <h3 className="mb-2 text-sm font-semibold text-slate-500">{heading}</h3>
      <div className="space-y-3 text-[15px] leading-relaxed text-slate-700">
        {paragraphs.map((p) => (
          <p key={p}>{p}</p>
        ))}
      </div>
    </section>
  );
});

const LinkButton = memo(function LinkButton({ href, primary, children }) {
  const style = primary
    ? "bg-slate-900 text-white hover:bg-slate-700"
    : "bg-white text-slate-800 ring-1 ring-inset ring-slate-300 hover:bg-slate-50";
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 ${style}`}
    >
      {children}
      <svg aria-hidden="true" viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M7 13L13 7M8 7h5v5" />
      </svg>
      <span className="sr-only">(opens in a new tab)</span>
    </a>
  );
});

/* -------------------------------- Task bar ------------------------------- */

const TaskBar = memo(function TaskBar({ task, index, isOpen, onToggle }) {
  const panelId = useId();
  const theme = THEMES[task.group];

  return (
    <li
      className={`overflow-hidden rounded-xl border border-l-4 border-slate-200 bg-white shadow-sm ${theme.accent}`}
    >
      <h2>
        <button
          type="button"
          onClick={() => onToggle(task.id)}
          aria-expanded={isOpen}
          aria-controls={panelId}
          className="flex w-full items-center gap-4 px-5 py-4 text-left hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-500"
        >
          <span
            aria-hidden="true"
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-semibold text-white ${theme.number}`}
          >
            {index + 1}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-base font-semibold text-slate-900 sm:text-lg">
              Task {index + 1}: {task.title}
            </span>
            <span
              className={`mt-1 inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${theme.badge}`}
            >
              {task.project}
            </span>
          </span>
          <Chevron open={isOpen} />
        </button>
      </h2>

      <div
        id={panelId}
        role="region"
        aria-label={`${task.title} details`}
        hidden={!isOpen}
        className="space-y-6 border-t border-slate-100 bg-slate-50/60 px-5 py-6"
      >
        <div className="grid gap-6 md:grid-cols-2">
          <Section heading="Problem" paragraphs={task.problem} />
          <Section heading="What I did" paragraphs={task.did} />
        </div>

        <div>
          <h3 className="mb-2 text-sm font-semibold text-slate-500">
            What I learned / worked with
          </h3>
          <ul className="flex flex-wrap gap-2">
            {task.learned.map((skill) => (
              <li
                key={skill}
                className="rounded-md bg-white px-2.5 py-1 text-sm text-slate-700 ring-1 ring-inset ring-slate-200"
              >
                {skill}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-wrap gap-3 pt-1">
          <LinkButton href={task.blogUrl} primary>
            Read the detailed blog
          </LinkButton>
          <LinkButton href={task.projectUrl}>View company project</LinkButton>
        </div>
      </div>
    </li>
  );
});

/* ---------------------------------- Page --------------------------------- */

export default function TaskSheet() {
  const [filter, setFilter] = useState(ALL);
  const [openIds, setOpenIds] = useState(() => new Set([TASKS[0].id]));

  const visible = useMemo(
    () => (filter === ALL ? TASKS : TASKS.filter((t) => t.group === filter)),
    [filter]
  );
  const allOpen = visible.every((t) => openIds.has(t.id));

  const handleToggle = useCallback((id) => {
    setOpenIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const handleToggleAll = useCallback(() => {
    setOpenIds((prev) => {
      const next = new Set(prev);
      visible.forEach((t) => (allOpen ? next.delete(t.id) : next.add(t.id)));
      return next;
    });
  }, [visible, allOpen]);

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-12 font-sans text-slate-900 sm:py-16">
      <div className="mx-auto max-w-4xl">
        <header className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            Internships Task
          </h1>
          <p className="mt-3 max-w-2xl text-lg text-slate-600">
            {TASKS.length} problems I worked on across {GROUPS.length - 1} projects:
            what broke, what I built, and what I learned.
          </p>
        </header>

        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div role="group" aria-label="Filter by project" className="flex flex-wrap gap-2">
            {GROUPS.map((g) => {
              const active = filter === g;
              return (
                <button
                  key={g}
                  type="button"
                  onClick={() => setFilter(g)}
                  aria-pressed={active}
                  className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 ${
                    active
                      ? "bg-slate-900 text-white"
                      : "bg-white text-slate-700 ring-1 ring-inset ring-slate-300 hover:bg-slate-50"
                  }`}
                >
                  {g}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={handleToggleAll}
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-700 underline-offset-4 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            {allOpen ? "Collapse all" : "Expand all"}
          </button>
        </div>

        <ul className="space-y-3">
          {visible.map((task) => (
            <TaskBar
              key={task.id}
              task={task}
              index={TASKS.indexOf(task)}
              isOpen={openIds.has(task.id)}
              onToggle={handleToggle}
            />
          ))}
        </ul>
      </div>
    </main>
  );
}
