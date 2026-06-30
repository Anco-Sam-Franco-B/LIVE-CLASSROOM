const RATES = { UGX: 1, USD: 3700, EUR: 4000 };
const SYMBOLS = { UGX: 'UGX', USD: '$', EUR: '€' };
const LOCALES = { UGX: 'en-UG', USD: 'en-US', EUR: 'de-DE' };

const STORAGE_KEY = 'preferred_currency';

export function getPreferredCurrency() {
  return localStorage.getItem(STORAGE_KEY) || 'UGX';
}

export function setPreferredCurrency(currency) {
  localStorage.setItem(STORAGE_KEY, currency);
}

export function convertAmount(amountUGX, toCurrency) {
  if (!amountUGX || isNaN(amountUGX)) return 0;
  const rate = RATES[toCurrency] || 1;
  return amountUGX / rate;
}

export function formatCurrency(amountUGX, currency) {
  const cur = currency || getPreferredCurrency();
  const converted = convertAmount(amountUGX, cur);
  const locale = LOCALES[cur] || 'en-US';
  try {
    return new Intl.NumberFormat(locale, { style: 'currency', currency: cur, minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(converted);
  } catch {
    return `${SYMBOLS[cur] || cur} ${converted.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  }
}

export function formatAmount(value, currency) {
  const cur = currency || getPreferredCurrency();
  const converted = convertAmount(value, cur);
  return converted.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

export function getCurrencySymbol(currency) {
  return SYMBOLS[currency] || currency;
}

export const CURRENCIES = Object.keys(RATES);
