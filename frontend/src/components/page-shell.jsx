import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

export function PageShell({ title, className, children }) {
  return (
    <div className={cn("w-full px-6 py-8 container mx-auto", className)}>
      {title ? (
        <header className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          <Separator className="mt-4" />
        </header>
      ) : null}

      <main className={title ? "mt-4" : ""}>{children}</main>
    </div>
  );
}
