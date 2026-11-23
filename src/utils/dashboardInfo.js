/**
 * Plain-language explanations for every dashboard card, shown via the (i) icon on the card
 * (see components/dashboard/CardInfo.jsx for the supported fields).
 *
 * Keep these in step with the backend calculations in server/controllers/processController.js:
 * if you change how a card is calculated, update its text here too.
 */

// ---------------------------------------------------------------------------
// DESIGN DEPARTMENT DASHBOARD  (GET /process/design/dashboard → getDesignDashboard)
// ---------------------------------------------------------------------------
export const DESIGN_INFO = {
  products: {
    what: "A quick count of how big your product range is: how many product series, main products and sub products are registered.",
    sources: [
      { process: "Product List", id: "DD/R/001", note: "used for Series and Main Product" },
      { process: "Products (BOM detail)", id: "DD/R/002A", note: "used for Sub Product" },
    ],
    metrics: [
      {
        name: "Count of Series",
        how: "Number of different SERIES values in Product List (e.g. C, F). Each series is counted once, however many parts it has.",
      },
      {
        name: "Count of Main Product",
        how: "Number of different PART NO values in Product List. A part number entered twice is counted once.",
      },
      {
        name: "Count of Sub Product",
        how: "Number of different PART NO values in the Products table inside the BOM (e.g. CPX18, CSX18).",
      },
    ],
    included: "All records. Blank values are ignored and upper/lower case is treated as the same (c18 = C18).",
    tip: "If a count looks higher than expected, check the list for the same part typed slightly differently (extra spaces or a different code).",
  },

  productSuccess: {
    what: "How reliable your products are in the field: the share of sold quantity that was NOT returned. The pie shows the average across all products; the table points out the weakest ones.",
    sources: [{ process: "Product Success Rate", id: "DD/R/007" }],
    included: "All Product Success Rate records except those with STATUS = CLOSED (if a STATUS column exists).",
    metrics: [
      {
        name: "Success rate of one product",
        how: "(QTY SOLD − QTY RETURNED) ÷ QTY SOLD × 100. Example: 1000 sold, 30 returned → 97%. If QTY SOLD is empty, the SUCCESS RATE typed in the record is used instead.",
      },
      {
        name: "Average success rate (pie)",
        how: "The simple average of every product's success rate (each product counts equally, regardless of how many were sold).",
      },
      { name: "Badge number", how: "How many products are included in the calculation." },
    ],
    chart: {
      type: "Pie / donut chart",
      slices: "Green-blue slice = average success %; the other slice = the remaining % (returned).",
    },
    columns: [
      { name: "SERIES, PART NO, PART NAME", from: "Product Success Rate · same columns" },
      { name: "QTY SOLD / QTY RETURNED", from: "Product Success Rate · same columns" },
      {
        name: "SUCCESS RATE",
        how: "Calculated as above. The table lists the 5 products with the LOWEST success rate, worst first.",
      },
    ],
    tip: "Start with the product at the top of the table — it has the most returns relative to sales.",
  },

  revision: {
    what: "Parts whose drawing/design is currently being revised, and how long each revision has been open.",
    sources: [{ process: "Revision Control", id: "DD/R/005" }],
    included: "Only records with REVISION STATUS = INREVISION. Once a record is set to REVISED it disappears from this card.",
    columns: [
      { name: "PART NO", from: "Revision Control · PART NO" },
      { name: "PROBLEM DESCRIPTION", from: "Revision Control · PROBLEM DESCRIPTION" },
      { name: "ENTERED", from: "Revision Control · DATE", how: "The date the revision was entered." },
      {
        name: "DUE",
        how: "Days open = today − ENTERED date. Example: entered 1 Nov, today 12 Nov → \"11 days open\". Longest-open revisions are listed first.",
      },
    ],
    metrics: [{ name: "Badge number", how: "How many parts are in revision right now." }],
    tip: "A large \"days open\" number means a revision is waiting a long time — worth a follow-up.",
  },

  npd: {
    what: "New product development (NPD) enquiries that are not finished yet, with the status of each stage and how much time is left.",
    sources: [{ process: "NPD Register", id: "DD/R/010" }],
    included: "NPD records where at least one of PROTO, VALIDATION or MASTER PIECE is not yet green (complete). Records with NPD STATUS = Not Feasible are hidden.",
    columns: [
      { name: "FROM", from: "NPD Register · FROM", how: "The customer who raised the enquiry." },
      { name: "TARGET DATE", from: "NPD Register · TARGET DATE", how: "Shows \"-\" when no target date has been set." },
      { name: "PART", from: "NPD Register · PART" },
      {
        name: "PROTO / VALIDATION / MASTER",
        from: "Status colour of each stage in the NPD Register",
        how: "Updated automatically from the stage records (NPD Proto Model, Product Validation Report, Master Piece).",
      },
      {
        name: "DUE",
        how: "If TARGET DATE is set: days left = TARGET DATE − today (\"5 days left\", \"Due today\" or \"12 days overdue\"). If there is no TARGET DATE: days since the enquiry DATE (\"Open 45 days\").",
      },
    ],
    colors: [
      { label: "Red", meaning: "Stage not started." },
      { label: "Orange", meaning: "Stage in progress." },
      { label: "Green", meaning: "Stage completed." },
    ],
    metrics: [{ name: "Badge number", how: "How many NPD enquiries are still open." }],
    tip: "Set a TARGET DATE on each enquiry so DUE shows a real deadline instead of just the age of the enquiry.",
  },
};

