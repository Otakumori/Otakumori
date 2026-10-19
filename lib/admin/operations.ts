type FulfillmentSync = {
  status: string;
  error?: string | null;
} | null;

export type OperationsOrder = {
  id: string;
  status: string;
  paidAt: Date | string | null;
  refundAmount?: number | null;
  totalAmount: number;
  PrintifyOrderSync?: FulfillmentSync;
};

export type OperationsReconciliation = {
  orderId: string;
  reconciled: boolean;
  issues: string[];
};

export type AdminAttentionKey =
  | 'pending-payment'
  | 'pending-fulfillment'
  | 'fulfillment-error'
  | 'submission-uncertain'
  | 'shipped'
  | 'cancelled-refunded'
  | 'financially-unreconciled'
  | 'unknown-cogs'
  | 'finance-close-blockers'
  | 'tax-readiness';

export type AdminAttention = {
  key: AdminAttentionKey;
  label: string;
  count: number;
  valueCents: number | null;
  href: string;
  severity: 'neutral' | 'attention' | 'critical';
};

const FULFILLMENT_ERROR_STATUSES = new Set(['failed', 'mapping_failed', 'no_items']);
const PENDING_FULFILLMENT_STATUSES = new Set([
  'pending',
  'submitting',
  'accepted',
  'in_production',
]);

export function buildAdminAttention(input: {
  orders: OperationsOrder[];
  reconciliation: OperationsReconciliation[];
  closeBlockers: string[];
  taxReadiness: string;
}): AdminAttention[] {
  const { orders, reconciliation, closeBlockers, taxReadiness } = input;
  const reconciliationByOrder = new Map(reconciliation.map((row) => [row.orderId, row]));
  const count = (predicate: (order: OperationsOrder) => boolean) => orders.filter(predicate).length;
  const value = (predicate: (order: OperationsOrder) => boolean) =>
    orders.filter(predicate).reduce((sum, order) => sum + order.totalAmount, 0);
  const isUnreconciled = (order: OperationsOrder) =>
    reconciliationByOrder.get(order.id)?.reconciled === false;
  const hasUnknownCogs = (order: OperationsOrder) => {
    const issues = reconciliationByOrder.get(order.id)?.issues ?? [];
    return issues.includes('COGS_UNKNOWN') || issues.includes('COGS_NOT_CAPTURED');
  };
  const isPendingPayment = (order: OperationsOrder) => !order.paidAt && order.status === 'pending';
  const isPendingFulfillment = (order: OperationsOrder) =>
    Boolean(order.paidAt) &&
    order.status !== 'shipped' &&
    order.status !== 'cancelled' &&
    (!order.PrintifyOrderSync || PENDING_FULFILLMENT_STATUSES.has(order.PrintifyOrderSync.status));
  const isFulfillmentError = (order: OperationsOrder) =>
    FULFILLMENT_ERROR_STATUSES.has(order.PrintifyOrderSync?.status ?? '');
  const isSubmissionUncertain = (order: OperationsOrder) =>
    order.PrintifyOrderSync?.status === 'submission_uncertain';
  const isCancelledOrRefunded = (order: OperationsOrder) =>
    order.status === 'cancelled' || (order.refundAmount ?? 0) > 0;

  return [
    {
      key: 'pending-payment',
      label: 'Pending checkout / payment',
      count: count(isPendingPayment),
      valueCents: value(isPendingPayment),
      href: '/admin/orders?attention=pending-payment',
      severity: 'attention',
    },
    {
      key: 'pending-fulfillment',
      label: 'Pending fulfillment',
      count: count(isPendingFulfillment),
      valueCents: value(isPendingFulfillment),
      href: '/admin/orders?attention=pending-fulfillment',
      severity: 'attention',
    },
    {
      key: 'fulfillment-error',
      label: 'Fulfillment errors',
      count: count(isFulfillmentError),
      valueCents: value(isFulfillmentError),
      href: '/admin/orders?attention=fulfillment-error',
      severity: 'critical',
    },
    {
      key: 'submission-uncertain',
      label: 'Submission uncertain',
      count: count(isSubmissionUncertain),
      valueCents: value(isSubmissionUncertain),
      href: '/admin/orders?attention=submission-uncertain',
      severity: 'critical',
    },
    {
      key: 'shipped',
      label: 'Shipped',
      count: count((order) => order.status === 'shipped'),
      valueCents: null,
      href: '/admin/orders?status=shipped',
      severity: 'neutral',
    },
    {
      key: 'cancelled-refunded',
      label: 'Cancelled / refunded',
      count: count(isCancelledOrRefunded),
      valueCents: value(isCancelledOrRefunded),
      href: '/admin/orders?attention=cancelled-refunded',
      severity: 'attention',
    },
    {
      key: 'financially-unreconciled',
      label: 'Financially unreconciled',
      count: count(isUnreconciled),
      valueCents: value(isUnreconciled),
      href: '/admin/finance?reconciliation=unreconciled',
      severity: 'critical',
    },
    {
      key: 'unknown-cogs',
      label: 'Unknown COGS',
      count: count(hasUnknownCogs),
      valueCents: value(hasUnknownCogs),
      href: '/admin/finance?reconciliation=unreconciled',
      severity: 'critical',
    },
    {
      key: 'finance-close-blockers',
      label: 'Finance close blockers',
      count: closeBlockers.length,
      valueCents: null,
      href: '/admin/finance',
      severity: closeBlockers.length > 0 ? 'critical' : 'neutral',
    },
    {
      key: 'tax-readiness',
      label: 'Tax readiness',
      count: taxReadiness === 'READY' ? 0 : 1,
      valueCents: null,
      href: '/admin/finance',
      severity: taxReadiness === 'READY' ? 'neutral' : 'critical',
    },
  ];
}

export function isRetrySafeFulfillmentStatus(status: string | null | undefined) {
  return FULFILLMENT_ERROR_STATUSES.has(status ?? '');
}
