// Group 33:
// Chan Darren Jun Rong (1155256148)
// Li Clement (1155214128)
// Ng Ching Yin (1155175606)
// Zhao Yiming (1155211152)

import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

export default function PageShell({ title, className, children }) {
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
