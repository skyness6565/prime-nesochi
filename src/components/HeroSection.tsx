import { motion } from "framer-motion";
import { Gift, Coins, DollarSign } from "lucide-react";

const HeroSection = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="text-center lg:text-left lg:flex-1"
    >
      <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
        Unlock <span className="text-highlight">30,000 USDT</span> in welcome rewards
      </h1>
      
      <div className="relative w-64 h-48 mx-auto lg:mx-0 my-8">
        <motion.div 
          animate={{ 
            y: [0, -10, 0],
          }}
          transition={{ 
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="relative"
        >
          {/* Gift Box */}
          <div className="w-32 h-32 mx-auto border-2 border-foreground rounded-lg relative">
            {/* Ribbons */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-full bg-transparent border-x-2 border-foreground" />
            <div className="absolute top-1/2 left-0 -translate-y-1/2 w-full h-4 bg-transparent border-y-2 border-foreground" />
            
            {/* Bow */}
            <div className="absolute -top-6 left-1/2 -translate-x-1/2">
              <div className="flex gap-1">
                <div className="w-6 h-8 border-2 border-foreground rounded-full" />
                <div className="w-6 h-8 border-2 border-foreground rounded-full" />
              </div>
            </div>
          </div>
          
          {/* Floating coins */}
          <motion.div 
            animate={{ 
              y: [0, -5, 0],
              rotate: [0, 10, 0]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.2
            }}
            className="absolute -top-4 -left-4 w-12 h-12 bg-primary rounded-full flex items-center justify-center"
          >
            <DollarSign className="w-6 h-6 text-primary-foreground" />
          </motion.div>
          
          <motion.div 
            animate={{ 
              y: [0, -8, 0],
              rotate: [0, -10, 0]
            }}
            transition={{ 
              duration: 2.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.5
            }}
            className="absolute -bottom-4 -right-4 w-14 h-14 bg-highlight rounded-full flex items-center justify-center"
          >
            <Coins className="w-7 h-7 text-accent-foreground" />
          </motion.div>
          
          <motion.div 
            animate={{ 
              y: [0, -6, 0],
            }}
            transition={{ 
              duration: 2.2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.8
            }}
            className="absolute top-1/2 -right-8 w-8 h-8 border-2 border-foreground rounded-sm flex items-center justify-center"
          >
            <span className="text-foreground text-xs">✦</span>
          </motion.div>
        </motion.div>
      </div>
      
      <p className="text-muted-foreground text-sm md:text-base max-w-md mx-auto lg:mx-0">
        Earn crypto at every step: sign up, deposit, and trade to claim your rewards.
      </p>
      
      <button className="text-foreground underline text-sm mt-4 hover:text-highlight transition-colors">
        Terms and Conditions
      </button>
    </motion.div>
  );
};

export default HeroSection;
