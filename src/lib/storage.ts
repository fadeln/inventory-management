// Utility functions (no longer using localStorage for data)

// Generate unique ID
export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Generate transaction number
export const generateTransactionNumber = (prefix: string): string => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.random().toString(36).substr(2, 4).toUpperCase();
  return `${prefix}-${year}${month}${day}-${random}`;
};

// Get current timestamp
export const getCurrentTimestamp = (): string => {
  return new Date().toISOString();
};