// ---------------------------------------------------------------------------
// SALES DEPARTMENT DASHBOARD  (GET /process/sales/dashboard → getSalesDashboard)
// ---------------------------------------------------------------------------
export const SALES_INFO = {
  customerCount: {
    what: "How many customers you have registered.",
    sources: [{ process: "Customer List", id: "MS/R/004" }],
    metrics: [
      {
        name: "Count of Customers",
        how: "Number of different CUSTOMER NAME values in Customer List. Active and inactive customers are both counted; the same name entered twice counts once.",
      },
    ],
  },

  salesTrend: {
    what: "How much you have delivered over time — in money (VALUE) and in pieces (DELIVERY QTY). Use it to spot growing or slow periods.",
    sources: [
      { process: "Dockets", id: "MS/R/006A", note: "VALUE, DELIVERY QTY, DELIVERY DATE" },
      { process: "Order List", id: "MS/R/006", note: "ENQ BY of the order each docket was created from" },
    ],
    included: "Every docket with a DELIVERY DATE inside the chosen date range (and, if chosen, for the selected ENQ BY person).",
    charts: [
      {
        type: "VALUE — line chart",
        x: "Time period of the DELIVERY DATE (day, month or year, as chosen in the first dropdown).",
        y: "Total VALUE of all dockets delivered in that period (sum).",
      },
      {
        type: "DELIVERY QTY — bar chart",
        x: "Same time periods as the line chart.",
        y: "Total DELIVERY QTY delivered in that period (sum).",
      },
    ],
    dateFilter: "Choose Date wise / Month wise / Year wise to change how deliveries are grouped, and pick a From–To range (default: 1 January this year to today). Choose a name in ENQ BY to see only orders handled by that person.",
    tip: "Periods with no deliveries are not drawn, so a gap in the chart means nothing was delivered then.",
  },

  quotation: {
    what: "Where your quotations stand: how many are waiting for the customer's order and how many still need a quote from you.",
    sources: [{ process: "Quotation List", id: "MS/R/005" }],
    metrics: [
      { name: "Waiting for Order", how: "Count of quotations with QL STATUS = WAITING FOR ORDER (quote sent, order not received yet)." },
      { name: "Waiting for Quote", how: "Count of quotations with QL STATUS = WAITING FOR QUOTE (enquiry received, quote not sent yet)." },
    ],
    tip: "\"Waiting for Quote\" is work on your side; \"Waiting for Order\" is a follow-up with the customer.",
  },

  pendingOrders: {
    what: "Orders that still have quantity left to deliver, with their value and how much time is left.",
    sources: [{ process: "Order List", id: "MS/R/006" }],
    included: "Orders with PENDING QTY above 0 that are not CLOSED. Orders closest to (or past) their due date are listed first.",
    columns: [
      { name: "CUSTOMER", from: "Order List · CUSTOMER NAME" },
      { name: "PART NAME", from: "Order List · PART NAME" },
      { name: "PART NUMBER", from: "Order List · PART NO" },
      {
        name: "PENDING QTY",
        from: "Order List · PENDING QTY",
        how: "Ordered QTY minus everything already delivered through Dockets.",
      },
      {
        name: "PENDING QTY VALUE",
        how: "PENDING QTY × VALUE (VALUE in Order List is the price per piece). Shows 0 if VALUE is empty.",
      },
      {
        name: "DUE",
        how: "Due date = ORDER DATE + LEAD TIME (days). Shows days left, \"Due today\" or days overdue. \"(no lead time)\" means LEAD TIME is empty or not a number, so ORDER DATE alone was used.",
      },
    ],
    metrics: [{ name: "Badge number", how: "How many order lines are still pending." }],
  },

  pendingPayments: {
    what: "Invoices delivered to customers whose payment has not been received yet, and when each payment is due.",
    sources: [{ process: "Dockets", id: "MS/R/006A" }],
    included: "Dockets whose PAYMENT is not CLOSED (i.e. OPEN or empty). Payments due soonest or overdue are listed first.",
    columns: [
      { name: "CUSTOMER", from: "Dockets · CUSTOMER NAME" },
      { name: "PART NUMBER", from: "Dockets · PART NO" },
      { name: "VALUE", from: "Dockets · VALUE", how: "Invoice value for that delivery." },
      { name: "CREDIT PERIOD", from: "Dockets · CREDIT PERIOD", how: "Number of days the customer is allowed before paying." },
      {
        name: "DUE",
        how: "Payment due date = DELIVERY DATE + CREDIT PERIOD days. Shows days left, \"Due today\" or days overdue.",
      },
    ],
    metrics: [{ name: "Badge number", how: "How many dockets are awaiting payment." }],
    tip: "Set PAYMENT to CLOSED on the docket once the money is received to remove it from this list.",
  },
};

