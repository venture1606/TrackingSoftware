export const dummyDashboardData = {
  planActual: [
    {
      partNo: "P001",
      partName: "Coupler A",
      planQty: 1000,
      actualQty: 850,
      percentage: 85,
    },
    {
      partNo: "P002",
      partName: "Gear B",
      planQty: 500,
      actualQty: 480,
      percentage: 96,
    },
    {
      partNo: "P003",
      partName: "Shaft C",
      planQty: 1200,
      actualQty: 1250,
      percentage: 104,
    },
    {
      partNo: "P004",
      partName: "Housing D",
      planQty: 800,
      actualQty: 700,
      percentage: 87.5,
    },
  ],
  couplerOutput: [
    { date: "2026-02-20", partNo: "P001", partName: "Coupler A", qty: 200 },
    { date: "2026-02-21", partNo: "P001", partName: "Coupler A", qty: 250 },
    { date: "2026-02-22", partNo: "P001", partName: "Coupler A", qty: 210 },
  ],
  reworkRate: [
    { month: "Jan", producedQty: 5000, reworkQty: 150, rr: 3.0 },
    { month: "Feb", producedQty: 6000, reworkQty: 120, rr: 2.0 },
    { month: "Mar", producedQty: 5500, reworkQty: 165, rr: 3.0 },
  ],
  shiftOee: {
    shift1: 82,
    shift2: 78,
    shift3: 75,
  },
  inhouseRejectRate: [
    { month: "Jan", producedQty: 5000, rejectQty: 100, rr: 2.0 },
    { month: "Feb", producedQty: 6000, rejectQty: 150, rr: 2.5 },
  ],
  customerRejectionRate: [
    { month: "Jan", suppliedQty: 4800, failureQty: 10, crr: 0.2 },
    { month: "Feb", suppliedQty: 5800, failureQty: 15, crr: 0.25 },
  ],
  supplierRate: [
    {
      vendor: "V-Steel Co",
      planQty: 1000,
      actualQty: 1000,
      defectQty: 5,
      defectRate: 0.5,
    },
    {
      vendor: "V-Plastics",
      planQty: 2000,
      actualQty: 1950,
      defectQty: 40,
      defectRate: 2.05,
    },
  ],
  salesTrend: [
    { month: "Jan", targetQty: 10000, orderQty: 9500, percentage: 95 },
    { month: "Feb", targetQty: 11000, orderQty: 11500, percentage: 104.5 },
    { month: "Mar", targetQty: 12000, orderQty: 10000, percentage: 83.3 },
  ],
  sales: [
    { part: "Unit X", qty: 500, status: "Shipped", payment: "$50,000" },
    { part: "Unit Y", qty: 300, status: "Pending", payment: "$30,000" },
  ],
  audit: [
    { department: "Quality", score: 92, status: "Passed" },
    { department: "Safety", score: 88, status: "Passed" },
  ],
  purchase: [
    {
      itemCode: "ITM01",
      itemName: "Raw Steel",
      status: "Delivered",
      payment: "$5,000",
    },
    {
      itemCode: "ITM02",
      itemName: "Coolant",
      status: "In Transit",
      payment: "$1,200",
    },
  ],
  attendance: {
    shift1: 95,
    shift2: 92,
    shift3: 88,
  },
};
