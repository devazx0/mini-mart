import { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { formatNaira, getWallet } from "../api/buyer";
import type { WalletInfo } from "../api/types";
import BuyerShell from "../components/buyer/BuyerShell";

export default function AccountPage() {
  const { user, logout } = useAuth();
  const [wallet, setWallet] = useState<WalletInfo | null>(null);

  useEffect(() => {
    void getWallet().then(setWallet);
  }, []);

  return (
    <BuyerShell title="Account">
      <div className="flex flex-col gap-3 px-4 pt-3">
        <div className="rounded-xl bg-surface-container-low p-3">
          <p className="text-sm font-semibold">
            {user?.firstName} {user?.lastName}
          </p>
          <p className="text-xs text-on-surface-variant">{user?.email}</p>
          <p className="mt-1 text-xs capitalize text-on-surface-variant">Role: {user?.role}</p>
        </div>
        <div className="rounded-xl bg-surface-container-high p-4">
          <p className="text-xs text-on-surface-variant">ApexMarket Wallet Balance</p>
          <p className="font-display text-[24px] font-bold">{formatNaira(wallet?.balance ?? 120000)}</p>
          <p className="mt-1 flex items-center gap-1 text-xs text-secondary">
            <span className="material-symbols-outlined text-[14px]">verified_user</span> Escrow Protected
          </p>
        </div>
        <button
          onClick={() => void logout()}
          className="flex h-11 items-center justify-center gap-2 rounded-xl bg-surface-container text-sm font-medium text-error"
        >
          <span className="material-symbols-outlined text-[20px]">logout</span> Log Out
        </button>
      </div>
    </BuyerShell>
  );
}
