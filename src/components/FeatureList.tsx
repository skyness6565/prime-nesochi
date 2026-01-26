import { motion } from "framer-motion";
import { Repeat, Shield, CheckCircle } from "lucide-react";

const features = [
  {
    icon: Repeat,
    title: "Trade anytime, anywhere",
    description: (
      <>
        Trade <span className="text-highlight font-semibold">400+</span> crypto futures with up to{" "}
        <span className="text-highlight font-semibold">500x</span> leverage. Access the hottest coins, 
        tokenized stocks, and trending meme coins—all from our app and web platform, wherever you are.
      </>
    ),
  },
  {
    icon: Shield,
    title: "A secure platform",
    description: (
      <>
        Trusted by millions for <span className="text-highlight font-semibold">14 years</span>. 
        The historical number One Global Exchange with 24/7 support & the best security in the market. 
        Safe, stable, and reliable.
      </>
    ),
  },
];

const FeatureList = () => {
  return (
    <div className="space-y-8 mt-8 lg:mt-12">
      {features.map((feature, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
          className="flex gap-4"
        >
          <div className="flex-shrink-0 w-12 h-12 rounded-full border border-border flex items-center justify-center">
            <feature.icon className="w-5 h-5 text-foreground" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {feature.description}
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default FeatureList;
