export const MAX_WALLET_TOP_UP_IN_PAISE = 100_000_000;

export function paiseToRupees(amountInPaise: number) {
  return amountInPaise / 100;
}

export function rupeesToPaise(amountInRupees: number) {
  if (!Number.isInteger(amountInRupees)) {
    throw new Error('Amount must be a whole number of rupees');
  }

  return amountInRupees * 100;
}

export function parseRupeeInputToPaise(value: string, maximumInPaise = MAX_WALLET_TOP_UP_IN_PAISE) {
  const normalized = value.trim().replace(/,/g, '');
  const match = /^(\d+)(?:\.(\d{1,2}))?$/.exec(normalized);

  if (!match) {
    return { amountInPaise: null, error: 'Enter a valid rupee amount with up to two decimal places.' };
  }

  const wholeRupees = Number(match[1]);
  const paiseDigits = (match[2] ?? '').padEnd(2, '0');
  const amountInPaise = wholeRupees * 100 + Number(paiseDigits);

  if (!Number.isSafeInteger(amountInPaise) || amountInPaise <= 0) {
    return { amountInPaise: null, error: 'Amount must be greater than ₹0.' };
  }

  if (amountInPaise > maximumInPaise) {
    return { amountInPaise: null, error: `Enter an amount up to ${formatINR(maximumInPaise)}.` };
  }

  return { amountInPaise, error: '' };
}

export function formatINR(amountInPaise: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(paiseToRupees(amountInPaise));
}
