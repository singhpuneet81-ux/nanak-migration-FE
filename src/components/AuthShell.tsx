import { Outlet } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";

/** Wraps admin + login routes only. Public iframe embeds stay outside this shell. */
export default function AuthShell() {
  return (
    <AuthProvider>
      <Outlet />
    </AuthProvider>
  );
}
