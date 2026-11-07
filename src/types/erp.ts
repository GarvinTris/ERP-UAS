export type UserRole = 'owner' | 'sales' | 'warehouse' | 'finance' | 'cashier' | 'procurement';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  roleName: string;
  avatar?: string;
}

export type AppModuleId =
  | 'home'
  | 'dashboard'
  | 'crm'
  | 'sales'
  | 'pos'
  | 'purchase'
  | 'inventory'
  | 'invoicing'
  | 'accounting'
  | 'contacts'
  | 'products'
  | 'reporting'
  | 'settings'
  | 'audit';

export interface Customer {
  contact_id: string;
  name: string;
  contact_type: 'Pelanggan B2B' | 'Pelanggan ritel';
  city: string;
  credit_limit_idr: number;
  payment_terms: 'TUNAI' | 'NET14' | 'NET30';
  email: string;
  phone: string;
  open_receivable: number;
}

export interface Vendor {
  vendor_id: string;
  name: string;
  city: string;
  category: string;
  payment_terms: 'TUNAI' | 'NET14' | 'NET30';
  email: string;
  phone: string;
}

export interface ProductVariant {
  sku: string;
  product_name: string;
  size: string;
  color: string;
  uom: string;
  sales_price_idr: number;
  cost_idr: number;
  default_vendor_id: string;
  category: string;
  imageUrl?: string;
  active: boolean;
}

export type LocationId = 'WH-JKT' | 'STORE-BDG';

export interface StockQuantity {
  sku: string;
  location_id: LocationId;
  on_hand: number;
  reserved: number;
  available: number;
}

export interface StockMove {
  move_id: string;
  date: string;
  sku: string;
  from_location: string;
  to_location: string;
  quantity: number;
  unit_cost: number;
  total_value: number;
  reference_doc: string;
  created_by: string;
}

export interface CRMLead {
  lead_id: string;
  customer_id: string;
  title: string;
  contact_person: string;
  email: string;
  phone: string;
  expected_revenue: number;
  stage: 'new' | 'qualified' | 'proposition' | 'won' | 'lost';
  priority: 'low' | 'medium' | 'high';
  salesperson: string;
  created_at: string;
  converted_opportunity_id?: string;
  converted_quotation_id?: string;
  notes: string[];
}

export interface OrderLineItem {
  id: string;
  sku: string;
  product_name: string;
  size: string;
  color: string;
  quantity: number;
  unit_price: number;
  discount_pct: number;
  tax_amount: number; // 11% effective PPN
  subtotal: number; // qty * price * (1 - disc)
  total: number; // subtotal + tax
}

export interface SalesOrder {
  order_id: string; // S00007, Q00008, etc.
  type: 'quotation' | 'sales_order';
  customer_id: string;
  order_date: string;
  expiration_date: string;
  payment_terms: 'TUNAI' | 'NET14' | 'NET30';
  warehouse_id: LocationId;
  salesperson: string;
  status: 'draft' | 'sent' | 'confirmed' | 'done' | 'cancelled';
  lines: OrderLineItem[];
  untaxed_amount: number;
  discount_amount: number;
  tax_amount: number;
  total_amount: number;
  discount_approved: boolean;
  discount_approved_by?: string;
  created_from_lead_id?: string;
  delivery_ids: string[];
  invoice_ids: string[];
  notes?: string;
  is_locked: boolean;
}

export interface DeliveryLineItem {
  sku: string;
  demand: number;
  reserved: number;
  done: number;
  backorder: number;
}

export interface DeliveryOrder {
  delivery_id: string; // WH/OUT/00007
  source_so_id: string;
  customer_id: string;
  source_location: LocationId;
  scheduled_date: string;
  status: 'draft' | 'confirmed' | 'done' | 'cancelled';
  lines: DeliveryLineItem[];
  is_backorder?: boolean;
  parent_delivery_id?: string;
  journal_posted: boolean;
  cogs_posted: number;
  created_at: string;
}

export interface POLineItem {
  id: string;
  sku: string;
  product_name: string;
  size: string;
  color: string;
  quantity: number;
  unit_cost: number;
  tax_amount: number;
  subtotal: number;
  total: number;
}

export interface PurchaseOrder {
  po_id: string; // PO00007
  vendor_id: string;
  order_date: string;
  expected_arrival: string;
  payment_terms: 'TUNAI' | 'NET14' | 'NET30';
  destination_location_id: LocationId;
  buyer: string;
  status: 'draft' | 'rfq_sent' | 'confirmed' | 'done' | 'cancelled';
  lines: POLineItem[];
  untaxed_amount: number;
  tax_amount: number;
  total_amount: number;
  receipt_ids: string[];
  bill_ids: string[];
  is_locked: boolean;
}

export interface ReceiptLineItem {
  sku: string;
  ordered: number;
  received: number;
  accepted: number;
  rejected: number;
  remaining: number;
}

