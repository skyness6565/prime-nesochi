import { motion } from "framer-motion";
import { ArrowUpRight, ArrowDownLeft, QrCode, RefreshCw, CreditCard, MoreHorizontal } from "lucide-react";
import { useState } from "react";
import SendModal from "./SendModal";
import ReceiveModal from "./ReceiveModal";

const QuickActions = () => {
  const [sendOpen, setSendOpen] = useState(false);
  const [receiveOpen, setReceiveOpen] = useState(false);

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
      color: "bg-highlight",
      onClick: () => setReceiveOpen(true)
    },
    { 
      icon: QrCode, 
      label: "Scan", 
      color: "bg-secondary",
      onClick: () => {}
    },
    { 
      icon: RefreshCw, 
      label: "Swap", 
      color: "bg-secondary",
      onClick: () => {}
    },
    { 
      icon: CreditCard, 
      label: "Buy", 
      color: "bg-secondary",
      onClick: () => {}
    },
    { 
      icon: MoreHorizontal, 
      label: "More", 
      color: "bg-secondary",
      onClick: () => {}
    },
  ];

  return (
    <>
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
        {actions.map((action, index) => (
          <motion.button
            key={action.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={action.onClick}
            className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all duration-200 active:scale-95"
          >
            <div className={`w-12 h-12 rounded-full ${action.color} flex items-center justify-center`}>
              <action.icon className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-sm font-medium text-foreground">{action.label}</span>
          </motion.button>
        ))}
      </div>

      <SendModal open={sendOpen} onOpenChange={setSendOpen} />
      <ReceiveModal open={receiveOpen} onOpenChange={setReceiveOpen} />
    </>
  );
};

export default QuickActions;
