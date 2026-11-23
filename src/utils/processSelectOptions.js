import ItemsData from "./ItemsData.json";

/**
 * Process-scoped dropdowns.
 *
 * SelectOptionsArray is matched by header name across the whole app, so a header such as
 * "DEPARTMENT" (also used — as free text — by Employee History, Revision Control, Quality
 * Audits, Certificate Renewal …) cannot become a dropdown everywhere. ItemsData.ProcessSelectOptions
 * lists dropdowns that apply to ONE process only:
 *
 *   "ProcessSelectOptions": { "MR/R/005A": { "DEPARTMENT": "@DepartmentsListName" } }
 *
 * A value is either an array of options, or "@<ItemsData key>" to reuse a list from ItemsData
 * (e.g. the sidebar's DepartmentsListName, so the dropdown always matches the sidebar).
 */
const resolveOptions = (spec) => {
  if (Array.isArray(spec)) return spec;
  if (typeof spec === "string" && spec.startsWith("@")) {
    const list = ItemsData[spec.slice(1)];
    return Array.isArray(list) ? list : [];
  }
  return [];
};

/** The process's own dropdowns as SelectOptionsArray entries ([{ key, value: [...] }]). */
export const getProcessSelectOptions = (processId) => {
  const scoped = (processId && ItemsData.ProcessSelectOptions?.[processId]) || {};
  return Object.entries(scoped).map(([key, spec]) => ({
    key,
    value: [...resolveOptions(spec)],
  }));
};

/**
 * Returns SelectOptionsArray with this process's own dropdowns first (lookups use .find(),
 * so the first entry for a key wins) and any global entry for the same key removed.
 */
export const withProcessSelectOptions = (baseOptions = [], processId) => {
  const scoped = getProcessSelectOptions(processId);
  if (!scoped.length) return baseOptions;
  const scopedKeys = new Set(scoped.map((o) => o.key.trim().toLowerCase()));
  return [
    ...scoped,
    ...(baseOptions || []).filter((o) => !scopedKeys.has(String(o.key || "").trim().toLowerCase())),
  ];
};
