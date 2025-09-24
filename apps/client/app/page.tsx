"use client";

import { useState } from "react";
import {
  CupSoda,
  Candy,
  Droplet,
  Check,
  Delete,
  XCircle,
  Loader,
  CreditCard,
  Coins,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

export default function Home() {
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [selectedProduct, setSelectedProduct] = useState<{ nom: string; prix: number } | null>(null);
  const [credit, setCredit] = useState(0);
  const [dispensedProduct, setDispensedProduct] = useState<string | null>(null);

  const playFeedback = (freq: number, duration = 0.15, vibration: number | number[] = 50) => {
    if (navigator.vibrate) navigator.vibrate(vibration);
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  };

  const handleDigit = (digit: string) => {
    if (code.length < 4) {
      setCode((prev) => prev + digit);
      playFeedback(440, 0.1, 30);
    }
  };

  const handleClear = () => {
    setCode("");
    playFeedback(220, 0.15, 80);
  };

  const handleDelete = () => {
    setCode((prev) => prev.slice(0, -1));
    playFeedback(330, 0.15, 80);
  };

  const handleSubmit = async () => {
    if (!code) return;
    setIsLoading(true);
    setStatus("idle");

    try {
      await new Promise((r) => setTimeout(r, 1000));
      const res = await fetch("http://localhost:3001/api/commande", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur serveur");

      setSelectedProduct({
        nom: data.produit.nom,
        prix: data.produit.prix,
      });

      toast.success(`${data.produit.nom} sélectionné`);
    } catch (err: any) {
      toast.error(err.message || "Code invalide");
      setCode("");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInsertCoin = (amount: number) => {
    if (!selectedProduct) return;
    const newCredit = credit + amount;
    setCredit(newCredit);
    if (newCredit >= selectedProduct.prix) {
      toast.success("Paiement accepté !");
      setDispensedProduct(selectedProduct.nom);
      setSelectedProduct(null);
      setCode("");
      setCredit(0);
      setTimeout(() => setDispensedProduct(null), 3500);
    }
  };

  const handleCardPayment = async () => {
    if (!selectedProduct) return;
    setIsLoading(true);
    toast("Transaction CB en cours...");
    await new Promise((r) => setTimeout(r, 2000));
    toast.success("Paiement accepté !");
    setDispensedProduct(selectedProduct.nom);
    setSelectedProduct(null);
    setCode("");
    setCredit(0);
    setIsLoading(false);
    setTimeout(() => setDispensedProduct(null), 3500);
  };

  const getButtonClasses = () => {
    if (status === "success") return "bg-green-600 hover:bg-green-700";
    if (status === "error") return "bg-red-600 hover:bg-red-700";
    if (isLoading) return "bg-gray-600 hover:bg-gray-600";
    return "bg-green-600 hover:bg-green-700";
  };

  const getProductIcon = () => {
    if (!dispensedProduct) return null;
    if (dispensedProduct.includes("Coca"))
      return <CupSoda className="w-16 h-16 text-blue-400" />;
    if (dispensedProduct.includes("Snickers"))
      return <Candy className="w-16 h-16 text-pink-400" />;
    if (dispensedProduct.includes("Eau"))
      return <Droplet className="w-16 h-16 text-teal-400" />;
    return <Check className="w-16 h-16 text-green-400" />;
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex items-center justify-center p-4 relative overflow-hidden">
      <style jsx global>{`
        @keyframes shake {
          0%,
          100% {
            transform: translateX(0);
          }
          20%,
          60% {
            transform: translateX(-6px);
          }
          40%,
          80% {
            transform: translateX(6px);
          }
        }
        .animate-shake {
          animation: shake 0.4s ease-in-out;
        }
        @keyframes dropProduct {
          0% {
            transform: translateY(-150%);
            opacity: 0;
          }
          20% {
            opacity: 1;
          }
          80% {
            transform: translateY(80vh);
            opacity: 1;
          }
          90% {
            transform: translateY(78vh);
          }
          100% {
            transform: translateY(82vh);
            opacity: 0;
          }
        }
        .animate-dropProduct {
          animation: dropProduct 3.5s ease-in-out forwards;
        }
      `}</style>

      {dispensedProduct && (
        <div className="absolute top-10 left-1/2 -translate-x-1/2 animate-dropProduct flex flex-col items-center">
          {getProductIcon()}
          <span className="text-white text-sm mt-2 opacity-80">Produit délivré</span>
        </div>
      )}

      {!selectedProduct ? (
        <Card className="w-full max-w-sm rounded-3xl shadow-2xl border border-gray-700 bg-gray-900 text-white">
          <CardContent className="p-6 flex flex-col items-center space-y-6">
            <h1 className="text-2xl font-extrabold tracking-wide">Distributeur</h1>

            <div className="bg-black/80 rounded-lg py-3 px-6 text-2xl font-mono tracking-[0.5em] text-green-400 shadow-inner border border-green-600 w-full text-center">
              {code || "----"}
            </div>

            <div className="grid grid-cols-3 gap-3 w-full">
              {[..."123456789"].map((n) => (
                <Button
                  key={n}
                  onClick={() => handleDigit(n)}
                  className="py-6 text-lg font-bold rounded-xl bg-gray-700 hover:bg-gray-600"
                  disabled={isLoading}
                >
                  {n}
                </Button>
              ))}
              <Button
                onClick={handleClear}
                className="py-6 text-lg font-bold rounded-xl bg-red-600 hover:bg-red-700"
                disabled={isLoading || code.length === 0}
              >
                <XCircle className="w-5 h-5" />
              </Button>
              <Button
                onClick={() => handleDigit("0")}
                className="py-6 text-lg font-bold rounded-xl bg-gray-700 hover:bg-gray-600"
                disabled={isLoading}
              >
                0
              </Button>
              <Button
                onClick={handleDelete}
                className="py-6 text-lg font-bold rounded-xl bg-yellow-500 hover:bg-yellow-600 text-black"
                disabled={isLoading || code.length === 0}
              >
                <Delete className="w-5 h-5" />
              </Button>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={isLoading || code.length !== 4}
              className={`w-full py-6 text-lg font-bold flex items-center justify-center gap-2 rounded-xl transition-colors duration-300 ${getButtonClasses()} ${status === "error" ? "animate-shake" : ""
                }`}
            >
              {isLoading ? (
                <>
                  <Loader className="w-6 h-6 animate-spin" />
                  Patientez...
                </>
              ) : (
                <>
                  <Check className="w-6 h-6" />
                  Valider
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="w-full max-w-sm rounded-3xl shadow-2xl border border-gray-700 bg-gray-900 text-white">
          <CardContent className="p-6 flex flex-col items-center space-y-6">
            <h2 className="text-xl font-bold">{selectedProduct.nom}</h2>
            <p>Prix : {selectedProduct.prix.toFixed(2)} €</p>
            <p>Crédit inséré : {credit.toFixed(2)} €</p>

            <div className="flex gap-3">
              <Button
                onClick={() => handleInsertCoin(0.5)}
                className="bg-gray-700 hover:bg-gray-600"
              >
                <Coins className="w-5 h-5 mr-2" /> +0.50€
              </Button>
              <Button
                onClick={() => handleInsertCoin(1)}
                className="bg-gray-700 hover:bg-gray-600"
              >
                <Coins className="w-5 h-5 mr-2" /> +1.00€
              </Button>
            </div>

            <Button
              onClick={handleCardPayment}
              disabled={isLoading}
              className="w-full py-4 flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Paiement...
                </>
              ) : (
                <>
                  <CreditCard className="w-5 h-5" />
                  Payer par carte
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}
    </main>
  );
}
