export function paiseToRupees(amountInPaise: number) {
  return amountInPaise / 100;
}

export function rupeesToPaise(amountInRupees: number) {
  if (!Number.isInteger(amountInRupees)) {
    throw new Error('Amount must be a whole number of rupees');
  }

  return amountInRupees * 100;
}

export function formatINR(amountInPaise: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(paiseToRupees(amountInPaise));
}
