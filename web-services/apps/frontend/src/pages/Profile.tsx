import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { useWallet } from "@solana/wallet-adapter-react";
import { BackgroundGlow } from "@/components/BackgroundGlow";
import { Check } from "lucide-react";

import { api } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { showSuccess, showError } from "@/lib/toast";
import { toast } from "sonner";
import { useLoadingTimeout } from "@/hooks/useLoadingTimeout";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/Skeleton";

function Row({
  label,
  value,
  mono = false,
  children,
}: {
  label: string;
  value?: string;
  mono?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-black/[0.04] dark:border-white/[0.04] last:border-0">
      <span className="text-xs tracking-[0.12em] uppercase text-zinc-400 dark:text-zinc-600">
        {label}
      </span>
      {children ?? (
        <span
          className={`text-sm text-zinc-700 dark:text-zinc-300 ${mono ? "font-mono text-xs" : ""}`}
        >
          {value}
        </span>
      )}
    </div>
  );
}

function SkeletonRow() {
  return (
    <div className="flex items-center justify-between py-4 border-b border-black/[0.04] dark:border-white/[0.04] last:border-0">
      <Skeleton className="h-3 w-16" />
      <Skeleton className="h-4 w-32" />
    </div>
  );
}

const SECTIONS = [
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const timedOut = useLoadingTimeout(loading, 30000);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "" });
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const fetchProfile = async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await api.get("/user/profile");
      const d = res.data?.data ?? res.data;
      setFormData({
        name: d.name ?? "",
        email: d.email ?? localStorage.getItem("email") ?? "",
      });
    } catch {
      setError(true);
      showError("Failed to load profile");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProfile();
  }, [publicKey]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put("/user/profile", formData);
      localStorage.setItem("email", formData.email);
      showSuccess("Profile updated");
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
      setIsEditing(false);
    } catch {
      showError("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: "",
      email: localStorage.getItem("email") ?? "",
    });
    setIsEditing(false);
  };

  const pk = publicKey?.toBase58() ?? "";
  const email = formData.email ?? localStorage.getItem("email") ?? "";

  return (
    <div
      aria-live="polite"
      className="min-h-screen bg-background pt-28 pb-40 px-6"
    >
      <BackgroundGlow
        color="rgba(153,69,255,0.05)"
        size="40% 30%"
        position="60% 0%"
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
          {/* Identity — manually rendered for edit support */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] tracking-[0.22em] uppercase text-zinc-400 dark:text-zinc-600">
                Identity
              </span>
              {!loading && !isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-[11px] tracking-wider uppercase text-[#9945FF] hover:text-[#7c3aed] transition-colors"
                >
                  Edit
                </button>
              )}
            </div>
            <div className="border-t border-black/[0.06] dark:border-white/[0.06]">
              {timedOut && !error ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">
                    Loading is taking longer than expected. Please try again.
                  </p>
                  <Button onClick={fetchProfile} className="mt-4">
                    Retry
                  </Button>
                </div>
              ) : loading ? (
                <>
                  <SkeletonRow />
                  <SkeletonRow />
                  <SkeletonRow />
                </>
              ) : (
                <>
                  <Row label="Wallet" value={pk} mono />
                  {isEditing ? (
                    <>
                      <Row label="Name">
                        <Input
                          value={formData.name}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              name: e.target.value,
                            }))
                          }
                          className="h-8 w-48 text-sm text-right"
                          placeholder="Your name"
                        />
                      </Row>
                      <Row label="Email">
                        <Input
                          value={formData.email}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              email: e.target.value,
                            }))
                          }
                          className="h-8 w-48 text-sm text-right"
                          placeholder="your@email.com"
                        />
                      </Row>
                    </>
                  ) : (
                    <>
                      <Row label="Name" value={formData.name || "—"} />
                      <Row label="Email" value={email || "—"} />
                    </>
                  )}
                  <Row label="Network" value="Solana Devnet" />
                  {isEditing && (
                    <div className="flex items-center justify-end gap-3 pt-4 pb-2">
                      <button
                        onClick={handleCancel}
                        disabled={saving}
                        className="text-xs tracking-wider uppercase text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors disabled:opacity-50"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSave}
                        disabled={saving}
                        className="text-xs tracking-wider uppercase text-[#9945FF] hover:text-[#7c3aed] transition-colors disabled:opacity-50"
                      >
                        {saveSuccess ? (
                          <Check className="w-4 h-4" />
                        ) : saving ? (
                          "Saving…"
                        ) : (
                          "Save"
                        )}
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </motion.div>

          {SECTIONS.map((section, i) => (
            <motion.div
              key={section.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: 0.2 + (i + 1) * 0.12, duration: 0.6 }}
            >
              <span className="text-[10px] tracking-[0.22em] uppercase text-zinc-400 dark:text-zinc-600 block mb-1">
                {section.label}
              </span>
              <div className="border-t border-black/[0.06] dark:border-white/[0.06]">
                {section.rows().map((r) => (
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
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ delay: 0.7 }}
          className="mt-16 pt-8 border-t border-black/[0.06] dark:border-white/[0.06]"
        >
          <button
            onClick={() => {
              if (!window.confirm("Are you sure you want to sign out?")) return;
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
