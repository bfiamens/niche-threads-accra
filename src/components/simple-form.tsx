import { useState, type FormEvent, type ReactNode } from "react";
import { useI18n } from "@/lib/i18n";
import { btn } from "@/components/site";
import { cn } from "@/lib/utils";
export function SimpleForm({ onSend, done, children }: { onSend: (f: FormData) => Promise<boolean>; done: string; children: ReactNode }) {
  const { t } = useI18n();
  const [st, setSt] = useState<"idle" | "busy" | "done" | "err">("idle");
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); setSt("busy");
    setSt((await onSend(new FormData(e.currentTarget))) ? "done" : "err");
  }
  if (st === "done") return <p className="mt-8 rounded-[22px] bg-secondary p-6">{done}</p>;
  return (
    <form onSubmit={submit} className="mt-8 grid gap-3 rounded-[22px] bg-secondary p-6 md:p-9">
      {children}
      {st === "err" && <p role="alert" className="text-sm text-destructive">{t("err_details")}</p>}
      <button disabled={st === "busy"} className={cn(btn, "w-full")}>{st === "busy" ? t("sending") : t("send_request")}</button>
      <p className="text-xs text-muted-foreground">{t("privacy_short")}</p>
    </form>
  );
}