export interface Receipt {
  receipt_id: string; // WH/IN/00007
  source_po_id: string;
  vendor_id: string;
  destination_location: LocationId;
  receipt_date: string;
  status: 'draft' | 'confirmed' | 'done';
  lines: ReceiptLineItem[];
  journal_posted: boolean;
  inspection_completed: boolean;
  notes?: string;
}

export interface InvoiceLineItem {
  sku: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  tax_amount: number;
  line_total: number;
}

export interface CustomerInvoice {
  invoice_id: string; // INV/2026/0007
  customer_id: string;
  source_so_id: string;
  delivery_id: string;
  invoice_date: string;
  due_date: string;
  payment_terms: 'TUNAI' | 'NET14' | 'NET30';
  lines: InvoiceLineItem[];
  untaxed_amount: number;
  tax_amount: number;
  total_amount: number;
  amount_paid: number;
  residual: number;
  status: 'draft' | 'posted' | 'partially_paid' | 'paid' | 'cancelled';
  payment_ids: string[];
  journal_id?: string;
}

export interface BillLineItem {
  sku: string;
  product_name: string;
  qty_billable: number;
  unit_cost: number;
  tax_amount: number;
  line_total: number;
}

export interface VendorBill {
  bill_id: string; // BILL/2026/0007
  vendor_id: string;
  source_po_id: string;
  receipt_id: string;
  bill_date: string;
  due_date: string;
  lines: BillLineItem[];
  untaxed_amount: number;
  tax_amount: number;
  total_amount: number;
  amount_paid: number;
  residual: number;
  status: 'draft' | 'posted' | 'partially_paid' | 'paid' | 'cancelled';
  payment_ids: string[];
  journal_id?: string;
}

export interface PaymentRecord {
  payment_id: string; // PAY/2026/0001
  doc_type: 'customer_invoice' | 'vendor_bill';
  doc_id: string;
  party_name: string;
  date: string;
  payment_method: 'bank' | 'cash';
  amount: number;
  residual_after: number;
  journal_entry_id?: string;
  created_by: string;
}

export interface POSTransactionLine {
  sku: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  discount_pct: number;
  subtotal: number;
  tax_amount: number;
  line_total: number;
}

export interface POSTransaction {
  pos_id: string; // POS/2026/0001
  date: string;
  cashier_name: string;
  customer_name: string;
  location_id: 'STORE-BDG';
  lines: POSTransactionLine[];
  untaxed_amount: number;
  tax_amount: number;
  total_amount: number;
  payment_method: 'cash' | 'bank';
  amount_paid: number;
  change: number;
  journal_id: string;
  status: 'completed';
}

export interface CustomerReturn {
  return_id: string; // RET/2026/0007
  source_so_id: string;
  delivery_id: string;
  invoice_id: string;
  customer_id: string;
  date: string;
  sku: string;
  delivered_qty: number;
  returned_qty: number;
  inspected_qty: number;
  accepted_qty: number;
  rejected_qty: number;
  reason: string;
  inspection_notes: string;
  status: 'draft' | 'inspected' | 'done';
  credit_note_id?: string;
  stock_restored: boolean;
  cogs_reversed: boolean;
}

export interface CreditNote {
  cn_id: string; // CN/2026/0007
  source_return_id: string;
  customer_id: string;
  invoice_id: string;
  date: string;
  sku: string;
  quantity: number;
  unit_price: number;
  tax_amount: number;
  total_amount: number;
  status: 'posted';
  journal_id: string;
}

export interface InternalTransfer {
  transfer_id: string; // TRANS/2026/0001
  source_location: LocationId;
  dest_location: LocationId;
  sku: string;
  quantity: number;
  date: string;
  requested_by: string;
  status: 'draft' | 'confirmed' | 'done';
}

export interface Account {
  code: string;
  name: string;
  type: 'Aset' | 'Aset transitori' | 'Liabilitas' | 'Ekuitas' | 'Pendapatan' | 'Kontra-pendapatan' | 'Beban';
}

export interface JournalLine {
  account_code: string;
  account_name: string;
  label: string;
  debit: number;
  credit: number;
}

export interface JournalEntry {
  entry_id: string; // JRN/2026/0001
  date: string;
  reference: string;
  journal_type: 'sales' | 'purchase' | 'inventory' | 'bank' | 'cash' | 'general';
  source_doc: string;
  lines: JournalLine[];
  total_debit: number;
  total_credit: number;
  posted: boolean;
  created_at: string;
}

export interface AuditLog {
  log_id: string;
  timestamp: string;
  user: string;
  role: UserRole;
  action: string;
  module: string;
  document_number: string;
  previous_value?: string;
  new_value?: string;
  description: string;
  result: 'SUCCESS' | 'DENIED' | 'BLOCKED' | 'VALIDATION_FAILED';
}

export interface TestScenario {
  test_id: string;
  title: string;
  category: string;
  feature_id: string;
  rule_id: string;
  situation: string;
  expected: string;
  required_evidence: string;
  status?: 'not_run' | 'passed' | 'failed';
  actual_result?: string;
  evidence_doc?: string;
}
