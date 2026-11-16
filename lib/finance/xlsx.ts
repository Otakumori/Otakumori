import 'server-only';

import ExcelJS from 'exceljs';
import type { loadFinanceReport } from './reporting';

type FinanceReport = Awaited<ReturnType<typeof loadFinanceReport>>;

const BRAND = {
  charcoal: '191418',
  bronze: 'A9855F',
  ivory: 'F5EEE9',
  sakura: 'D98AA8',
  muted: 'D8CEC8',
  warning: 'F4C76A',
};

export function spreadsheetSafeText(value: unknown): string {
  const text = value == null ? '' : String(value);
  return /^[=+\-@\t\r]/.test(text) ? `'${text}` : text;
}

function addSheet(
  workbook: ExcelJS.Workbook,
  name: string,
  columns: Array<{ header: string; key: string; width?: number }>,
  rows: Record<string, unknown>[],
) {
  const sheet = workbook.addWorksheet(name, {
    views: [{ state: 'frozen', ySplit: 1 }],
    properties: { defaultRowHeight: 18 },
  });
  sheet.columns = columns.map((column) => ({ ...column, width: column.width ?? 18 }));
  sheet.autoFilter = { from: 'A1', to: `${sheet.getColumn(columns.length).letter}1` };
  const header = sheet.getRow(1);
  header.height = 24;
  header.eachCell((cell) => {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: BRAND.charcoal } };
    cell.font = { bold: true, color: { argb: BRAND.ivory } };
    cell.alignment = { vertical: 'middle', wrapText: true };
    cell.border = { bottom: { style: 'medium', color: { argb: BRAND.bronze } } };
  });
  for (const row of rows) {
    const safe = Object.fromEntries(
      Object.entries(row).map(([key, value]) => [
        key,
        typeof value === 'string' ? spreadsheetSafeText(value) : value,
      ]),
    );
    sheet.addRow(safe);
  }
  sheet.eachRow((row, index) => {
    if (index > 1) row.alignment = { vertical: 'top', wrapText: true };
  });
  return sheet;
}

function currencyColumns(sheet: ExcelJS.Worksheet, keys: string[]) {
  for (const key of keys) {
    const column = sheet.getColumn(key);
    column.numFmt = '$#,##0.00;[Red]-$#,##0.00';
  }
}

function cents(value: unknown) {
  return typeof value === 'number' ? value / 100 : 0;
}