// ---------------------------------------------------------------------------
// OTHER DEPARTMENT DASHBOARDS (pages/DepartmentDashboard.jsx)
// ---------------------------------------------------------------------------
const PAGE_DATE_FILTER =
  "Click the funnel icon on this card to pick a From–To range (both days included). Only this card changes. Default: the last 30 days — press Clear to go back to it.";
const ALL_DATES =
  "This card always uses all records, so it has no date filter.";

export const MANUFACTURING_INFO = {
  averageOEE: {
    what: "OEE (Overall Equipment Effectiveness) shows how well your machines are used. 100% would mean making only good parts, at full speed, with no stoppages.",
    sources: [{ process: "Production Report", id: "MR/R/002" }],
    included: "Production Report records whose DATE falls in the selected range.",
    metrics: [
      {
        name: "OEE of one production report",
        how: "Worked out automatically when the report is saved: Availability × Performance × Quality. Performance = ACTUAL ÷ PLAN (PLAN = working minutes ÷ CYCLE TIME), Quality = (ACTUAL − REJECT) ÷ ACTUAL, Availability = time actually producing ÷ working minutes (shift time minus breaks).",
      },
      {
        name: "Average OEE (badge and gauge)",
        how: "The simple average of the OEE of every production report in the range — each report counts equally. Reports with an empty OEE are skipped.",
      },
    ],
    chart: { type: "Gauge", how: "The needle shows the Average OEE on a 0–100% scale." },
    colors: [
      { label: "Green", meaning: "Above 65% — good." },
      { label: "Yellow", meaning: "Above 45% up to 65% — needs attention." },
      { label: "Red", meaning: "45% or below — poor." },
    ],
    dateFilter: PAGE_DATE_FILTER,
  },

  oeeTrend: {
    what: "How OEE has moved day by day, so you can see whether machine performance is improving or dropping.",
    sources: [{ process: "Production Report", id: "MR/R/002" }],
    included: "Production Report records whose DATE falls in the selected range.",
    chart: {
      type: "Area chart",
      x: "Date of the production reports (one point per day that has reports).",
      y: "Average OEE % of all reports on that day.",
      how: "Days with no production report are skipped, so the line joins the nearest days that have data.",
    },
    dateFilter: PAGE_DATE_FILTER,
  },

  rejection: {
    what: "How much of what you produced was rejected, and how many rejected parts are still waiting for corrective action.",
    sources: [
      { process: "Production Report", id: "MR/R/002", note: "ACTUAL produced quantity" },
      { process: "Rejection Report", id: "MR/R/003", note: "rejected quantity" },
      { process: "Action Taken", id: "MR/R/003B", note: "action status of each rejection" },
    ],
    metrics: [
      {
        name: "Rejection Ratio",
        how: "Total rejected quantity ÷ total ACTUAL produced quantity × 100, for reports dated in the selected range. Example: 50 rejected out of 2,000 produced → 2.5%.",
      },
      {
        name: "Action Pending",
        how: "Total rejected QUANTITY of the rejections whose action (Action Taken) still has ACTION PLAN STATUS = OPEN. All dates are counted.",
      },
    ],
    dateFilter: "Use the funnel icon on this card (default: the last 30 days, both days included). The range applies to Rejection Ratio only — Action Pending always shows everything still open.",
    note: "Action Pending is a number of parts, not a number of actions.",
  },

  rework: {
    what: "How many parts are waiting to be reworked.",
    sources: [{ process: "Rework Report", id: "MR/R/003A" }],
    included: "Rework records with RR STATUS = OPEN.",
    metrics: [{ name: "Rework Pending", how: "Sum of REWORK QTY of all open rework records (number of parts)." }],
    dateFilter: ALL_DATES,
  },

  settings: {
    what: "How long machine setups (changeovers) take on average, and how much material is lost while setting up.",
    sources: [{ process: "Settings", id: "MR/R/002A" }],
    metrics: [
      { name: "Badge number", how: "Total number of setting records." },
      { name: "Avg Setting Time (min)", how: "Average of SETTING TIME across records that have a number." },
      { name: "Avg Setup Loss (qty)", how: "Average of SET UP LOSS across records that have a number." },
    ],
    dateFilter: ALL_DATES,
  },
};

