import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Link } from "react-router-dom";

const NAV = [
  {
    section: "Getting Started",
    items: [
      { id: "quickstart", label: "Quickstart" },
      { id: "connect-wallet", label: "Connect Wallet" },
      { id: "first-vm", label: "Deploy First VM" },
    ],
  },
  {
    section: "VM Rental",
    items: [
      { id: "providers", label: "Cloud Providers" },
      { id: "regions", label: "Regions & Latency" },
      { id: "pricing-model", label: "Pricing Model" },
      { id: "ssh-access", label: "SSH Access" },
    ],
  },
  {
    section: "DePIN Hosting",
    items: [
      { id: "depin-overview", label: "Overview" },
      { id: "register-node", label: "Register a Node" },
      { id: "rewards", label: "Earning Rewards" },
    ],
  },
  {
    section: "Smart Contracts",
    items: [
      { id: "escrow", label: "Escrow Flow" },
      { id: "program-id", label: "Program ID" },
    ],
  },
];

const CONTENT: Record<string, { title: string; body: React.ReactNode }> = {
  quickstart: {
    title: "Quickstart",
    body: (
      <div className="space-y-6">
        <p className="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed">
          Get a VM running in under 60 seconds. You need a Solana wallet with
          SOL on devnet.
        </p>
        <div>
          <p className="text-xs tracking-widest uppercase text-zinc-400 dark:text-zinc-600 mb-3">
            1. Connect your wallet
          </p>
          <div className="font-mono text-xs bg-zinc-950 dark:bg-black/40 rounded-lg p-4 text-emerald-400 space-y-1">
            <div>
              <span className="text-zinc-500">$</span> visit{" "}
              <span className="text-white">axion.app</span>
            </div>
            <div>
              <span className="text-zinc-500">→</span> click{" "}
              <span className="text-white">Connect Wallet</span>
            </div>
            <div>
              <span className="text-zinc-500">→</span> approve in your wallet
              extension
            </div>
          </div>
        </div>
        <div>
          <p className="text-xs tracking-widest uppercase text-zinc-400 dark:text-zinc-600 mb-3">
            2. Deploy
          </p>
          <div className="font-mono text-xs bg-zinc-950 dark:bg-black/40 rounded-lg p-4 text-white space-y-1">
            <div>
              <span className="text-[#9945FF]">→</span>{" "}
              <span className="text-zinc-300">/rent</span>
            </div>
            <div>
              <span className="text-zinc-500">Select</span> region, provider,
              specs
            </div>
            <div>
              <span className="text-zinc-500">Confirm</span> SOL payment in
              wallet
            </div>
            <div className="text-emerald-400">
              ✓ VM provisioned — SSH key in clipboard
            </div>
          </div>
        </div>
      </div>
    ),
  },
  "connect-wallet": {
    title: "Connect Wallet",
    body: (
      <div className="space-y-4 text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
        <p>
          Axion uses{" "}
          <span className="text-zinc-900 dark:text-white">
            @solana/wallet-adapter
          </span>{" "}
          and supports Phantom, Backpack, Solflare, and any
          WalletConnect-compatible wallet.
        </p>
        <p>
          Wallet connection triggers a sign-in message — this verifies ownership
          and creates a JWT session without a password.
        </p>
        <p className="text-xs font-mono text-zinc-400 dark:text-zinc-600">
          No private key is ever requested or transmitted.
        </p>
      </div>
    ),
  },
  "first-vm": {
    title: "Deploy First VM",
    body: (
      <div className="space-y-4">
        <div className="font-mono text-xs bg-zinc-950 dark:bg-black/40 rounded-lg p-4 text-white space-y-1.5">
          {[
            { step: "POST", path: "/api/v2/vmInstance/create", status: "201" },
          ].map((r) => (
            <div key={r.path} className="flex items-center gap-3">
              <span className="text-blue-400">{r.step}</span>
              <span className="text-zinc-300">{r.path}</span>
              <span className="ml-auto text-emerald-400">{r.status}</span>
            </div>
          ))}
        </div>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          The backend allocates the VM, writes to DB, then initiates the Solana
          escrow transaction. The UI polls status via WebSocket until the VM is
          RUNNING.
        </p>
      </div>
    ),
  },
  providers: {
    title: "Cloud Providers",
    body: (
      <div className="space-y-6 text-sm">
        {[
          {
            name: "AWS",
            note: "Elastic Compute. Full VM isolation. Regions: us-east-1, eu-west-2, ap-northeast-1, us-west-2",
          },
          {
            name: "GCP",
            note: "Google Cloud VMs. Competitive pricing. Same region spread as AWS.",
          },
          {
            name: "DePIN",
            note: "Community-hosted machines. Docker images only. Cheapest tier — ~55% less than AWS.",
          },
        ].map((p) => (
          <div
            key={p.name}
            className="border-b border-black/[0.05] dark:border-white/[0.05] pb-4 last:border-0"
          >
            <span className="text-xs tracking-widest uppercase text-[#9945FF] block mb-1">
              {p.name}
            </span>
            <p className="text-zinc-500 dark:text-zinc-400 text-xs leading-relaxed">
              {p.note}
            </p>
          </div>
        ))}
      </div>
    ),
  },
  escrow: {
    title: "Escrow Flow",
    body: (
      <div className="space-y-4">
        <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
          Every VM rental creates an on-chain PDA escrow account. SOL is locked
          at rental start and settled proportionally at end.
        </p>
        <div className="font-mono text-xs space-y-2">
          {[
            { fn: "transfer_to_vault_and_rent()", color: "text-[#9945FF]" },
            { fn: "transfer_from_vault()", color: "text-blue-400" },
            { fn: "end_rental_session()", color: "text-emerald-400" },
          ].map((f) => (
            <div key={f.fn} className="flex items-center gap-3">
              <span className="text-zinc-600">→</span>
              <span className={f.color}>{f.fn}</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-zinc-400 dark:text-zinc-600 font-mono">
          Program ID visible in /api page
        </p>
      </div>
    ),
  },
};

// Fallback for unimplemented sections
function DefaultContent({ id }: { id: string }) {
  const label =
    NAV.flatMap((s) => s.items).find((i) => i.id === id)?.label ?? id;
  return (
    <div className="space-y-3">
      <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
        Documentation for{" "}
        <span className="text-zinc-900 dark:text-white">{label}</span> is being
        written. Check back soon.
      </p>
      <p className="text-xs font-mono text-zinc-400 dark:text-zinc-600">
        In the meantime, see the{" "}
        <Link to="/api" className="text-[#9945FF] hover:underline">
          API reference
        </Link>
        .
      </p>
    </div>
  );
}

export default function Docs() {
  const [active, setActive] = useState("quickstart");
  const [search, setSearch] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);
  const content = CONTENT[active];

  const allItems = NAV.flatMap((s) => s.items);
  const filtered = search
    ? allItems.filter((i) =>
        i.label.toLowerCase().includes(search.toLowerCase()),
      )
    : null;

  // keyboard shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <div className="min-h-screen bg-[#F4F2F8] dark:bg-zinc-950 flex flex-col pt-16 overflow-hidden">
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 40% 30% at 20% 20%, rgba(153,69,255,0.05), transparent 70%)",
        }}
      />

      {/* top bar */}
      <div className="border-b border-black/[0.06] dark:border-white/[0.06] px-4 py-3 flex items-center gap-4 relative z-10 bg-[#F4F2F8]/80 dark:bg-zinc-950/80 backdrop-blur-sm">
        <button
          onClick={() => setSidebarOpen((s) => !s)}
          className="text-zinc-400 hover:text-zinc-700 dark:hover:text-white transition-colors p-1"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
        <span className="text-[11px] tracking-[0.22em] uppercase text-zinc-400 dark:text-zinc-600">
          Docs
        </span>
        <div className="ml-auto flex items-center gap-2 bg-black/[0.04] dark:bg-white/[0.04] rounded-lg px-3 py-1.5 border border-black/[0.06] dark:border-white/[0.06] w-48">
          <svg
            className="w-3 h-3 text-zinc-400 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            ref={inputRef}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search…"
            className="bg-transparent text-xs text-zinc-700 dark:text-zinc-300 placeholder:text-zinc-400 focus:outline-none flex-1 w-full"
          />
          {!search && (
            <span className="text-[10px] font-mono text-zinc-400 dark:text-zinc-600">
              ⌘K
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* sidebar */}
        <AnimatePresence initial={false}>
          {sidebarOpen && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 220, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="border-r border-black/[0.06] dark:border-white/[0.06] overflow-hidden flex-shrink-0"
            >
              <div className="w-[220px] h-full overflow-y-auto py-6 px-4 space-y-6">
                {(filtered
                  ? [{ section: "Results", items: filtered }]
                  : NAV
                ).map((s) => (
                  <div key={s.section}>
                    <span className="text-[10px] tracking-[0.2em] uppercase text-zinc-400 dark:text-zinc-600 block mb-2 px-2">
                      {s.section}
                    </span>
                    {s.items.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActive(item.id);
                          setSearch("");
                        }}
                        className={`w-full text-left text-xs px-2 py-1.5 rounded transition-all duration-200 ${
                          active === item.id
                            ? "text-zinc-900 dark:text-white bg-black/[0.05] dark:bg-white/[0.06]"
                            : "text-zinc-500 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
                        }`}
                      >
                        {item.id === active && (
                          <span className="inline-block w-1 h-1 rounded-full bg-[#9945FF] mr-2 align-middle" />
                        )}
                        {item.label}
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* content */}
        <main className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="max-w-3xl px-8 py-12"
            >
              {/* breadcrumb */}
              <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 dark:text-zinc-600 font-mono mb-8">
                <span>docs</span>
                <span>/</span>
                <span className="text-zinc-700 dark:text-zinc-300">
                  {allItems.find((i) => i.id === active)?.label}
                </span>
              </div>

              <h1 className="text-3xl md:text-4xl font-light text-zinc-950 dark:text-white tracking-tight mb-8">
                {content?.title ?? allItems.find((i) => i.id === active)?.label}
              </h1>

              <div className="prose-like">
                {content ? content.body : <DefaultContent id={active} />}
              </div>

              {/* pagination */}
              <div className="flex items-center justify-between mt-16 pt-8 border-t border-black/[0.05] dark:border-white/[0.05]">
                {(() => {
                  const idx = allItems.findIndex((i) => i.id === active);
                  const prev = allItems[idx - 1];
                  const next = allItems[idx + 1];
                  return (
                    <>
                      {prev ? (
                        <button
                          onClick={() => setActive(prev.id)}
                          className="text-xs text-zinc-400 dark:text-zinc-600 hover:text-zinc-900 dark:hover:text-white transition-colors flex items-center gap-1"
                        >
                          ← {prev.label}
                        </button>
                      ) : (
                        <span />
                      )}
                      {next ? (
                        <button
                          onClick={() => setActive(next.id)}
                          className="text-xs text-zinc-400 dark:text-zinc-600 hover:text-zinc-900 dark:hover:text-white transition-colors flex items-center gap-1"
                        >
                          {next.label} →
                        </button>
                      ) : (
                        <span />
                      )}
                    </>
                  );
                })()}
              </div>
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
