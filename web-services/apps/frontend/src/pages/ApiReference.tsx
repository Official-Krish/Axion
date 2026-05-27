import { useRef, useState } from "react";
import { motion, useInView } from "motion/react";

const METHODS = ["GET", "POST", "PUT", "DELETE"] as const;
type Method = (typeof METHODS)[number];

const METHOD_COLOR: Record<Method, string> = {
  GET: "text-emerald-500",
  POST: "text-blue-400",
  PUT: "text-amber-400",
  DELETE: "text-red-400",
};

const ENDPOINTS = [
  {
    group: "VM Instances",
    routes: [
      {
        method: "POST" as Method,
        path: "/api/v2/vmInstance/create",
        desc: "Create a new VM instance",
        auth: true,
      },
      {
        method: "GET" as Method,
        path: "/api/v2/vmInstance/:id",
        desc: "Get VM details",
        auth: true,
      },
      {
        method: "PUT" as Method,
        path: "/api/v2/vmInstance/:id",
        desc: "Update VM configuration",
        auth: true,
      },
      {
        method: "DELETE" as Method,
        path: "/api/v2/vmInstance/:id",
        desc: "Terminate VM instance",
        auth: true,
      },
      {
        method: "GET" as Method,
        path: "/api/v2/vmInstance/getAll",
        desc: "List all VMs for wallet",
        auth: true,
      },
    ],
  },
  {
    group: "DePIN",
    routes: [
      {
        method: "POST" as Method,
        path: "/api/v2/user/depin/register",
        desc: "Register host machine",
        auth: true,
      },
      {
        method: "GET" as Method,
        path: "/api/v2/user/depin/status",
        desc: "Get host status",
        auth: true,
      },
      {
        method: "POST" as Method,
        path: "/api/v2/user/depin/activate",
        desc: "Activate host machine",
        auth: true,
      },
    ],
  },
  {
    group: "Auth",
    routes: [
      {
        method: "POST" as Method,
        path: "/api/v2/user/signup",
        desc: "Register a new user account",
        auth: false,
      },
      {
        method: "POST" as Method,
        path: "/api/v2/user/signin",
        desc: "Authenticate, get JWT token",
        auth: false,
      },
      {
        method: "GET" as Method,
        path: "/api/v2/user/profile",
        desc: "Get current user profile",
        auth: true,
      },
    ],
  },
];

function GroupSection({
  group,
  i,
}: {
  group: (typeof ENDPOINTS)[0];
  i: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: i * 0.12 }}
      className="mb-12"
    >
      <span className="text-[10px] tracking-[0.22em] uppercase text-zinc-400 dark:text-zinc-600 block mb-4">
        {group.group}
      </span>
      <div className="space-y-0 divide-y divide-black/[0.04] dark:divide-white/[0.04]">
        {group.routes.map((r) => {
          const key = r.method + r.path;
          const open = expanded === key;
          return (
            <div key={key}>
              <button
                onClick={() => setExpanded(open ? null : key)}
                className="w-full flex items-center gap-4 py-3.5 text-left group"
              >
                <span
                  className={`text-xs font-mono font-bold w-12 flex-shrink-0 ${METHOD_COLOR[r.method]}`}
                >
                  {r.method}
                </span>
                <span className="text-xs font-mono text-zinc-700 dark:text-zinc-300 flex-1 truncate">
                  {r.path}
                </span>
                <span className="text-xs text-zinc-400 dark:text-zinc-600 hidden md:block flex-shrink-0">
                  {r.desc}
                </span>
                {r.auth && (
                  <span className="text-[10px] font-mono text-zinc-400 dark:text-zinc-600 flex-shrink-0 ml-2">
                    🔒
                  </span>
                )}
                <svg
                  className={`w-3 h-3 text-zinc-400 flex-shrink-0 transition-transform duration-200 ${open ? "rotate-90" : ""}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
              <motion.div
                initial={false}
                animate={{ height: open ? "auto" : 0, opacity: open ? 1 : 0 }}
                className="overflow-hidden"
              >
                <div className="pl-16 pb-4 text-xs text-zinc-500 dark:text-zinc-500 space-y-2">
                  <p>{r.desc}</p>
                  <div className="font-mono bg-zinc-950 dark:bg-black/40 rounded p-3 text-zinc-300 space-y-1">
                    <div>
                      <span className="text-zinc-600">Authorization:</span>{" "}
                      Bearer &lt;JWT&gt;
                    </div>
                    <div>
                      <span className="text-zinc-600">Content-Type:</span>{" "}
                      application/json
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

export default function ApiReference() {
  return (
    <div className="min-h-screen bg-[#F4F2F8] dark:bg-zinc-950 pt-28 pb-40 px-6 overflow-hidden">
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 40% 30% at 80% 10%, rgba(56,189,248,0.05), transparent 70%)",
        }}
      />

      <div className="max-w-4xl mx-auto">
        {/* header */}
        <div className="mb-20">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 mb-10"
          >
            <span className="h-px w-6 bg-blue-400/60" />
            <span className="text-[11px] tracking-[0.22em] uppercase text-zinc-500 dark:text-white/40">
              API Reference
            </span>
            <span className="ml-auto text-[11px] font-mono text-zinc-400 dark:text-zinc-600">
              v2 · REST · JSON
            </span>
          </motion.div>

          <h1 className="text-[clamp(2.5rem,7vw,6rem)] font-light leading-[0.95] tracking-[-0.04em] text-zinc-950 dark:text-white">
            <span className="block overflow-hidden">
              <motion.span
                className="block"
                initial={{ y: "110%" }}
                animate={{ y: "0%" }}
                transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
              >
                Endpoints
              </motion.span>
            </span>
          </h1>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="mt-6 flex items-center gap-4"
          >
            <div className="font-mono text-xs bg-zinc-950 dark:bg-black/40 rounded-lg px-4 py-2 text-zinc-300 inline-flex items-center gap-3">
              <span className="text-zinc-600">BASE</span>
              <span>http://localhost:3000/api/v2</span>
            </div>
          </motion.div>
        </div>

        {/* legend */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex items-center gap-6 mb-10 text-xs font-mono"
        >
          {METHODS.map((m) => (
            <span
              key={m}
              className={`flex items-center gap-1.5 ${METHOD_COLOR[m]}`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-current" />
              {m}
            </span>
          ))}
          <span className="ml-auto text-zinc-400 dark:text-zinc-600">
            click row to expand
          </span>
        </motion.div>

        {/* endpoints */}
        {ENDPOINTS.map((g, i) => (
          <GroupSection key={g.group} group={g} i={i} />
        ))}
      </div>
    </div>
  );
}
