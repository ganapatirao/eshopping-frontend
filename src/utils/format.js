const inrFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

// Format a number as Indian Rupee, e.g. 1999.5 -> "₹2,000"
export const formatPrice = (amount) => {
  const num = Number(amount);
  if (Number.isNaN(num)) return inrFormatter.format(0);
  return inrFormatter.format(num);
};

export const CURRENCY_SYMBOL = '₹';