export const QUALITY_INFO = {
  customerComplaints: {
    what: "How much of what customers ordered came back as failed, and how many complaints are still open.",
    sources: [
      { process: "Customer Complient Register", id: "QA/R/007", note: "FAILED QTY and CCR STATUS" },
      { process: "Order List", id: "MS/R/006", note: "ordered QTY" },
    ],
    metrics: [
      {
        name: "Rejection Rate",
        how: "Total FAILED QTY from complaints ÷ total QTY ordered × 100, both for records dated in the selected range.",
      },
      {
        name: "Action Pending",
        how: "Number of complaints whose CCR STATUS is not CLOSED (a blank status counts as open).",
      },
    ],
    dateFilter: "Use the funnel icon on this card (default: the last 30 days, both days included). The range applies to Rejection Rate only — Action Pending always counts every open complaint.",
  },

  incomingInspection: {
    what: "Material received from suppliers that is still waiting to be inspected.",
    sources: [{ process: "Incoming Inspection", id: "QA/R/003" }],
    included: "Records whose INSPECTION-STATUS is not Done (a blank status counts as pending).",
    metrics: [{ name: "Pending Inspections (badge and circle)", how: "Number of such records." }],
    tip: "Once inspection is finished and INSPECTION-STATUS is set to Done, the record leaves this count.",
  },

  continuousImprovement: {
    what: "How many improvement ideas/initiatives were recorded.",
    sources: [{ process: "Continous Improvement", id: "MR/R/005" }],
    included: "All improvement records whose DATE is in the selected range, whatever their status.",
    metrics: [{ name: "Improvement Initiatives", how: "Number of those records." }],
    dateFilter: PAGE_DATE_FILTER,
  },

  qualityAudits: {
    what: "Audits that are not closed yet, with how many non-conformities (NCs) each has and who is responsible.",
    sources: [{ process: "Quality Audits", id: "QA/F/005" }],
    included: "Audits whose AUDIT STATUS is not CLOSED (a blank status counts as open). The table shows the first 5, sorted by department A–Z.",
    metrics: [{ name: "Badge number", how: "Total number of open audits (can be more than the 5 rows shown)." }],
    columns: [
      { name: "DEPARTMENT", from: "Quality Audits · DEPARTMENT" },
      { name: "NCs", from: "Quality Audits · NC", how: "Number of non-conformities found." },
      { name: "RESPONSIBLE", from: "Quality Audits · RESPONSIBLE" },
      {
        name: "DUE",
        from: "Quality Audits · DATE",
        how: "Days passed since the audit DATE, i.e. how long it has been open. \"Today\" = dated today or later.",
      },
    ],
  },

  instruments: {
    what: "Measuring instruments whose calibration needs attention now — overdue, due very soon, or missing a certificate.",
    sources: [
      { process: "Calibration Details", id: "QA/R/002A", note: "DONE, DUE and CERTIFICATE of each calibration" },
      { process: "Instrument & Calibration", id: "QA/R/002", note: "instrument number and name" },
    ],
    included: "Calibration records that are overdue (DUE before today), due within the next 10 days, or have no CERTIFICATE uploaded. Most urgent first; the table shows the top 5.",
    metrics: [
      { name: "Badge number", how: "Number of calibration records that need attention (rule above)." },
      { name: "Overdue", how: "Records whose DUE date has already passed." },
      { name: "Due in 10 days", how: "Records whose DUE date is today or within the next 10 days." },
      {
        name: "No certificate",
        how: "Records with no CERTIFICATE uploaded. A record can also be overdue or due soon, so the tiles can add up to more than the badge.",
      },
      {
        name: "\"No calibration record yet\"",
        how: "Active instruments in Instrument & Calibration that have no Calibration Details entry at all.",
      },
    ],
    columns: [
      { name: "INSTRUMENT", from: "Instrument & Calibration · INSTRUMENT NO · INSTRUMENT NAME" },
      { name: "LAST CALIBRATED", from: "Calibration Details · DONE" },
      { name: "NEXT DUE", from: "Calibration Details · DUE" },
      { name: "STATUS", how: "\"N days overdue\", \"Due today\", \"N days left\", or \"No certificate\"." },
    ],
  },


  processControlPlan: {
    what: "Process Control Plans and how many are still missing their uploaded document.",
    sources: [{ process: "Process Control Plan", id: "QA/R/009" }],
    metrics: [
      { name: "Badge / Total Records", how: "Total number of Process Control Plan records." },
      { name: "Pending Uploads", how: "Records whose FILE UPLOAD is empty." },
    ],
    included: "The table lists the first 5 plans that are still waiting for an upload.",
    columns: [
      { name: "NAME", from: "Process Control Plan · the first column containing INSTRUMENT, NAME or PART" },
      { name: "DATE", from: "Process Control Plan · DATE" },
      { name: "REV NO", from: "Process Control Plan · REVISION NO" },
    ],
  },

  certificates: {
    what: "Company certificates and how soon each one needs renewing.",
    sources: [
      { process: "Certificate Renewal", id: "QA/R/011", note: "certificate name and department" },
      { process: "Certificate Renewal Details", id: "QA/R/011A", note: "EXPIRY DATE of each renewal" },
    ],
    included: "All certificates, most urgent first (overdue, then expiring soonest). Certificates with no renewal date are listed last. The table shows the top 5.",
    metrics: [
      {
        name: "Action Required (badge)",
        how: "Certificates that are overdue, expire today, or expire within the next 30 days.",
      },
    ],
    columns: [
      { name: "CERTIFICATE NAME", from: "Certificate Renewal · CERTIFICATE NAME" },
      { name: "DEPT", from: "Certificate Renewal · DEPARTMENT" },
      {
        name: "DUE DATE",
        from: "Certificate Renewal Details · EXPIRY DATE",
        how: "The latest expiry among the certificate's renewal records (opened from CRS-STATUS). If EXPIRY DATE is empty, NEXT RENEVAL is used.",
      },
      {
        name: "REMINDER",
        how: "Days from today to DUE DATE: \"N days overdue\", \"Expires today\", \"Due in N days\" (within 30 days) or \"N days remaining\". \"No date set\" means no renewal record has an expiry date yet.",
      },
    ],
    tip: "After renewing, add a new renewal record with the new EXPIRY DATE — the card always uses the latest one.",
  },

};

