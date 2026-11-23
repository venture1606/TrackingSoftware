import {
  MAIN_INFO,
  DESIGN_INFO,
  MANUFACTURING_INFO,
  QUALITY_INFO,
  SALES_INFO,
  PURCHASE_INFO,
  STOCK_INFO,
  HR_INFO,
} from "./dashboardInfo";

/**
 * Every dashboard card in the app, grouped the way the admin sees them on the user permission screen.
 *
 * key        — stored in user.dashboardAccess ("main.orderList", "design.products", …)
 * title      — card title as shown on the dashboard
 * info       — the card's (i) explanation (from dashboardInfo.js)
 * processId  — main-dashboard cards only: the process the card was gated by before dashboard
 *              permissions existed (used to pre-tick the boxes for users not configured yet)
 *
 * Groups: `legacyDept` is the user.department value that used to give access to that department
 * dashboard page — also used for the pre-ticked defaults.
 *
 * When you add a card to a dashboard, add it here too and pass `dashboardKey` to its <StatCard>.
 */
export const DASHBOARD_GROUPS = [
  {
    id: "main",
    title: "Main Dashboard",
    subtitle: "Operational Dashboard — the home page every user lands on",
    cards: [
      { key: "main.orderList", title: "Order List (Active)", info: MAIN_INFO.orderList },
      { key: "main.stock", title: "Stock Data (Finished Goods)", info: MAIN_INFO.stock },
      { key: "main.pendingProcurements", title: "Pending Procurements", info: MAIN_INFO.pendingProcurements },
      { key: "main.inwardPayments", title: "Open Inward Payments", info: MAIN_INFO.inwardPayments },
      { key: "main.customerPayments", title: "Customer Payment Status", info: MAIN_INFO.customerPayments },
      { key: "main.npd", title: "NPD Register", info: MAIN_INFO.npd, processId: "DD/R/010" },
      { key: "main.productionPlanChart", title: "Production Plan (Qty by Part No)", info: MAIN_INFO.productionPlanChart },
      { key: "main.productionPlanPending", title: "Production Plan - Pending", info: MAIN_INFO.productionPlanPending },
      { key: "main.averageOEE", title: "Average OEE", info: MAIN_INFO.averageOEE, processId: "MR/R/002" },
      { key: "main.rejection", title: "Rejection", info: MAIN_INFO.rejection, processId: "MR/R/003" },
      { key: "main.dispatch", title: "Dispatch Data", info: MAIN_INFO.dispatch },
      { key: "main.customerQuality", title: "Customer Quality", info: MAIN_INFO.customerQuality, processId: "QA/R/007" },
      { key: "main.incomingInspection", title: "Incoming Inspection", info: MAIN_INFO.incomingInspection, processId: "QA/R/003" },
      { key: "main.qualityAudits", title: "Quality Audits (Pending)", info: MAIN_INFO.qualityAudits, processId: "QA/F/005" },
      { key: "main.continuousImprovement", title: "Continuous Improvement", info: MAIN_INFO.continuousImprovement, processId: "MR/R/005" },
      { key: "main.revisionControl", title: "Revision Control", info: MAIN_INFO.revisionControl, processId: "DD/R/005" },
      { key: "main.oeeTrend", title: "OEE Trend", info: MAIN_INFO.oeeTrend, processId: "MR/R/002" },
      { key: "main.rework", title: "Rework Status", info: MAIN_INFO.rework, processId: "MR/R/003A" },
      { key: "main.settings", title: "Settings Performance", info: MAIN_INFO.settings, processId: "MR/R/002A" },
      { key: "main.productsSummary", title: "Overall Products Summary", info: MAIN_INFO.productsSummary, processId: "DD/R/001" },
      { key: "main.productSuccess", title: "Product Success Rate", info: MAIN_INFO.productSuccess, processId: "DD/R/007" },
      { key: "main.instruments", title: "Instrument Status", info: MAIN_INFO.instruments, processId: "QA/R/002" },
      { key: "main.processControlPlan", title: "Process Control Plan", info: MAIN_INFO.processControlPlan, processId: "QA/R/009" },
      { key: "main.certificates", title: "Certificate Renewal Status", info: MAIN_INFO.certificates },
      { key: "main.quotationStatus", title: "Quotation List Status", info: MAIN_INFO.quotationStatus },
      { key: "main.outputTrend", title: "Output (Trends)", info: MAIN_INFO.outputTrend },
    ],
  },
  {
    id: "design",
    title: "Design",
    subtitle: "Department dashboard — Department › Design",
    legacyDept: "design",
    cards: [
      { key: "design.products", title: "Products", info: DESIGN_INFO.products },
      { key: "design.productSuccess", title: "Product Success Rate", info: DESIGN_INFO.productSuccess },
      { key: "design.revision", title: "Revision Control (In Revision)", info: DESIGN_INFO.revision },
      { key: "design.npd", title: "NPD Register (Pending)", info: DESIGN_INFO.npd },
    ],
  },
  {
    id: "manufacturing",
    title: "Manufacturing",
    subtitle: "Department dashboard — Department › Manufacturing",
    legacyDept: "production",
    cards: [
      { key: "manufacturing.averageOEE", title: "Average OEE", info: MANUFACTURING_INFO.averageOEE },
      { key: "manufacturing.oeeTrend", title: "OEE Trend", info: MANUFACTURING_INFO.oeeTrend },
      { key: "manufacturing.rejection", title: "Rejection", info: MANUFACTURING_INFO.rejection },
      { key: "manufacturing.rework", title: "Rework Status", info: MANUFACTURING_INFO.rework },
      { key: "manufacturing.settings", title: "Settings Performance", info: MANUFACTURING_INFO.settings },
    ],
  },
  {
    id: "quality",
    title: "Quality",
    subtitle: "Department dashboard — Department › Quality",
    legacyDept: "quality",
    cards: [
      { key: "quality.customerRejection", title: "Customer Rejection Rate", info: QUALITY_INFO.customerRejection },
      { key: "quality.improvementByDepartment", title: "Continuous Improvement", info: QUALITY_INFO.improvementByDepartment },
      { key: "quality.incomingInspection", title: "Incoming Inspection", info: QUALITY_INFO.incomingInspection },
      { key: "quality.qualityAuditPending", title: "Quality Audit Pending", info: QUALITY_INFO.qualityAuditPending },
      { key: "quality.instrumentsPending", title: "Instruments Pending", info: QUALITY_INFO.instrumentsPending },
      { key: "quality.certificateRenewal", title: "Certificate Renewal", info: QUALITY_INFO.certificateRenewalPending },
      { key: "quality.processControlPlan", title: "Process Control Plan", info: QUALITY_INFO.pcpRenewalPending },
    ],
  },
  {
    id: "sales",
    title: "Sales",
    subtitle: "Department dashboard — Department › Sales",
    legacyDept: "sales",
    cards: [
      { key: "sales.customerCount", title: "Customer Count", info: SALES_INFO.customerCount },
      { key: "sales.salesTrend", title: "Sales Trend (Dockets)", info: SALES_INFO.salesTrend },
      { key: "sales.quotation", title: "Quote / Order Status", info: SALES_INFO.quotation },
      { key: "sales.pendingOrders", title: "Pending Order", info: SALES_INFO.pendingOrders },
      { key: "sales.pendingPayments", title: "Pending Payment", info: SALES_INFO.pendingPayments },
    ],
  },
  {
    id: "purchase",
    title: "Purchase",
    subtitle: "Department dashboard — Department › Purchase",
    legacyDept: "purchase",
    cards: [
      { key: "purchase.procurementDetail", title: "Procurement Detail", info: PURCHASE_INFO.procurementDetail },
      { key: "purchase.supplierPayment", title: "Supplier Payment", info: PURCHASE_INFO.supplierPayment },
    ],
  },
  {
    id: "stores",
    title: "Stores",
    subtitle: "Department dashboard — Department › Stores",
    legacyDept: "stores",
    cards: [
      { key: "stores.finishedGoods", title: "Stock Data (Finished Goods)", info: STOCK_INFO.finishedGoods },
      { key: "stores.stockSearch", title: "Stock Search", info: STOCK_INFO.stockSearch },
    ],
  },
  {
    id: "hr",
    title: "Human Resources",
    subtitle: "Department dashboard — Department › Human Resources",
    legacyDept: "hr",
    cards: [
      { key: "hr.employeeStrength", title: "Employee Strength", info: HR_INFO.employeeStrength },
      { key: "hr.attendanceTrend", title: "Attendance Trend", info: HR_INFO.attendanceTrend },
      { key: "hr.safety", title: "Safety Follow Up", info: HR_INFO.safety },
      { key: "hr.fiveS", title: "5S Score", info: HR_INFO.fiveS },
    ],
  },
];

