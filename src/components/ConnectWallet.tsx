"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { LogIn, LogOut, CheckCircle, AlertCircle, Loader2, Building2, ChevronDown } from "lucide-react";

export const FLOORS = [
  { id: 2, name: "Main Stage" },
  { id: 4, name: "Robotics & Hard Tech" },
  { id: 6, name: "Arts & Music" },
  { id: 7, name: "Frontier Makerspace" },
  { id: 8, name: "Neuro & Biotech" },
  { id: 9, name: "AI & Autonomous Systems" },
  { id: 11, name: "Longevity" },
  { id: 12, name: "Ethereum & Decentralized Tech" },
  { id: 14, name: "Human Flourishing" },
  { id: 16, name: "D/acc" },
] as const;

export function ConnectWallet() {
  const { address, isVerified, isLoading, floor, error, connect, disconnect, setFloor } = useAuth();
  const [inputAddr, setInputAddr] = useState("");
  const [showFloors, setShowFloors] = useState(false);

  if (address) {
    const floorName = FLOORS.find((f) => f.id === floor)?.name;

    return (
      <div className="flex items-center gap-2 relative">
        {isVerified ? (
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-400/10 border border-emerald-400/20 rounded-lg">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-xs text-emerald-400 font-medium">
              {address.slice(0, 6)}...{address.slice(-4)}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-yellow-400/10 border border-yellow-400/20 rounded-lg">
            <AlertCircle className="w-3.5 h-3.5 text-yellow-400" />
            <span className="text-xs text-yellow-400">Unverified</span>
          </div>
        )}

        <button
          onClick={() => setShowFloors(!showFloors)}
          className="flex items-center gap-1 px-2.5 py-1 bg-gray-800 border border-gray-700 rounded-lg text-xs text-gray-300 hover:text-white transition-colors"
        >
          <Building2 className="w-3.5 h-3.5" />
          {floorName ? `F${floor}` : "Floor"}
          <ChevronDown className="w-3 h-3" />
        </button>

        <button
          onClick={disconnect}
          className="p-1 text-gray-500 hover:text-white transition-colors"
          title="Disconnect"
        >
          <LogOut className="w-3.5 h-3.5" />
        </button>

        {showFloors && (
          <div className="absolute top-10 right-0 z-50 bg-gray-900 border border-gray-700 rounded-xl p-2 shadow-2xl w-56 max-h-72 overflow-y-auto">
            <div className="text-[10px] text-gray-500 uppercase tracking-wider px-2 py-1 mb-1">
              Select your floor
            </div>
            {FLOORS.map((f) => (
              <button
                key={f.id}
                onClick={() => {
                  setFloor(f.id);
                  setShowFloors(false);
                }}
                className={`w-full text-left px-2 py-1.5 text-xs rounded-lg transition-colors ${
                  floor === f.id
                    ? "bg-emerald-400/10 text-emerald-400"
                    : "text-gray-300 hover:bg-gray-800"
                }`}
              >
                <span className="text-gray-500 mr-1.5">F{f.id}</span>
                {f.name}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <input
        type="text"
        value={inputAddr}
        onChange={(e) => setInputAddr(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && connect(inputAddr)}
        placeholder="0x... from frontier.human.tech"
        className="w-52 bg-gray-900 border border-gray-700 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-emerald-400/50 placeholder:text-gray-600"
      />
      <button
        onClick={() => connect(inputAddr)}
        disabled={isLoading || !inputAddr.trim()}
        className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-400/20 border border-emerald-400/30 rounded-lg text-xs text-emerald-400 hover:bg-emerald-400/30 disabled:opacity-50 transition-colors"
      >
        {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <LogIn className="w-3.5 h-3.5" />}
        Connect
      </button>
      {error && (
        <span className="text-[10px] text-red-400 max-w-[200px] truncate" title={error}>
          {error}
        </span>
      )}
    </div>
  );
}
