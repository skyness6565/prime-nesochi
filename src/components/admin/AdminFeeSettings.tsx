import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Percent, DollarSign, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useAdmin, AppSettings } from "@/hooks/useAdmin";

interface AdminFeeSettingsProps {
  settings?: AppSettings;
}

const AdminFeeSettings = ({ settings }: AdminFeeSettingsProps) => {
  const { updateFee, isUpdatingFee } = useAdmin();
  const [percentage, setPercentage] = useState(2);
  const [minFeeUsd, setMinFeeUsd] = useState(0.5);

  useEffect(() => {
    if (settings?.transaction_fee) {
      setPercentage(settings.transaction_fee.percentage * 100);
      setMinFeeUsd(settings.transaction_fee.min_fee_usd);
    }
  }, [settings]);

  const handleSave = () => {
    updateFee({
      percentage: percentage / 100,
      minFeeUsd,
    });
  };

  const hasChanges = settings?.transaction_fee && (
    percentage !== settings.transaction_fee.percentage * 100 ||
    minFeeUsd !== settings.transaction_fee.min_fee_usd
  );

  return (
    <div className="space-y-6">
      {/* Transaction Fee Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-xl border border-border p-6 space-y-6"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
            <Percent className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Transaction Fee</h3>
            <p className="text-sm text-muted-foreground">
              Fee applied to all transactions
            </p>
          </div>
        </div>

        {/* Percentage Slider */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Fee Percentage</Label>
            <span className="text-2xl font-bold text-foreground">{percentage}%</span>
          </div>
          <Slider
            value={[percentage]}
            onValueChange={([value]) => setPercentage(value)}
            min={0}
            max={10}
            step={0.1}
            className="py-4"
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>0%</span>
            <span>5%</span>
            <span>10%</span>
          </div>
        </div>

        {/* Minimum Fee */}
        <div className="space-y-2">
          <Label>Minimum Fee (USD)</Label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="number"
              value={minFeeUsd}
              onChange={(e) => setMinFeeUsd(parseFloat(e.target.value) || 0)}
              min={0}
              step={0.1}
              className="pl-10 bg-secondary border-border"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Minimum fee charged regardless of transaction size
          </p>
        </div>

        {/* Preview */}
        <div className="p-4 bg-secondary rounded-lg space-y-2">
          <p className="text-sm font-medium text-foreground">Fee Preview</p>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">$100 transaction:</span>
              <span className="text-foreground">
                ${Math.max(100 * (percentage / 100), minFeeUsd).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">$1000 transaction:</span>
              <span className="text-foreground">
                ${Math.max(1000 * (percentage / 100), minFeeUsd).toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <Button
          onClick={handleSave}
          disabled={!hasChanges || isUpdatingFee}
          className="w-full"
        >
          <Save className="w-4 h-4 mr-2" />
          {isUpdatingFee ? "Saving..." : "Save Changes"}
        </Button>
      </motion.div>

      {/* Quick Presets */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-card rounded-xl border border-border p-4"
      >
        <p className="text-sm font-medium text-foreground mb-3">Quick Presets</p>
        <div className="flex flex-wrap gap-2">
          {[
            { label: "No Fee", percentage: 0, min: 0 },
            { label: "Low (1%)", percentage: 1, min: 0.25 },
            { label: "Standard (2%)", percentage: 2, min: 0.5 },
            { label: "High (5%)", percentage: 5, min: 1 },
          ].map((preset) => (
            <Button
              key={preset.label}
              variant="outline"
              size="sm"
              onClick={() => {
                setPercentage(preset.percentage);
                setMinFeeUsd(preset.min);
              }}
              className={
                percentage === preset.percentage && minFeeUsd === preset.min
                  ? "border-primary text-primary"
                  : ""
              }
            >
              {preset.label}
            </Button>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default AdminFeeSettings;
