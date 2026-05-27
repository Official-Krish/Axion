import { motion } from "motion/react";
import { useWallet } from "@solana/wallet-adapter-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

function Row({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-black/[0.04] dark:border-white/[0.04] last:border-0">
      <span className="text-xs tracking-[0.12em] uppercase text-zinc-400 dark:text-zinc-600">
        {label}
      </span>
      <span
        className={`text-sm text-zinc-700 dark:text-zinc-300 ${mono ? "font-mono text-xs" : ""}`}
      >
        {value}
      </span>
    </div>
  );
}

const SECTIONS = [
  {
    label: "Identity",
    rows: (pk: string, email: string) => [
      { label: "Wallet", value: pk, mono: true },
      { label: "Email", value: email || "—" },
      { label: "Network", value: "Solana Devnet" },
    ],
  },
  {
    label: "Security",
    rows: () => [
      { label: "Auth method", value: "Wallet signature" },
      { label: "2FA", value: "Not configured" },
      { label: "Session", value: "Active" },
    ],
  },
  {
    label: "Preferences",
    rows: () => [
      { label: "Theme", value: "System" },
      { label: "Language", value: "English" },
      {
        label: "Timezone",
        value: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
    ],
  },
];

export default function Profile() {
  const { publicKey } = useWallet();

  if (!publicKey || !localStorage.getItem("token")) {
    return (
      <div className="min-h-screen bg-[#F4F2F8] dark:bg-zinc-950 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <p className="text-zinc-500 dark:text-zinc-500 text-sm mb-4">
            Sign in to access settings
          </p>
          <Link
            to="/signin"
            className="text-sm text-zinc-900 dark:text-white hover:text-[#9945FF] transition-colors"
          >
            Sign in →
          </Link>
        </motion.div>
      </div>
    );
  }

  const pk = publicKey.toBase58();
  const email = localStorage.getItem("email") ?? "";

  return (
    <div className="min-h-screen bg-[#F4F2F8] dark:bg-zinc-950 pt-28 pb-40 px-6 overflow-hidden">
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 40% 30% at 60% 0%, rgba(153,69,255,0.05), transparent 70%)",
        }}
      />

      <div className="max-w-3xl mx-auto">
        {/* header */}
        <div className="mb-16">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 mb-8"
          >
            <span className="h-px w-6 bg-[#9945FF]/60" />
            <span className="text-[11px] tracking-[0.22em] uppercase text-zinc-500 dark:text-white/40">
              Settings
            </span>
          </motion.div>

          <h1 className="text-4xl md:text-5xl font-light leading-tight tracking-tight text-zinc-950 dark:text-white">
            <span className="block overflow-hidden">
              <motion.span
                className="block"
                initial={{ y: "110%" }}
                animate={{ y: "0%" }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              >
                Account
              </motion.span>
            </span>
          </h1>
        </div>

        {/* sections */}
        <div className="space-y-12">
          {SECTIONS.map((section, i) => (
            <motion.div
              key={section.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.12, duration: 0.6 }}
            >
              <span className="text-[10px] tracking-[0.22em] uppercase text-zinc-400 dark:text-zinc-600 block mb-1">
                {section.label}
              </span>
              <div className="border-t border-black/[0.06] dark:border-white/[0.06]">
                {section.rows(pk, email).map((r) => (
                  <Row key={r.label} {...r} />
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* sign out */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-16 pt-8 border-t border-black/[0.06] dark:border-white/[0.06]"
        >
          <button
            onClick={() => {
              localStorage.removeItem("token");
              toast.success("Signed out");
              window.location.href = "/";
            }}
            className="text-sm text-red-500 hover:text-red-400 transition-colors"
          >
            Sign out →
          </button>
        </motion.div>
      </div>
    </div>
  );
}
