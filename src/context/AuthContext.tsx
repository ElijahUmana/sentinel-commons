"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type UserRole = "member" | "lead";

interface AuthState {
  address: string | null;
  isVerified: boolean;
  isLoading: boolean;
  floor: number | null;
  role: UserRole | null;
  error: string | null;
}

interface AuthContextType extends AuthState {
  connect: (address: string) => Promise<void>;
  disconnect: () => void;
  setFloor: (floor: number) => void;
  setRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

async function checkHolonymSBT(address: string): Promise<boolean> {
  // Try multiple Holonym verification endpoints
  const endpoints = [
    `https://api.holonym.io/sybil-resistance/biometrics/optimism?user=${address}&action-id=123456789`,
    `https://api.holonym.io/sybil-resistance/gov-id/optimism?user=${address}&action-id=123456789`,
  ];

  for (const url of endpoints) {
    try {
      const res = await fetch(url);
      const data = await res.json();
      if (data.result === true) return true;
    } catch {}
  }

  // Fallback: check Optimism directly for Holonym V3 NFT transfers
  try {
    const ethRes = await fetch(
      `https://api-optimistic.etherscan.io/api?module=account&action=tokennfttx&contractaddress=0xef59aC90646fc09690ed4144741f3A884282ee77&address=${address}&page=1&offset=5&sort=desc`
    );
    const ethData = await ethRes.json();
    if (ethData.result && Array.isArray(ethData.result) && ethData.result.length > 0) {
      return true;
    }
  } catch {}

  return false;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    address: null,
    isVerified: false,
    isLoading: false,
    floor: null,
    role: null,
    error: null,
  });

  // Restore from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("sentinel-auth");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setState((prev) => ({ ...prev, ...parsed, isLoading: false }));
        // Re-verify in background
        if (parsed.address) {
          checkHolonymSBT(parsed.address).then((verified) => {
            setState((prev) => ({ ...prev, isVerified: verified }));
          });
        }
      } catch {}
    }
  }, []);

  async function connect(address: string) {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    const addr = address.trim().toLowerCase();
    if (!addr.startsWith("0x") || addr.length !== 42) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: "Invalid Ethereum address. Must start with 0x and be 42 characters.",
      }));
      return;
    }

    const verified = await checkHolonymSBT(addr);

    const newState: AuthState = {
      address: addr,
      isVerified: verified,
      isLoading: false,
      floor: state.floor,
      role: state.role,
      error: verified
        ? null
        : "No Holonym SBT found on Optimism. Verify your humanity at frontier.human.tech first.",
    };

    setState(newState);
    localStorage.setItem("sentinel-auth", JSON.stringify(newState));
  }

  function disconnect() {
    setState({
      address: null,
      isVerified: false,
      isLoading: false,
      floor: null,
      role: null,
      error: null,
    });
    localStorage.removeItem("sentinel-auth");
  }

  function setFloor(floor: number) {
    setState((prev) => {
      const newState = { ...prev, floor };
      localStorage.setItem("sentinel-auth", JSON.stringify(newState));
      return newState;
    });
  }

  function setRole(role: UserRole) {
    setState((prev) => {
      const newState = { ...prev, role };
      localStorage.setItem("sentinel-auth", JSON.stringify(newState));
      return newState;
    });
  }

  return (
    <AuthContext.Provider value={{ ...state, connect, disconnect, setFloor, setRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
