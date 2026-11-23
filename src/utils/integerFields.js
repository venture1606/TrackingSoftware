import ItemsData from "./ItemsData.json";

/**
 * Number-column rules.
 *
 * Global (matched by column name in every process):
 *   ItemsData.IntegerFields   = ["PPE FOLLOWS", "NEAR MISS", "IMPROVEMENTS"]   whole numbers ≥ 0
 *   ItemsData.IntegerFieldMax = { "PPE FOLLOWS": 100 }
 *   ItemsData.PercentFields   = ["PPE FOLLOWS"]                                shows a % sign
 *
 * Per process (column names like DESIGN / QUALITY / STATUS mean different things in different
 * processes, so these apply to one process only):
 *   ItemsData.ProcessNumberFields = {
 *     "HR/R/007": { "DESIGN": { "integer": true, "max": 5 }, … },
 *   }
 * A column listed there is a number input in that process (integer → no decimals/negatives).
 */
const norm = (key) => String(key || "").trim().toUpperCase();
const INTEGER = new Set((ItemsData.IntegerFields || []).map(norm));
const PERCENT = new Set((ItemsData.PercentFields || []).map(norm));
const MAX = Object.fromEntries(
  Object.entries(ItemsData.IntegerFieldMax || {}).map(([k, v]) => [norm(k), Number(v)]),
);
const PROCESS_RULES = Object.fromEntries(
  Object.entries(ItemsData.ProcessNumberFields || {}).map(([pid, fields]) => [
    pid,
    Object.fromEntries(Object.entries(fields || {}).map(([k, v]) => [norm(k), v || {}])),
  ]),
);

const processRule = (key, processId) =>
  (processId && PROCESS_RULES[processId] && PROCESS_RULES[processId][norm(key)]) || null;

/** True when the column is a number input only because of ProcessNumberFields. */
export const isProcessNumberField = (processId, key) => !!processRule(key, processId);

export const isIntegerField = (key, processId) => {
  const rule = processRule(key, processId);
  if (rule) return !!rule.integer;
  return INTEGER.has(norm(key));
};

export const isPercentField = (key, processId) => {
  const rule = processRule(key, processId);
  if (rule) return !!rule.percent;
  return PERCENT.has(norm(key));
};

export const integerMax = (key, processId) => {
  const rule = processRule(key, processId);
  const max = rule ? Number(rule.max) : MAX[norm(key)];
  return Number.isFinite(max) ? max : undefined;
};

/** Keeps only digits and applies the maximum for whole-number columns; others pass through. */
export const sanitizeNumberInput = (key, value, processId) => {
  if (!isIntegerField(key, processId)) return value;
  const digits = String(value ?? "").replace(/[^\d]/g, "");
  if (digits === "") return "";
  let n = parseInt(digits, 10);
  const max = integerMax(key, processId);
  if (max !== undefined && n > max) n = max;
  return String(n);
};

/** Extra props for the <Input type="number"> of a column. */
export const numberInputProps = (key, processId) =>
  isIntegerField(key, processId)
    ? { min: 0, max: integerMax(key, processId), step: 1, inputMode: "numeric" }
    : {};
