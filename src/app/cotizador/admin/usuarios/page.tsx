"use client";

import { CotizadorNav } from "@/components/cotizador";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminToast } from "@/components/admin/admin-toast";
import { UsersPanel } from "@/components/admin/users-panel";
import { useCallback, useState } from "react";

export default function AdminUsersPage() {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastTone, setToastTone] = useState<"success" | "error">("success");

  const notify = useCallback(
    (message: string, tone: "success" | "error" = "success") => {
      setToastTone(tone);
      setToastMessage(message);
    },
    [],
  );

  return (
    <>
      <CotizadorNav />
      <AdminShell>
        <UsersPanel onNotify={notify} />
      </AdminShell>

      <AdminToast
        message={toastMessage}
        tone={toastTone}
        onDismiss={() => setToastMessage(null)}
      />
    </>
  );
}