export const HR_INFO = {
  employeeStrength: {
    what: "How many employees are currently working with you.",
    sources: [{ process: "Employee History", id: "HR/R/001" }],
    metrics: [
      { name: "Total Active (badge)", how: "Employees whose DATE OF RELIEVING is empty — people who have not left." },
      {
        name: "Retention Rate (12 months)",
        how: "Of the people who were on staff exactly one year ago (joined on/before that day and not yet relieved), the share still working today. Example: 24 on staff a year ago, 2 have left → 22 ÷ 24 = 91.7%. Shows — when nobody had joined a year ago.",
      },
    ],
  },

  departmentDistribution: {
    what: "How your people are spread across departments.",
    sources: [{ process: "Employee History", id: "HR/R/001" }],
    included: "Employees who were working at some point in the selected range: joined on or before the end date and not relieved before the start date.",
    chart: {
      type: "Donut chart",
      slices: "One slice per DEPARTMENT (\"Unassigned\" when blank). Slice size = number of employees.",
      how: "Hover a slice to see its count.",
    },
    dateFilter: PAGE_DATE_FILTER + " People who left during the chosen range are still included, so the total can differ from Employee Strength.",
  },
};

const PROCUREMENT_COLUMNS = [
  { name: "PO NUMBER", from: "Procurement Register · PO NO" },
  { name: "ITEM NAME", from: "Procurement Register · ITEM NAME" },
  { name: "VENDOR", from: "Procurement Register · VENDOR-NAME" },
  { name: "QTY", from: "Procurement Register · QTY" },
  { name: "SUPPLY DATE", from: "Procurement Register · DATE", how: "The date the request was raised." },
  {
    name: "DUE",
    how: "Expected supply = DATE + LEAD TIME days. Shows days left (\"5 days\"), \"Today\", or how long ago it was due (\"3 days ago\").",
  },
];
const INWARD_COLUMNS = [
  { name: "VENDOR", from: "Inward · VENDOR NAME" },
  { name: "INVOICE", from: "Inward · INVOICE NO" },
  { name: "VALUE", from: "Inward · VALUE" },
  { name: "PAYMENT DATE", from: "Inward · DELIVERY DATE", how: "The date the material was delivered." },
  {
    name: "DUE",
    how: "Payment due = DELIVERY DATE + CREDIT PERIOD days. Shows days left, \"Today\", or how long ago it was due (\"3 days ago\").",
  },
];