export const ALL_DASHBOARD_KEYS = DASHBOARD_GROUPS.flatMap((g) => g.cards.map((c) => c.key));

/** Which group (department) a department-dashboard page name belongs to: "Manufacturing" → "manufacturing". */
export const groupIdForDepartment = (deptName) => {
  const d = String(deptName || "").trim().toLowerCase();
  if (d === "human resources" || d === "hr") return "hr";
  if (d === "stock" || d === "store" || d === "stores") return "stores";
  if (d === "production") return "manufacturing";
  return d;
};

/**
 * Dashboards a user saw before dashboard permissions existed — used to pre-tick the boxes when an
 * admin opens a user who has never been configured:
 *  - main-dashboard cards: always, except those gated by a process the user can't access
 *  - department dashboards: all cards of departments the user has access to
 */
export const legacyDashboardKeys = ({ accessLevel, department = [], processAccess = [] } = {}) => {
  if (String(accessLevel || "").toLowerCase() === "admin") return [...ALL_DASHBOARD_KEYS];
  const depts = (Array.isArray(department) ? department : [department]).map((d) =>
    String(d || "").toLowerCase(),
  );
  const processes = Array.isArray(processAccess) ? processAccess : [];
  return DASHBOARD_GROUPS.flatMap((g) => {
    if (g.id === "main") {
      return g.cards.filter((c) => !c.processId || processes.includes(c.processId)).map((c) => c.key);
    }
    return depts.includes(g.legacyDept) ? g.cards.map((c) => c.key) : [];
  });
};
