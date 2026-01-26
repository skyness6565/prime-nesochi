import { motion } from "framer-motion";
import { ArrowUpRight, ArrowDownLeft, QrCode, RefreshCw, Bell } from "lucide-react";
import { useState } from "react";
import SendModal from "./SendModal";
import ReceiveModal from "./ReceiveModal";
import SwapModal from "./SwapModal";
import PriceAlertModal from "./PriceAlertModal";

const QuickActions = () => {
  const [sendOpen, setSendOpen] = useState(false);
  const [receiveOpen, setReceiveOpen] = useState(false);
  const [swapOpen, setSwapOpen] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);

  const actions = [
    { 
      icon: ArrowUpRight, 
      label: "Send", 
      color: "bg-primary",
      onClick: () => setSendOpen(true)
    },
    { 
      icon: ArrowDownLeft, 
      label: "Receive", 
      color: "bg-success",
      onClick: () => setReceiveOpen(true)
    },
    { 
      icon: RefreshCw, 
      label: "Swap", 
      color: "bg-secondary",
      onClick: () => setSwapOpen(true)
    },
    { 
      icon: Bell, 
      label: "Alerts", 
      color: "bg-secondary",
      onClick: () => setAlertOpen(true)
    },
    { 
      icon: QrCode, 
      label: "Scan", 
      color: "bg-secondary",
      onClick: () => {}
    },
  ];

  return (
    <>
      <div className="grid grid-cols-5 gap-2">
        {actions.map((action, index) => (
          <motion.button
            key={action.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={action.onClick}
            className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all duration-200 active:scale-95"
          >
            <div className={`w-11 h-11 rounded-full ${action.color} flex items-center justify-center`}>
              <action.icon className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xs font-medium text-foreground">{action.label}</span>
          </motion.button>
        ))}
      </div>

      <SendModal open={sendOpen} onOpenChange={setSendOpen} />
      <ReceiveModal open={receiveOpen} onOpenChange={setReceiveOpen} />
      <SwapModal open={swapOpen} onOpenChange={setSwapOpen} />
      <PriceAlertModal open={alertOpen} onOpenChange={setAlertOpen} />
    </>
  );
};

export default QuickActions;