export const PURCHASE_INFO = {
  pendingProcurements: {
    what: "Purchase requests that are not closed yet, and how close each one is to its expected supply date.",
    sources: [{ process: "Procurement Register", id: "PR/R/003" }],
    included: "Procurement records whose PR STATUS is not CLOSED and whose DATE is in the selected range.",
    columns: PROCUREMENT_COLUMNS,
    metrics: [{ name: "Badge number", how: "Number of pending procurement records shown." }],
    dateFilter: PAGE_DATE_FILTER + " Older open requests outside the range are hidden — widen the range to see them.",
  },

  inwardPayments: {
    what: "Supplier invoices that have been received but not paid yet, and when each payment falls due.",
    sources: [{ process: "Inward", id: "PR/R/003A" }],
    included: "Inward records whose PAYMENT is not CLOSED and whose DELIVERY DATE is in the selected range.",
    columns: INWARD_COLUMNS,
    metrics: [{ name: "Badge number", how: "Number of unpaid inward records shown." }],
    dateFilter: PAGE_DATE_FILTER + " Older unpaid invoices outside the range are hidden — widen the range to see them.",
  },
};

export const STOCK_INFO = {
  finishedGoods: {
    what: "How much finished-goods stock you have on hand, item by item.",
    sources: [{ process: "Stock Data", id: "ST/R/006" }],
    included: "Stock records whose ITEM CATEGORY is Finished Good.",
    metrics: [
      {
        name: "Badge number",
        how: "Total STOCK quantity of all finished-good items added together (a quantity, not the number of items).",
      },
    ],
    columns: [
      { name: "ITEM CODE", from: "Stock Data · ITEM CODE" },
      { name: "ITEM NAME", from: "Stock Data · ITEM NAME" },
      {
        name: "STOCK",
        from: "Stock Data · STOCK",
        how: "IN − OUT − REJECT, kept up to date automatically from Store Register movements.",
      },
    ],
    dateFilter: ALL_DATES,
  },
};

// ---------------------------------------------------------------------------
// MAIN DASHBOARD (pages/Dashboard.jsx)
// One date filter is shared by the whole page; until you press Apply, each card uses its own default.
// ---------------------------------------------------------------------------
const MAIN_FILTER = (field, defaultRange) =>
  `Uses ${field}. Click the funnel icon on this card to choose a From–To range (both days included) — only this card changes. With no range applied (or after Clear), it shows ${defaultRange}.`;
const THIS_YEAR = "this year's records (from 1 January)";
const ALL_RECORDS = "all records";

