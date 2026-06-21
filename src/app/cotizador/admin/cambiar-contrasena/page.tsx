import { ChangePasswordForm } from "@/components/auth/change-password-form";
import { ADMIN_HOME_PATH } from "@/lib/auth/constants";

export default function AdminChangePasswordPage() {
  return (
    <ChangePasswordForm
      realm="admin"
      title="Actualiza tu contraseña"
      subtitle="Por seguridad debes reemplazar la clave temporal antes de continuar."
      redirectTo={ADMIN_HOME_PATH}
    />
  );
}
