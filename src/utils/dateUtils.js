/**
 * Formats an epoch timestamp into a human-readable date string (DD/MM/YYYY).
 * @param {string|number} val - The epoch timestamp to format.
 * @returns {string} The formatted date string or '-' if invalid.
 */
export const formatEpochDate = (val) => {
  if (!val || isNaN(Number(val))) return val || "-";
  return new Date(Number(val)).toLocaleDateString("en-GB");
};

/**
 * Converts "YYYY-MM-DD" From/To strings (from <input type="date">) into an inclusive
 * epoch range in the user's local time: From = 00:00:00.000, To = 23:59:59.999.
 * (new Date("YYYY-MM-DD") would be UTC midnight and silently drop most of the To day.)
 * Empty strings give undefined so the API falls back to its own default range.
 */
export const toDayRange = (startDate, endDate) => ({
  startTimestamp: startDate ? new Date(`${startDate}T00:00:00`).getTime() : undefined,
  endTimestamp: endDate ? new Date(`${endDate}T23:59:59.999`).getTime() : undefined,
});

/** "YYYY-MM-DD" for a Date in local time (toISOString() would shift to UTC). */
export const toInputDate = (date = new Date()) => {
  const d = new Date(date);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

/** Default dashboard range: the last 30 days up to today, as input strings. */
export const last30Days = () => ({
  startDate: toInputDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)),
  endDate: toInputDate(new Date()),
});

/** Whole days from today to an epoch (negative = in the past), calendar-day based. */
export const daysFromToday = (epoch) => {
  const n = Number(epoch);
  if (!Number.isFinite(n) || n <= 0) return null;
  const start = (ms) => {
    const d = new Date(ms);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  };
  return Math.round((start(n) - start(Date.now())) / (24 * 60 * 60 * 1000));
};

/** "5 days left" / "Due today" / "3 days overdue" for a due-date epoch. */
export const dueLabel = (dueEpoch) => {
  const d = daysFromToday(dueEpoch);
  if (d === null) return "-";
  if (d === 0) return "Due today";
  const n = Math.abs(d);
  return d > 0 ? `${n} day${n === 1 ? "" : "s"} left` : `${n} day${n === 1 ? "" : "s"} overdue`;
};