export const MAIN_INFO = {
  orderList: {
    what: "Customer orders that are not closed yet, and how much time is left to deliver each one.",
    sources: [{ process: "Order List", id: "MS/R/006" }],
    included: "Orders whose ORDER STATUS is not CLOSED (orders with no status are included).",
    metrics: [{ name: "Badge number", how: "Number of open orders." }],
    columns: [
      { name: "CUSTOMER NAME / PO NO / PART NO / PART NAME / QTY", from: "Order List · same columns" },
      { name: "DATE", from: "Order List · DATE", how: "Date the order was entered." },
      {
        name: "DUE",
        how: "Delivery due = ORDER DATE + LEAD TIME days (DATE is used if ORDER DATE is empty). Shows \"N days left\", \"Due today\" or \"N days overdue\".",
      },
    ],
    dateFilter: ALL_DATES,
  },


  stock: { ...STOCK_INFO.finishedGoods },

  pendingProcurements: {
    ...PURCHASE_INFO.pendingProcurements,
    included: "Procurement records whose PR STATUS is not CLOSED (and, once a date range is applied, whose DATE is inside it).",
    dateFilter: MAIN_FILTER("the procurement DATE", ALL_RECORDS),
  },

  inwardPayments: {
    ...PURCHASE_INFO.inwardPayments,
    included: "Inward records whose PAYMENT is not CLOSED (and, once a date range is applied, whose DELIVERY DATE is inside it).",
    dateFilter: MAIN_FILTER("DELIVERY DATE", ALL_RECORDS),
  },

  customerPayments: {
    what: "Invoices delivered to customers whose payment has not been received yet.",
    sources: [{ process: "Dockets", id: "MS/R/006A" }],
    included: "Dockets whose PAYMENT is not CLOSED.",
    metrics: [{ name: "Badge number", how: "Number of unpaid dockets." }],
    columns: [
      { name: "CUSTOMER NAME", from: "Dockets · CUSTOMER NAME" },
      { name: "INVOICE", from: "Dockets · INVOICE NO" },
      { name: "VALUE", from: "Dockets · VALUE" },
      { name: "PAYMENT DATE", from: "Dockets · DELIVERY DATE", how: "The date the goods were delivered." },
      {
        name: "DUE",
        how: "Payment due = DELIVERY DATE + the docket's CREDIT PERIOD (days). Shows \"N days left\", \"Due today\" or \"N days overdue\".",
      },
    ],
    dateFilter: MAIN_FILTER("DELIVERY DATE", ALL_RECORDS),
  },

  npd: {
    what: "New product development (NPD) enquiries that are not finished yet, with the status of each stage.",
    sources: [{ process: "NPD Register", id: "DD/R/010" }],
    included: "NPD records where at least one of PROTO, VALIDATION or MASTER PIECE is not yet green, excluding NPD STATUS = Not Feasible.",
    metrics: [{ name: "Badge number", how: "Number of open NPD enquiries." }],
    columns: [
      { name: "FROM", from: "NPD Register · FROM", how: "The customer who raised the enquiry." },
      { name: "DATE", from: "NPD Register · TARGET DATE", how: "The target completion date (\"-\" if not set)." },
      { name: "PART", from: "NPD Register · PART" },
      { name: "PROTO / VALIDATION / MASTER", from: "Status colour of each stage in the NPD Register" },
      {
        name: "DUE",
        how: "With a TARGET DATE: \"N days left\", \"Due today\" or \"N days overdue\". Without one: how long since the enquiry DATE (\"Open 45 days\").",
      },
    ],
    colors: DESIGN_INFO.npd.colors,
    dateFilter: ALL_DATES,
  },

  productionPlanChart: {
    what: "Planned production quantity for each plan, by part number.",
    sources: [{ process: "Production Plan", id: "MR/R/001" }],
    included: "All production plans.",
    chart: {
      type: "Bar chart",
      x: "PART-NO (one bar per part number).",
      y: "Total PLAN QTY of that part — all production plans for the same part are added together.",
    },
    dateFilter: ALL_DATES,
  },

  productionPlanPending: {
    what: "Production plans that are not fully finished yet.",
    sources: [{ process: "Production Plan", id: "MR/R/001" }],
    included: "Plans where at least one stage — RM, INCOMING INSPECTION, MACHINE, ASSEMBLY or OUT PROCESS — is not marked Completed yet. A plan leaves this list only when all five stages are completed.",
    metrics: [
      { name: "Badge number", how: "Total PLAN QTY of the pending plans listed." },
    ],
    columns: [
      { name: "PLAN NO / DATE / CUSTOMER NAME / PART-NO / PART-NAME / PLAN QTY", from: "Production Plan · same columns" },
    ],
    dateFilter: ALL_DATES,
  },

  averageOEE: {
    ...MANUFACTURING_INFO.averageOEE,
    dateFilter: MAIN_FILTER("the production report DATE", THIS_YEAR),
  },

  rejection: {
    ...MANUFACTURING_INFO.rejection,
    dateFilter: MAIN_FILTER("the report DATE (Rejection Ratio only; Action Pending is always all open actions)", THIS_YEAR),
  },

  dispatch: {
    what: "What has been dispatched, and the total quantity.",
    sources: [{ process: "Dispatch", id: "MR/R/006" }],
    included: "Dispatch records whose DATE is in the range.",
    metrics: [{ name: "Badge number", how: "Total QTY dispatched in the range." }],
    columns: [
      { name: "DATE", from: "Dispatch · DATE" },
      { name: "PART-NO", from: "Dispatch · PART-NO" },
      { name: "QTY", from: "Dispatch · QTY" },
    ],
    dateFilter: MAIN_FILTER("the dispatch DATE", THIS_YEAR) + " Dispatch Data and Output (Trends) share one range, because they show the same dispatch records.",
  },

  customerQuality: {
    ...QUALITY_INFO.customerComplaints,
    dateFilter: MAIN_FILTER("DATE (Rejection Rate only; Action Pending always counts every open complaint)", THIS_YEAR),
  },

  incomingInspection: { ...QUALITY_INFO.incomingInspection },

  qualityAudits: { ...QUALITY_INFO.qualityAudits },

  continuousImprovement: {
    ...QUALITY_INFO.continuousImprovement,
    included: "All improvement records (once a date range is applied, only those dated inside it), whatever their status.",
    dateFilter: MAIN_FILTER("DATE", ALL_RECORDS),
  },

  revisionControl: {
    what: "Parts whose design revision is not finished yet.",
    sources: [{ process: "Revision Control", id: "DD/R/005" }],
    included: "Revision records whose REVISION STATUS is not REVISED.",
    metrics: [{ name: "Badge number", how: "Number of open revisions." }],
    columns: [
      { name: "DATE", from: "Revision Control · DATE", how: "Date the revision was entered." },
      { name: "PART", from: "Revision Control · PART NO" },
      { name: "STATUS", from: "Revision Control · REVISION STATUS" },
      { name: "DUE", how: "How long the revision has been open: today − entered DATE (\"12 days open\")." },
    ],
    dateFilter: ALL_DATES,
  },

  oeeTrend: {
    ...MANUFACTURING_INFO.oeeTrend,
    dateFilter: MAIN_FILTER("the production report DATE", THIS_YEAR),
  },

  rework: { ...MANUFACTURING_INFO.rework },

  settings: { ...MANUFACTURING_INFO.settings },

  productsSummary: {
    what: "The size of your product catalogue and bill of materials.",
    sources: [
      { process: "Product List", id: "DD/R/001" },
      { process: "Bill of Materials - BOM", id: "DD/R/002" },
    ],
    metrics: [
      { name: "Total Products", how: "Number of records in Product List." },
      { name: "Total BOMs", how: "Number of BOM lines in Bill of Materials." },
    ],
    dateFilter: ALL_DATES,
  },

  productSuccess: {
    what: "How reliable your products are in the field — the average share of sold quantity that was not returned.",
    sources: [{ process: "Product Success Rate", id: "DD/R/007" }],
    included: "All records except STATUS = CLOSED.",
    metrics: [
      { name: "Badge number", how: "Number of products included." },
      {
        name: "Average Performance",
        how: "Simple average of the SUCCESS RATE entered on each product record (each product counts equally).",
      },
    ],
  },

  instruments: { ...QUALITY_INFO.instruments },

  processControlPlan: { ...QUALITY_INFO.processControlPlan },

  certificates: { ...QUALITY_INFO.certificates },

  quotationStatus: {
    ...SALES_INFO.quotation,
    metrics: [
      { name: "Waiting for Quote", how: "Count of quotations with QL STATUS = WAITING FOR QUOTE (quote not sent yet)." },
      { name: "Waiting Order", how: "Count of quotations with QL STATUS = WAITING FOR ORDER (quote sent, order not received)." },
    ],
  },

  outputTrend: {
    what: "How much you dispatched each month.",
    sources: [{ process: "Dispatch", id: "MR/R/006" }],
    metrics: [{ name: "Badge number", how: "Total QTY dispatched in the range (same as Dispatch Data)." }],
    chart: {
      type: "Bar chart",
      x: "Month of the dispatch DATE (YYYY-MM).",
      y: "Total QTY dispatched in that month.",
      how: "Months with no dispatch are not shown.",
    },
    dateFilter: MAIN_FILTER("the dispatch DATE", THIS_YEAR) + " Dispatch Data and Output (Trends) share one range, because they show the same dispatch records.",
  },
};
