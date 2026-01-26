import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useProfile } from "@/hooks/useProfile";
import { translate, TranslationKey } from "@/lib/translations";
import { formatCurrency as formatCurrencyUtil, getCurrencyByCode } from "@/lib/currencies";

interface SettingsContextType {
  currency: string;
  language: string;
  setCurrency: (currency: string) => Promise<void>;
  setLanguage: (language: string) => Promise<void>;
  t: (key: TranslationKey) => string;
  formatAmount: (amount: number) => string;
  currencySymbol: string;
  isLoading: boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { profile, updateProfile, loading } = useProfile();
  const [currency, setCurrencyState] = useState("USD");
  const [language, setLanguageState] = useState("en");
  const [exchangeRates, setExchangeRates] = useState<Record<string, number>>({});

  // Load settings from profile
  useEffect(() => {
    if (profile) {
      if (profile.preferred_currency) {
        setCurrencyState(profile.preferred_currency);
      }
      if (profile.preferred_language) {
        setLanguageState(profile.preferred_language);
      }
    }
  }, [profile]);

  // Fetch exchange rates (simplified - using approximate rates)
  useEffect(() => {
    // In a real app, you'd fetch these from an API
    // Using approximate rates for demo purposes
    setExchangeRates({
      USD: 1,
      EUR: 0.92,
      GBP: 0.79,
      JPY: 149.50,
      CNY: 7.24,
      AUD: 1.53,
      CAD: 1.36,
      CHF: 0.88,
      HKD: 7.82,
      SGD: 1.34,
      INR: 83.12,
      KRW: 1320.50,
      MXN: 17.15,
      BRL: 4.97,
      RUB: 89.50,
      ZAR: 18.65,
      TRY: 30.25,
      SEK: 10.42,
      NOK: 10.65,
      DKK: 6.87,
      PLN: 3.98,
      THB: 35.20,
      IDR: 15650,
      MYR: 4.72,
      PHP: 55.80,
      VND: 24350,
      AED: 3.67,
      SAR: 3.75,
      NGN: 1550,
      EGP: 30.90,
      PKR: 278.50,
      BDT: 109.80,
      CLP: 878.50,
      COP: 3925,
      ARS: 815.50,
      PEN: 3.72,
      ILS: 3.65,
      CZK: 22.85,
      HUF: 355.20,
      RON: 4.57,
      UAH: 37.25,
      KES: 153.50,
      GHS: 12.35,
      TWD: 31.50,
      NZD: 1.64,
    });
  }, []);

  const setCurrency = useCallback(async (newCurrency: string) => {
    setCurrencyState(newCurrency);
    await updateProfile({ preferred_currency: newCurrency });
  }, [updateProfile]);

  const setLanguage = useCallback(async (newLanguage: string) => {
    setLanguageState(newLanguage);
    await updateProfile({ preferred_language: newLanguage });
  }, [updateProfile]);

  const t = useCallback((key: TranslationKey) => {
    return translate(key, language);
  }, [language]);

  const formatAmount = useCallback((amountInUSD: number) => {
    const rate = exchangeRates[currency] || 1;
    const convertedAmount = amountInUSD * rate;
    return formatCurrencyUtil(convertedAmount, currency);
  }, [currency, exchangeRates]);

  const currencySymbol = getCurrencyByCode(currency)?.symbol || "$";

  return (
    <SettingsContext.Provider
      value={{
        currency,
        language,
        setCurrency,
        setLanguage,
        t,
        formatAmount,
        currencySymbol,
        isLoading: loading,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
};
