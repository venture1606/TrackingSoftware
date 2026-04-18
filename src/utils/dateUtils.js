/**
 * Formats an epoch timestamp into a human-readable date string (DD/MM/YYYY).
 * @param {string|number} val - The epoch timestamp to format.
 * @returns {string} The formatted date string or '-' if invalid.
 */
export const formatEpochDate = (val) => {
  if (!val || isNaN(Number(val))) return val || "-";
  return new Date(Number(val)).toLocaleDateString("en-GB");
};
