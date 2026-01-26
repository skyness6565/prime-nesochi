import { useState } from "react";
import { Settings, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";

interface SlippageSettingsProps {
  slippage: number;
  onSlippageChange: (value: number) => void;
}

const PRESET_OPTIONS = [0.1, 0.5, 1];

const SlippageSettings = ({ slippage, onSlippageChange }: SlippageSettingsProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [customValue, setCustomValue] = useState("");
  const [isCustom, setIsCustom] = useState(!PRESET_OPTIONS.includes(slippage));

  const handlePresetClick = (value: number) => {
    setIsCustom(false);
    setCustomValue("");
    onSlippageChange(value);
  };

  const handleCustomChange = (value: string) => {
    setCustomValue(value);
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue > 0 && numValue <= 50) {
      setIsCustom(true);
      onSlippageChange(numValue);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg hover:bg-secondary transition-colors"
      >
        <Settings className="w-5 h-5 text-muted-foreground" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="absolute right-0 top-full mt-2 w-72 bg-card border border-border rounded-xl p-4 shadow-lg z-50"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground">Slippage Tolerance</h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded hover:bg-secondary transition-colors"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>

              <p className="text-sm text-muted-foreground mb-3">
                Your transaction will revert if the price changes more than this percentage.
              </p>

              <div className="flex gap-2 mb-3">
                {PRESET_OPTIONS.map((value) => (
                  <button
                    key={value}
                    onClick={() => handlePresetClick(value)}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                      slippage === value && !isCustom
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-foreground hover:bg-secondary/80"
                    }`}
                  >
                    {value}%
                  </button>
                ))}
              </div>

              <div className="relative">
                <Input
                  type="number"
                  placeholder="Custom"
                  value={customValue}
                  onChange={(e) => handleCustomChange(e.target.value)}
                  className={`pr-8 ${isCustom ? "border-primary" : ""}`}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  %
                </span>
              </div>

              {slippage > 5 && (
                <p className="text-sm text-warning mt-2">
                  ⚠️ High slippage increases risk of unfavorable rates
                </p>
              )}

              {slippage < 0.1 && (
                <p className="text-sm text-warning mt-2">
                  ⚠️ Low slippage may cause transaction to fail
                </p>
              )}

              <div className="mt-4 pt-3 border-t border-border">
                <p className="text-sm text-muted-foreground">
                  Current: <span className="text-foreground font-medium">{slippage}%</span>
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SlippageSettings;
