import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronRight, DollarSign, Globe, Check, Search } from "lucide-react";
import { useSettings } from "@/contexts/SettingsContext";
import { CURRENCIES } from "@/lib/currencies";
import { LANGUAGES } from "@/lib/languages";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

const CurrencyLanguageSettings = () => {
  const { currency, language, setCurrency, setLanguage, t } = useSettings();
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [currencySearch, setCurrencySearch] = useState("");
  const [languageSearch, setLanguageSearch] = useState("");

  const selectedCurrency = CURRENCIES.find((c) => c.code === currency);
  const selectedLanguage = LANGUAGES.find((l) => l.code === language);

  const filteredCurrencies = CURRENCIES.filter(
    (c) =>
      c.name.toLowerCase().includes(currencySearch.toLowerCase()) ||
      c.code.toLowerCase().includes(currencySearch.toLowerCase())
  );

  const filteredLanguages = LANGUAGES.filter(
    (l) =>
      l.name.toLowerCase().includes(languageSearch.toLowerCase()) ||
      l.nativeName.toLowerCase().includes(languageSearch.toLowerCase())
  );

  const handleCurrencySelect = async (code: string) => {
    await setCurrency(code);
    setShowCurrencyModal(false);
    setCurrencySearch("");
  };

  const handleLanguageSelect = async (code: string) => {
    await setLanguage(code);
    setShowLanguageModal(false);
    setLanguageSearch("");
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="bg-card rounded-2xl border border-border overflow-hidden"
      >
        {/* Currency Setting */}
        <button
          onClick={() => setShowCurrencyModal(true)}
          className="w-full flex items-center gap-4 p-4 hover:bg-secondary/30 transition-colors border-b border-border"
        >
          <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-foreground" />
          </div>
          <div className="flex-1 text-left">
            <p className="font-medium text-foreground">{t("currency")}</p>
            <p className="text-sm text-muted-foreground">
              {selectedCurrency
                ? `${selectedCurrency.symbol} ${selectedCurrency.name}`
                : "USD"}
            </p>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </button>

        {/* Language Setting */}
        <button
          onClick={() => setShowLanguageModal(true)}
          className="w-full flex items-center gap-4 p-4 hover:bg-secondary/30 transition-colors"
        >
          <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
            <Globe className="w-5 h-5 text-foreground" />
          </div>
          <div className="flex-1 text-left">
            <p className="font-medium text-foreground">{t("language")}</p>
            <p className="text-sm text-muted-foreground">
              {selectedLanguage
                ? `${selectedLanguage.nativeName} (${selectedLanguage.name})`
                : "English"}
            </p>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </button>
      </motion.div>

      {/* Currency Selection Modal */}
      <Dialog open={showCurrencyModal} onOpenChange={setShowCurrencyModal}>
        <DialogContent className="sm:max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              {t("selectCurrency")}
            </DialogTitle>
          </DialogHeader>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={t("search")}
              value={currencySearch}
              onChange={(e) => setCurrencySearch(e.target.value)}
              className="pl-10 bg-secondary border-border"
            />
          </div>
          <ScrollArea className="h-[400px]">
            <div className="space-y-1">
              {filteredCurrencies.map((curr) => (
                <button
                  key={curr.code}
                  onClick={() => handleCurrencySelect(curr.code)}
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-secondary transition-colors"
                >
                  <span className="w-8 text-lg font-medium text-muted-foreground">
                    {curr.symbol}
                  </span>
                  <div className="flex-1 text-left">
                    <p className="font-medium text-foreground">{curr.name}</p>
                    <p className="text-sm text-muted-foreground">{curr.code}</p>
                  </div>
                  {currency === curr.code && (
                    <Check className="w-5 h-5 text-primary" />
                  )}
                </button>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Language Selection Modal */}
      <Dialog open={showLanguageModal} onOpenChange={setShowLanguageModal}>
        <DialogContent className="sm:max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              {t("selectLanguage")}
            </DialogTitle>
          </DialogHeader>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={t("search")}
              value={languageSearch}
              onChange={(e) => setLanguageSearch(e.target.value)}
              className="pl-10 bg-secondary border-border"
            />
          </div>
          <ScrollArea className="h-[400px]">
            <div className="space-y-1">
              {filteredLanguages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => handleLanguageSelect(lang.code)}
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-secondary transition-colors"
                >
                  <div className="flex-1 text-left">
                    <p className="font-medium text-foreground">
                      {lang.nativeName}
                    </p>
                    <p className="text-sm text-muted-foreground">{lang.name}</p>
                  </div>
                  {language === lang.code && (
                    <Check className="w-5 h-5 text-primary" />
                  )}
                </button>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CurrencyLanguageSettings;
