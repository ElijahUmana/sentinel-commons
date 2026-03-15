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
  setFloor: (floor: number | null) => void;
  setRole: (role: UserRole | null) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

async function checkHolonymSBT(address: string): Promise<boolean> {
  // Use our /api/verify endpoint which has the working Optimism RPC scan
  try {
    const res = await fetch(`/api/verify?address=${address}`);
    const data = await res.json();
    return data.verified === true;
  } catch {
    // If API fails, trust the stored verification state
    return false;
  }
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
        // Restore saved state including verification status
        setState((prev) => ({ ...prev, ...parsed, isLoading: false }));
        // Re-verify in background — only UPGRADE from false to true, never downgrade
        if (parsed.address && !parsed.isVerified) {
          checkHolonymSBT(parsed.address).then((verified) => {
            if (verified) {
              setState((prev) => {
                const newState = { ...prev, isVerified: true };
                localStorage.setItem("sentinel-auth", JSON.stringify(newState));
                return newState;
              });
            }
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

  function setFloor(floor: number | null) {
    setState((prev) => {
      const newState = { ...prev, floor };
      localStorage.setItem("sentinel-auth", JSON.stringify(newState));
      return newState;
    });
  }

  function setRole(role: UserRole | null) {
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
