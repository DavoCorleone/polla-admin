import { SignIn } from "@clerk/nextjs";

export default function AdminLogin() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh]">
      <div className="mb-8 text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Acceso Restringido</h1>
        <p className="text-muted-foreground">Esta área es solo para administradores.</p>
      </div>
      <SignIn path="/admin-login" routing="path" fallbackRedirectUrl="/admin" />
    </div>
  );
}
