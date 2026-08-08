import Link from "next/link";
import { LayoutDashboard, ReceiptText, Wallet, Settings } from "lucide-react";

export function BottomNav() {
  return (
    <>
      <nav className="md:hidden fixed bottom-0 w-full bg-background border-t border-border flex justify-around py-3 pb-safe z-50">
        <Link href="/" className="flex flex-col items-center gap-1 text-foreground">
          <LayoutDashboard className="w-6 h-6" />
          <span className="text-xs font-medium">Dashboard</span>
        </Link>
        <Link
          href="#"
          className="flex flex-col items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ReceiptText className="w-6 h-6" />
          <span className="text-xs font-medium">Transact</span>
        </Link>
        <Link
          href="#"
          className="flex flex-col items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
        >
          <Wallet className="w-6 h-6" />
          <span className="text-xs font-medium">Budgets</span>
        </Link>
        <Link
          href="#"
          className="flex flex-col items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
        >
          <Settings className="w-6 h-6" />
          <span className="text-xs font-medium">Settings</span>
        </Link>
      </nav>
      {/* Mobile padding for bottom nav */}
      <div className="md:hidden h-16 w-full"></div>
    </>
  );
}
