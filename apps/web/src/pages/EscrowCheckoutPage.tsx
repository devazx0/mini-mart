import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { checkout, formatNaira, getCart, getWallet, lockEscrow } from "../api/buyer";
import type { CartSummary, WalletInfo } from "../api/types";
import BuyerShell from "../components/buyer/BuyerShell";

export default function EscrowCheckoutPage() {
  const navigate = useNavigate();
  const [cart, setCart] = useState<CartSummary | null>(null);
  const [wallet, setWallet] = useState<WalletInfo | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [method, setMethod] = useState<"transfer" | "card" | "wallet">("transfer");
  const [seconds, setSeconds] = useState(29 * 60 + 45);
  const [copied, setCopied] = useState(false);
  const [paying, setPaying] = useState(false);
  const [paid, setPaid] = useState(false);

  useEffect(() => {
    void getCart().then(setCart);
    void getWallet().then(setWallet);
  }, []);

  useEffect(() => {
    if (seconds <= 0) return;
    const t = window.setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => window.clearTimeout(t);
  }, [seconds]);

  const mm = String(Math.floor(Math.max(seconds, 0) / 60)).padStart(2, "0");
  const ss = String(Math.max(seconds, 0) % 60).padStart(2, "0");
  const total = cart?.total ?? 75500;

  async function onPay() {
    setPaying(true);
    try {
      const { order } = await checkout({ address: "Lekki Phase 1, Lagos", paymentMethod: method });
      await lockEscrow(order.id);
      setPaid(true);
      window.setTimeout(() => navigate("/orders"), 900);
    } finally {
      setPaying(false);
    }
  }

  function copyAccount() {
    void navigator.clipboard?.writeText("0123456789").catch(() => undefined);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  const payLabel =
    method === "wallet" ? `Pay ${formatNaira(total)} with Apex Wallet` : method === "card" ? `Pay ${formatNaira(total)} via Card` : `Authorize & Pay ${formatNaira(total)}`;

  return (
    <BuyerShell title="Escrow Checkout" showBack hideNav>
      <div className="flex w-full flex-col pb-6">
        <section className="px-4 pb-1 pt-3">
          <div className="rounded-xl bg-surface-container-lowest p-4 shadow-sm">
            <div className="relative flex items-center justify-between">
              <div className="absolute left-6 right-6 top-1/2 h-0.5 -translate-y-1/2 bg-surface-container" />
              <div className="absolute left-6 right-1/3 top-1/2 h-0.5 -translate-y-1/2 bg-primary" />
              {[
                { label: "Cart", icon: "check", done: true },
                { label: "Delivery", icon: "check", done: true },
                { label: "Payment", icon: "lock", active: true },
                { label: "Verify", icon: "done_all", done: false },
              ].map((s) => (
                <div key={s.label} className="relative z-10 flex flex-col items-center gap-1">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full shadow-sm ${
                      s.active ? "bg-primary text-on-primary ring-4 ring-primary/15" : s.done ? "bg-secondary text-on-secondary" : "bg-surface-container text-on-surface-variant"
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">{s.icon}</span>
                  </div>
                  <span className={`text-[11px] font-medium ${s.active ? "font-semibold text-primary" : "text-on-surface-variant"}`}>{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="flex items-center justify-between px-4 py-1">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-tertiary-fixed px-2.5 py-1 text-[11px] font-medium text-on-tertiary-fixed">
            <span className="h-1.5 w-1.5 animate-ping rounded-full bg-tertiary-container" /> Payment Required
          </div>
          <div className="flex items-center gap-1 text-xs text-on-surface-variant">
            <span className="material-symbols-outlined text-[14px]">shield</span> Apex Escrow v2.4
          </div>
        </section>

        <section className="px-4 py-1">
          <div className="overflow-hidden rounded-xl bg-surface-container-lowest shadow-sm">
            <button onClick={() => setExpanded((v) => !v)} aria-expanded={expanded} className="flex w-full items-center justify-between p-4 text-left">
              <div className="flex min-w-0 items-center gap-2">
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-surface-container text-primary">
                  <span className="material-symbols-outlined text-[20px]">shopping_bag</span>
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[16px] font-semibold">Order Summary</span>
                    <span className="rounded-full bg-surface-container-high px-1.5 py-0.5 text-[11px] font-medium">{cart?.count ?? 2} items</span>
                  </div>
                  <p className="truncate text-xs text-on-surface-variant">Delivery to Lekki Phase 1, Lagos</p>
                </div>
              </div>
              <div className="flex flex-shrink-0 items-center gap-1">
                <span className="text-[16px] font-semibold text-primary">{formatNaira(total)}</span>
                <span className="material-symbols-outlined text-[20px] text-on-surface-variant transition-transform" style={{ transform: expanded ? "rotate(180deg)" : undefined }}>
                  expand_more
                </span>
              </div>
            </button>
            {expanded && (
              <div className="space-y-3 px-4 pb-4">
                {(cart?.items ?? []).map((ci) => (
                  <div key={ci.productId} className="flex items-center justify-between gap-2 pt-1">
                    <div className="flex min-w-0 items-center gap-2">
                      <img src={ci.product.imageUrl} alt="" className="h-12 w-12 flex-shrink-0 rounded-lg bg-surface-container object-cover" />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{ci.product.name}</p>
                        <p className="text-xs text-on-surface-variant">Qty: {ci.qty}</p>
                      </div>
                    </div>
                    <span className="flex-shrink-0 text-[13px] font-semibold">{formatNaira(ci.product.price * ci.qty)}</span>
                  </div>
                ))}
                <div className="space-y-2 rounded-lg bg-surface-container-low p-2 text-[13px]">
                  <div className="flex justify-between text-on-surface-variant">
                    <span>Subtotal</span>
                    <span className="font-medium text-on-surface">{formatNaira(cart?.subtotal ?? 73000)}</span>
                  </div>
                  <div className="flex justify-between text-on-surface-variant">
                    <span>Standard Logistics (Lekki Phase 1)</span>
                    <span className="font-medium text-on-surface">{formatNaira(cart?.shippingFee ?? 2500)}</span>
                  </div>
                  <div className="flex justify-between text-on-surface-variant">
                    <span className="font-medium text-secondary">Buyer Escrow Protection</span>
                    <span className="text-[11px] font-semibold uppercase text-secondary">Free Guarantee</span>
                  </div>
                  <div className="flex items-center justify-between pt-2 text-[16px] font-semibold">
                    <span>Total Amount</span>
                    <span className="font-bold text-primary">{formatNaira(total)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="px-4 py-1">
          <div className="flex items-start gap-2 rounded-xl bg-surface-container-high p-3">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-secondary text-on-secondary">
              <span className="material-symbols-outlined text-[18px]">verified_user</span>
            </div>
            <div className="min-w-0">
              <h4 className="text-sm font-semibold">Escrow Protected Transaction</h4>
              <p className="mt-0.5 text-[13px] leading-snug text-on-surface-variant">
                Funds are held securely and only disbursed to the verified merchant once you receive, unbox, and inspect your order.
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-2 px-4 py-1">
          <div className="flex items-center justify-between">
            <h3 className="text-[16px] font-semibold">Select Payment Method</h3>
            <span className="flex items-center gap-1 text-xs text-secondary">
              <span className="material-symbols-outlined text-[14px]">lock</span> 256-bit Encrypted
            </span>
          </div>

          <div onClick={() => setMethod("transfer")} className="cursor-pointer rounded-xl bg-surface-container-lowest p-4 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-2">
                <div className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full ${method === "transfer" ? "bg-primary" : "bg-surface-container"}`}>
                  <span className={`h-2 w-2 rounded-full ${method === "transfer" ? "bg-on-primary" : "bg-transparent"}`} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">Instant Bank Transfer</span>
                    <span className="rounded bg-secondary-fixed px-1.5 py-0.5 text-[11px] font-medium text-on-secondary-fixed-variant">Paystack Direct</span>
                  </div>
                  <p className="mt-0.5 text-[13px] text-on-surface-variant">Automated settlement via Dedicated Virtual Escrow Account</p>
                </div>
              </div>
              <span className="material-symbols-outlined text-[22px] text-primary">account_balance</span>
            </div>
            {method === "transfer" && (
              <div className="mt-3 space-y-2 rounded-lg bg-surface-container p-3">
                <div className="flex items-center justify-between rounded bg-surface-container-lowest px-2 py-1.5 shadow-sm">
                  <span className="flex items-center gap-1 text-xs text-on-surface-variant">
                    <span className="material-symbols-outlined text-[14px] text-tertiary">timer</span> Transfer Window Valid for:
                  </span>
                  <span className="font-mono text-xs font-semibold text-tertiary-container">
                    {mm}:{ss}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1 text-sm">
                  <div>
                    <span className="text-[11px] font-semibold uppercase text-on-surface-variant">Receiving Bank</span>
                    <p className="font-semibold">Wema Bank</p>
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold uppercase text-on-surface-variant">Account Name</span>
                    <p className="truncate font-semibold">ApexMarket Escrow</p>
                  </div>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-surface-container-lowest p-2 shadow-sm">
                  <div>
                    <span className="text-[11px] uppercase text-on-surface-variant">Dedicated Virtual Account</span>
                    <p className="text-[20px] font-bold tracking-wider">0123456789</p>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); copyAccount(); }} className="flex h-9 items-center gap-1.5 rounded-lg bg-surface-container-highest px-3 text-[11px] font-medium text-primary">
                    <span className="material-symbols-outlined text-[16px]">{copied ? "check" : "content_copy"}</span> {copied ? "Copied!" : "Copy"}
                  </button>
                </div>
              </div>
            )}
          </div>

          <div onClick={() => setMethod("card")} className="cursor-pointer rounded-xl bg-surface-container-lowest p-4 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-2">
                <div className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full ${method === "card" ? "bg-primary" : "bg-surface-container"}`}>
                  <span className={`h-2 w-2 rounded-full ${method === "card" ? "bg-on-primary" : "bg-transparent"}`} />
                </div>
                <div>
                  <span className="text-sm font-semibold">Debit or Credit Card</span>
                  <p className="mt-0.5 text-[13px] text-on-surface-variant">Direct 3D-Secure authenticated checkout</p>
                </div>
              </div>
              <span className="material-symbols-outlined text-[22px] text-on-surface-variant">credit_card</span>
            </div>
            {method === "card" && (
              <div className="mt-3 space-y-2 rounded-lg bg-surface-container-low p-3">
                <input placeholder="e.g. Babatunde Adeleke" className="h-10 w-full rounded-lg bg-surface-container-lowest px-3 text-sm outline-none" />
                <input placeholder="5399 •••• •••• 1289" className="h-10 w-full rounded-lg bg-surface-container-lowest px-3 font-mono text-xs outline-none" />
                <div className="grid grid-cols-2 gap-2">
                  <input placeholder="MM/YY" className="h-10 w-full rounded-lg bg-surface-container-lowest px-3 font-mono text-xs outline-none" />
                  <input placeholder="•••" type="password" maxLength={4} className="h-10 w-full rounded-lg bg-surface-container-lowest px-3 font-mono text-xs outline-none" />
                </div>
              </div>
            )}
          </div>

          <div onClick={() => setMethod("wallet")} className="cursor-pointer rounded-xl bg-surface-container-lowest p-4 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-2">
                <div className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full ${method === "wallet" ? "bg-primary" : "bg-surface-container"}`}>
                  <span className={`h-2 w-2 rounded-full ${method === "wallet" ? "bg-on-primary" : "bg-transparent"}`} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">ApexMarket Wallet</span>
                    <span className="rounded bg-secondary-fixed px-1.5 py-0.5 text-[11px] font-medium text-on-secondary-fixed">1-Click Instant</span>
                  </div>
                  <p className="mt-0.5 text-[13px] text-on-surface-variant">
                    Available Balance: <strong className="font-semibold text-secondary">{formatNaira(wallet?.balance ?? 120000)}</strong>
                  </p>
                </div>
              </div>
              <span className="material-symbols-outlined text-[22px] text-secondary">account_balance_wallet</span>
            </div>
            {method === "wallet" && (
              <div className="mt-3 flex items-center justify-between rounded-lg bg-surface-container-low p-2 text-[13px]">
                <span className="text-on-surface-variant">Remaining after checkout:</span>
                <span className="font-semibold">{formatNaira((wallet?.balance ?? 120000) - total)}</span>
              </div>
            )}
          </div>
        </section>

        <section className="mt-auto space-y-2 bg-surface px-4 pb-4 pt-3">
          <button
            onClick={() => void onPay()}
            disabled={paying}
            className={`flex h-12 w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold shadow-md transition-all active:scale-[0.99] disabled:opacity-70 ${
              paid ? "bg-secondary text-on-secondary" : "bg-primary text-on-primary hover:bg-primary-container"
            }`}
          >
            {paying ? (
              <>
                <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span> Securing Funds in Escrow...
              </>
            ) : paid ? (
              <>
                <span className="material-symbols-outlined text-[20px]">check_circle</span> Payment Escrow Locked!
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[18px]">lock</span> {payLabel}
              </>
            )}
          </button>
          <button onClick={() => navigate(-1)} className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-surface-container text-sm font-medium">
            <span className="material-symbols-outlined text-[18px]">arrow_back</span> Back to Delivery Address
          </button>
          <div className="flex items-center justify-center gap-4 pt-1 text-xs text-on-surface-variant">
            <span>NDPR Compliant</span>
            <span className="h-1 w-1 rounded-full bg-outline-variant" />
            <span>PCI-DSS Level 1</span>
            <span className="h-1 w-1 rounded-full bg-outline-variant" />
            <span>Instant Refund Guarantee</span>
          </div>
        </section>
      </div>
    </BuyerShell>
  );
}