export async function buildFinanceWorkbook(report: FinanceReport): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Otaku-mori Financial Reporting';
  workbook.company = 'Otaku-mori';
  workbook.created = new Date(report.methodology.generatedAt);
  workbook.modified = workbook.created;
  workbook.calcProperties.fullCalcOnLoad = true;

  const summary = workbook.addWorksheet('Executive Summary', {
    views: [{ state: 'frozen', ySplit: 3 }],
  });
  summary.columns = [
    { key: 'metric', width: 34 },
    { key: 'value', width: 24 },
    { key: 'note', width: 62 },
  ];
  summary.mergeCells('A1:C1');
  summary.getCell('A1').value = 'Otaku-mori Financial Report';
  summary.getCell('A1').font = { size: 18, bold: true, color: { argb: BRAND.ivory } };
  summary.getCell('A1').fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: BRAND.charcoal },
  };
  summary.getCell('A1').alignment = { vertical: 'middle' };
  summary.getRow(1).height = 34;
  const summaryRows: Array<[string, string | number, string]> = [
    ['Reporting period', report.period.label, report.methodology.timezone],
    ['Canonical transactions', report.overview.transactionCount, 'FinancialTransaction rows'],
    ['Orders', report.overview.orderCount, 'Local Order rows'],
    ['Gross receipts', cents(report.overview.grossSales), 'Product sales only'],
    ['Refunds', -cents(report.overview.refunds), 'Cumulative reconciled refunds'],
    ['Discounts', -cents(report.overview.discounts), 'Contra-revenue'],
    ['Net sales', cents(report.overview.netSales), 'Gross less discounts and refunds'],
    [
      'Taxes collected',
      cents(report.overview.taxCollected),
      'Liability; excluded from operating result',
    ],
    ['Shipping revenue', cents(report.overview.shippingCollected), 'Customer-paid shipping'],
    ['Processing fees', -cents(report.overview.paymentFees), 'Stripe balance-transaction fees'],
    ['Printify costs', -cents(report.overview.providerCogs), 'Known provider COGS only'],
    [
      'Operating expenses',
      -cents(report.overview.operatingExpenses),
      'Verified persisted expenses only',
    ],
    ['Calculated operating result', 0, 'Net sales + shipping - fees - COGS - expenses'],
    ['Unreconciled value', cents(report.overview.unreconciledValue), 'Requires operator review'],
  ];
  summary.getRow(3).values = ['Metric', 'Value', 'Methodology'];
  summary.getRow(3).eachCell((cell) => {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: BRAND.bronze } };
    cell.font = { bold: true, color: { argb: BRAND.charcoal } };
  });
  summaryRows.forEach((row) => summary.addRow(row));
  summary.getCell('B16').value = {
    formula: 'B10+B12+B13+B14+B15',
    result: report.overview.contribution / 100,
  };
  summary.getColumn('B').numFmt = '$#,##0.00;[Red]-$#,##0.00';
  summary.getCell('B5').numFmt = '0';
  summary.getCell('B6').numFmt = '0';
  summary.getCell('B17').fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: BRAND.warning },
  };

  const transactions = addSheet(
    workbook,
    'Transactions',
    [
      { header: 'Event ID', key: 'id', width: 42 },
      { header: 'Date', key: 'date', width: 22 },
      { header: 'Type', key: 'type' },
      { header: 'Category', key: 'category', width: 24 },
      { header: 'Amount', key: 'amount' },
      { header: 'Currency', key: 'currency', width: 12 },
      { header: 'Order ID', key: 'orderId', width: 28 },
      { header: 'Stripe Charge', key: 'stripeChargeId', width: 26 },
      { header: 'Stripe Refund', key: 'stripeRefundId', width: 26 },
      { header: 'Description', key: 'description', width: 48 },
    ],
    report.ledger.map((row) => ({
      id: row.id,
      date: row.createdAt,
      type: row.type,
      category: row.category ?? 'uncategorized',
      amount: row.amount / 100,
      currency: row.currency,
      orderId: row.orderId ?? '',
      stripeChargeId: row.stripeChargeId ?? '',
      stripeRefundId: row.stripeRefundId ?? '',
      description: row.description,
    })),
  );
  currencyColumns(transactions, ['amount']);
  transactions.getColumn('date').numFmt = 'yyyy-mm-dd hh:mm';

  const orderRows = report.orders.flatMap((order) =>
    order.OrderItem.length > 0
      ? order.OrderItem.map((item) => ({
          orderNumber: order.displayNumber,
          orderId: order.id,
          createdAt: order.createdAt,
          paidAt: order.paidAt ?? '',
          status: order.status,
          sku: item.sku,
          item: item.name,
          quantity: item.quantity,
          unitPrice: item.unitAmount / 100,
          lineTotal: (item.unitAmount * item.quantity) / 100,
          currency: order.currency,
          fulfillment: order.PrintifyOrderSync?.status ?? 'not_submitted',
        }))
      : [
          {
            orderNumber: order.displayNumber,
            orderId: order.id,
            createdAt: order.createdAt,
            paidAt: order.paidAt ?? '',
            status: order.status,
            sku: '',
            item: '(no persisted items)',
            quantity: 0,
            unitPrice: 0,
            lineTotal: 0,
            currency: order.currency,
            fulfillment: order.PrintifyOrderSync?.status ?? 'not_submitted',
          },
        ],
  );
  const orders = addSheet(
    workbook,
    'Orders & Items',
    [
      { header: 'Order #', key: 'orderNumber', width: 12 },
      { header: 'Order ID', key: 'orderId', width: 28 },
      { header: 'Created', key: 'createdAt', width: 22 },
      { header: 'Paid', key: 'paidAt', width: 22 },
      { header: 'Payment state', key: 'status', width: 18 },
      { header: 'SKU', key: 'sku', width: 24 },
      { header: 'Item', key: 'item', width: 42 },
      { header: 'Quantity', key: 'quantity', width: 12 },
      { header: 'Unit price', key: 'unitPrice', width: 16 },
      { header: 'Line total', key: 'lineTotal', width: 16 },
      { header: 'Currency', key: 'currency', width: 12 },
      { header: 'Fulfillment', key: 'fulfillment', width: 22 },
    ],
    orderRows,
  );
  currencyColumns(orders, ['unitPrice', 'lineTotal']);
  orders.getColumn('createdAt').numFmt = 'yyyy-mm-dd hh:mm';
  orders.getColumn('paidAt').numFmt = 'yyyy-mm-dd hh:mm';

  const taxes = addSheet(
    workbook,
    'Taxes by Jurisdiction',
    [
      { header: 'Country', key: 'country', width: 12 },
      { header: 'State/region', key: 'state', width: 18 },
      { header: 'Tax category', key: 'taxCategory', width: 22 },
      { header: 'Taxable amount', key: 'taxableAmount', width: 18 },
      { header: 'Collected tax', key: 'collectedTax', width: 18 },
      { header: 'Refund adjustments', key: 'refundAdjustment', width: 20 },
      { header: 'Registration state', key: 'registrationState', width: 22 },
      { header: 'Filing period', key: 'filingPeriod', width: 32 },
      { header: 'Orders', key: 'orderCount', width: 12 },
      { header: 'Provenance', key: 'authority', width: 34 },
    ],
    report.tax.jurisdictionRows.map((row) => ({
      country: row.country,
      state: row.state,
      taxCategory: row.taxCodes.length > 0 ? row.taxCodes.join(', ') : 'unclassified',
      taxableAmount: row.salesCents / 100,
      collectedTax: row.taxCollectedCents / 100,
      refundAdjustment: row.refundAdjustmentCents / 100,
      registrationState: row.registrationState,
      filingPeriod: report.period.label,
      orderCount: row.orderCount,
      authority: row.authority,
    })),
  );
  currencyColumns(taxes, ['taxableAmount', 'collectedTax', 'refundAdjustment']);

  const refunds = addSheet(
    workbook,
    'Refunds & Disputes',
    [
      { header: 'Event ID', key: 'id', width: 42 },
      { header: 'Date', key: 'date', width: 22 },
      { header: 'Kind', key: 'kind', width: 18 },
      { header: 'Amount', key: 'amount', width: 18 },
      { header: 'Currency', key: 'currency', width: 12 },
      { header: 'Order ID', key: 'orderId', width: 28 },
      { header: 'Original charge', key: 'chargeId', width: 26 },
      { header: 'Refund ID', key: 'refundId', width: 26 },
      { header: 'Status', key: 'status', width: 18 },
    ],
    report.ledger
      .filter((row) => row.category === 'refund' || row.category === 'dispute')
      .map((row) => ({
        id: row.id,
        date: row.createdAt,
        kind: row.category,
        amount: row.amount / 100,
        currency: row.currency,
        orderId: row.orderId ?? '',
        chargeId: row.stripeChargeId ?? '',
        refundId: row.stripeRefundId ?? '',
        status: 'persisted',
      })),
  );
  currencyColumns(refunds, ['amount']);
  refunds.getColumn('date').numFmt = 'yyyy-mm-dd hh:mm';

  const fees = addSheet(
    workbook,
    'Fees & Payouts',
    [
      { header: 'Event ID', key: 'id', width: 42 },
      { header: 'Date', key: 'date', width: 22 },
      { header: 'Category', key: 'category', width: 24 },
      { header: 'Amount', key: 'amount', width: 18 },
      { header: 'Currency', key: 'currency', width: 12 },
      { header: 'Settlement reference', key: 'settlement', width: 30 },
      { header: 'Bank reconciled', key: 'bankReconciled', width: 18 },
    ],
    report.ledger
      .filter((row) =>
        ['payment_processing', 'payout', 'cash_transfer'].includes(row.category ?? ''),
      )
      .map((row) => ({
        id: row.id,
        date: row.createdAt,
        category: row.category,
        amount: row.amount / 100,
        currency: row.currency,
        settlement: '',
        bankReconciled: 'UNVERIFIED',
      })),
  );
  currencyColumns(fees, ['amount']);
  fees.getColumn('date').numFmt = 'yyyy-mm-dd hh:mm';

  const cogs = addSheet(
    workbook,
    'Fulfillment & COGS',
    [
      { header: 'Order #', key: 'orderNumber', width: 12 },
      { header: 'Order ID', key: 'orderId', width: 28 },
      { header: 'Provider', key: 'provider', width: 18 },
      { header: 'Provider order', key: 'providerOrder', width: 28 },
      { header: 'Fulfillment status', key: 'status', width: 22 },
      { header: 'Production cost', key: 'cost', width: 18 },
      { header: 'Unresolved cost', key: 'unresolved', width: 20 },
      { header: 'Issues', key: 'issues', width: 48 },
    ],
    report.reconciliation.map((row) => ({
      orderNumber: row.orderNumber,
      orderId: row.orderId,
      provider: row.provider,
      providerOrder: row.providerOrderId ?? '',
      status: row.status,
      cost: row.cogsAmount == null ? 0 : row.cogsAmount / 100,
      unresolved: row.cogsAmount == null ? 'YES' : 'NO',
      issues: row.issues.join(', '),
    })),
  );
  currencyColumns(cogs, ['cost']);

  const expenses = addSheet(
    workbook,
    'Expenses',
    [
      { header: 'Event ID', key: 'id', width: 42 },
      { header: 'Date', key: 'date', width: 22 },
      { header: 'Category', key: 'category', width: 24 },
      { header: 'Amount', key: 'amount', width: 18 },
      { header: 'Currency', key: 'currency', width: 12 },
      { header: 'Description', key: 'description', width: 48 },
      { header: 'Supporting document', key: 'document', width: 24 },
    ],
    report.ledger
      .filter((row) => row.category === 'operating_expense')
      .map((row) => ({
        id: row.id,
        date: row.createdAt,
        category: row.category,
        amount: row.amount / 100,
        currency: row.currency,
        description: row.description,
        document: 'UNVERIFIED',
      })),
  );
  currencyColumns(expenses, ['amount']);
  expenses.getColumn('date').numFmt = 'yyyy-mm-dd hh:mm';

  const reconciliation = addSheet(
    workbook,
    'Reconciliation',
    [
      { header: 'Order #', key: 'orderNumber', width: 12 },
      { header: 'Order ID', key: 'orderId', width: 28 },
      { header: 'Local total', key: 'localTotal', width: 18 },
      { header: 'Ledger revenue', key: 'ledgerRevenue', width: 18 },
      { header: 'Refund amount', key: 'refundAmount', width: 18 },
      { header: 'Ledger refund', key: 'ledgerRefund', width: 18 },
      { header: 'Reconciled', key: 'reconciled', width: 16 },
      { header: 'Issues', key: 'issues', width: 52 },
    ],
    report.reconciliation.map((row) => ({
      orderNumber: row.orderNumber,
      orderId: row.orderId,
      localTotal: row.localTotal / 100,
      ledgerRevenue: row.ledgerRevenue / 100,
      refundAmount: row.refundAmount / 100,
      ledgerRefund: row.ledgerRefund / 100,
      reconciled: row.reconciled ? 'YES' : 'NO',
      issues: row.issues.join(', '),
    })),
  );
  currencyColumns(reconciliation, ['localTotal', 'ledgerRevenue', 'refundAmount', 'ledgerRefund']);

  const taxPrep = addSheet(
    workbook,
    'Tax Preparation',
    [
      { header: 'Schedule C input', key: 'input', width: 38 },
      { header: 'Amount', key: 'amount', width: 20 },
      { header: 'Treatment', key: 'treatment', width: 64 },
      { header: 'Accountant review', key: 'review', width: 22 },
    ],
    [
      {
        input: 'Gross receipts',
        amount: report.overview.grossSales / 100,
        treatment: 'Persisted product-sale events; excludes sales tax',
        review: 'REQUIRED',
      },
      {
        input: 'Returns and allowances',
        amount: -report.overview.refunds / 100,
        treatment: 'Persisted cumulative refund events',
        review: 'REQUIRED',
      },
      {
        input: 'Cost of goods sold inputs',
        amount: report.overview.providerCogs / 100,
        treatment: 'Known Printify catalog cost snapshots only',
        review: 'REQUIRED',
      },
      {
        input: 'Payment processing fees',
        amount: report.overview.paymentFees / 100,
        treatment: 'Stripe balance-transaction fees',
        review: 'REQUIRED',
      },
      {
        input: 'Operating expenses',
        amount: report.overview.operatingExpenses / 100,
        treatment: 'Only verified persisted expense events; no deductibility determination',
        review: 'REQUIRED',
      },
    ],
  );
  currencyColumns(taxPrep, ['amount']);

  addSheet(
    workbook,
    'Source & Methodology',
    [
      { header: 'Field', key: 'field', width: 34 },
      { header: 'Value', key: 'value', width: 86 },
    ],
    [
      { field: 'Merchant account', value: report.methodology.merchantAccountId },
      { field: 'Environment', value: report.methodology.reportingEnvironment },
      { field: 'Extraction time', value: report.methodology.generatedAt },
      { field: 'Reporting window', value: report.period.label },
      { field: 'Timezone', value: report.methodology.timezone },
      { field: 'Accounting method', value: report.methodology.accountingMethod },
      { field: 'Report version', value: report.methodology.reportVersion },
      { field: 'Source digest', value: report.close.sourceDigest },
      { field: 'Sources', value: report.methodology.sources.join(', ') },
      { field: 'Limitations', value: report.methodology.limitations.join(' | ') },
      { field: 'Tax close state', value: report.tax.readiness.status },
    ],
  );

  for (const sheet of workbook.worksheets) {
    sheet.views = [{ state: 'frozen', ySplit: sheet.name === 'Executive Summary' ? 3 : 1 }];
    sheet.pageSetup = { orientation: 'landscape', fitToPage: true, fitToWidth: 1, fitToHeight: 0 };
  }

  const bytes = await workbook.xlsx.writeBuffer();
  return Buffer.from(bytes);
}
