"use client";

import { useAuth } from "@/context/AuthContext";
import { ConnectWallet } from "@/components/ConnectWallet";
import { usePathname } from "next/navigation";

export function Nav() {
  const { address } = useAuth();
  const pathname = usePathname();

  return (
    <nav className="border-b border-gray-800 bg-gray-950/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <a href="/" className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center">
              <svg className="w-4 h-4 text-gray-950" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
            </div>
            <span className="text-base font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              Sentinel Commons
            </span>
          </a>

          <div className="flex items-center gap-4">
            {address && (
              <>
                <NavLink href="/" label="Home" active={pathname === "/"} />
                <NavLink href="/chat" label="Chat" active={pathname === "/chat"} />
                <NavLink href="/governance" label="Governance" active={pathname === "/governance"} />
                <NavLink href="/audit" label="Audit Trail" active={pathname === "/audit"} />
                <div className="w-px h-5 bg-gray-800" />
              </>
            )}
            <ConnectWallet />
          </div>
        </div>
      </div>
    </nav>
  );
}

function NavLink({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <a
      href={href}
      className={`text-sm transition-colors ${
        active ? "text-white font-medium" : "text-gray-400 hover:text-white"
      }`}
    >
      {label}
    </a>
  );
}
