import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiFetch } from '../api';

const CurrencyContext = createContext();

const DEFAULT_RATES = {
  USD: { symbol: '$', rateAgainstUSD: 1.0 },
  EUR: { symbol: '€', rateAgainstUSD: 0.92 },
  GBP: { symbol: '£', rateAgainstUSD: 0.79 },
  INR: { symbol: '₹', rateAgainstUSD: 83.2 },
  JPY: { symbol: '¥', rateAgainstUSD: 155.0 },
  CAD: { symbol: 'CA$', rateAgainstUSD: 1.36 }
};

export function CurrencyProvider({ children }) {
  const [currency, setCurrency] = useState(localStorage.getItem('gt_currency') || 'USD');
  const [rates, setRates] = useState(DEFAULT_RATES);

  useEffect(() => {
    const fetchRates = async () => {
      try {
        const res = await apiFetch('/currency/rates');
        if (res.rates && Array.isArray(res.rates)) {
          const map = {};
          res.rates.forEach((r) => {
            map[r.code] = { symbol: r.symbol, rateAgainstUSD: r.rateAgainstUSD };
          });
          setRates(map);
        }
      } catch (err) {
        console.error('Failed to fetch currency rates, using fallback:', err);
      }
    };
    fetchRates();
  }, []);

  const changeCurrency = (code) => {
    setCurrency(code);
    localStorage.setItem('gt_currency', code);
  };

  const formatCurrency = (amountUSD = 0) => {
    const rateInfo = rates[currency] || DEFAULT_RATES.USD;
    const converted = amountUSD * rateInfo.rateAgainstUSD;

    const formattedNum = converted.toLocaleString(undefined, {
      minimumFractionDigits: currency === 'JPY' ? 0 : 2,
      maximumFractionDigits: currency === 'JPY' ? 0 : 2
    });

    return `${rateInfo.symbol}${formattedNum}`;
  };

  return (
    <CurrencyContext.Provider value={{ currency, changeCurrency, rates, formatCurrency }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  return useContext(CurrencyContext);
}
