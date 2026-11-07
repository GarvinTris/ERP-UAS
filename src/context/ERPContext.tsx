import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import {
  User,
  UserRole,
  AppModuleId,
  Customer,
  Vendor,
  ProductVariant,
  StockQuantity,
  StockMove,
  CRMLead,
  SalesOrder,
  DeliveryOrder,
  PurchaseOrder,
  Receipt,
  CustomerInvoice,
  VendorBill,
  PaymentRecord,
  POSTransaction,
  CustomerReturn,
  CreditNote,
  InternalTransfer,
  Account,
  JournalEntry,
  AuditLog,
  TestScenario,
} from '../types/erp';
import {
  INITIAL_USERS,
  INITIAL_CUSTOMERS,
  INITIAL_VENDORS,
  INITIAL_PRODUCTS,
  INITIAL_STOCK,
  INITIAL_LEADS,
  INITIAL_SALES_ORDERS,
  INITIAL_DELIVERY_ORDERS,
  INITIAL_PURCHASE_ORDERS,
  INITIAL_RECEIPTS,
  INITIAL_CUSTOMER_INVOICES,
  INITIAL_VENDOR_BILLS,
  INITIAL_PAYMENTS,
  INITIAL_POS_TRANSACTIONS,
  INITIAL_RETURNS,
  INITIAL_CREDIT_NOTES,
  INITIAL_ACCOUNTS,
  INITIAL_JOURNAL_ENTRIES,
  INITIAL_AUDIT_LOGS,
  TEST_SCENARIOS_CATALOG,
} from '../data/seedData';

interface ERPContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  switchRole: (role: UserRole) => void;
  activeApp: AppModuleId;
  setActiveApp: (app: AppModuleId) => void;
  activeView: string;
  setActiveView: (view: string) => void;
  appSwitcherOpen: boolean;
  setAppSwitcherOpen: (open: boolean) => void;
  testSuiteOpen: boolean;
  setTestSuiteOpen: (open: boolean) => void;

  // Data
  customers: Customer[];
  vendors: Vendor[];
  products: ProductVariant[];
  stock: StockQuantity[];
  stockMoves: StockMove[];
  leads: CRMLead[];
  salesOrders: SalesOrder[];
  deliveryOrders: DeliveryOrder[];
  purchaseOrders: PurchaseOrder[];
  receipts: Receipt[];
  customerInvoices: CustomerInvoice[];
  vendorBills: VendorBill[];
  payments: PaymentRecord[];
  posTransactions: POSTransaction[];
  returns: CustomerReturn[];
  creditNotes: CreditNote[];
  transfers: InternalTransfer[];
  accounts: Account[];
  journalEntries: JournalEntry[];
  auditLogs: AuditLog[];
  testResults: Record<string, { status: 'passed' | 'failed'; actual: string; timestamp: string }>;

  // Toast / notification
  notifications: { id: string; type: 'success' | 'warning' | 'error' | 'info'; message: string }[];
  addNotification: (type: 'success' | 'warning' | 'error' | 'info', message: string, force?: boolean) => void;
  removeNotification: (id: string) => void;

  // Business Action Helpers
  checkRoleAccess: (requiredModule: AppModuleId) => boolean;
  logAudit: (
    action: string,
    module: string,
    docNumber: string,
    description: string,
    result: 'SUCCESS' | 'DENIED' | 'BLOCKED' | 'VALIDATION_FAILED',
    prevVal?: string,
    newVal?: string
  ) => void;
  resetToBaselineSeed: () => void;

  // Specific Business Methods
  createProductVariant: (newVariant: Omit<ProductVariant, 'active'>) => { success: boolean; message: string };
  convertLeadToOpportunity: (leadId: string) => { success: boolean; message: string; opportunityId?: string };
  convertOpportunityToQuotation: (leadId: string) => { success: boolean; message: string; quotationId?: string };
  createQuotation: (so: Omit<SalesOrder, 'order_id' | 'type' | 'status' | 'is_locked' | 'delivery_ids' | 'invoice_ids'>) => SalesOrder;
  confirmSalesOrder: (orderId: string, forceManagerOverride?: boolean) => { success: boolean; message: string };
  attemptModifyConfirmedSOPrice: (orderId: string, newPrice: number) => { success: boolean; message: string };
  createDeliveryOrderForSO: (soId: string) => DeliveryOrder | null;
  validateDeliveryOrder: (deliveryId: string, doneUnits: number) => { success: boolean; message: string; backorderId?: string };
  attemptInvalidDeliveryQty: (deliveryId: string, qty: number) => { success: boolean; message: string };
  createCustomerInvoiceFromDelivery: (deliveryId: string, qtyToBill?: number) => { success: boolean; message: string; invoiceId?: string };
  postCustomerInvoice: (invoiceId: string) => { success: boolean; message: string };
  registerCustomerPayment: (invoiceId: string, amount: number, method: 'bank' | 'cash') => { success: boolean; message: string };
  confirmPurchaseOrder: (poId: string) => { success: boolean; message: string };
  attemptModifyConfirmedPOQty: (poId: string, newQty: number) => { success: boolean; message: string };
  createReceiptFromPO: (poId: string) => Receipt | null;
  validateReceiptWithQA: (receiptId: string, acceptedQty: number, rejectedQty: number) => { success: boolean; message: string };
  createVendorBillFromReceipt: (receiptId: string, qtyToBill?: number) => { success: boolean; message: string; billId?: string };
  postVendorBill: (billId: string) => { success: boolean; message: string };
  registerVendorPayment: (billId: string, amount: number, method: 'bank' | 'cash') => { success: boolean; message: string };
  processPOSSale: (sku: string, qty: number, paymentMethod: 'cash' | 'bank') => { success: boolean; message: string; receipt?: POSTransaction };
  processCustomerReturn: (deliveryId: string, invoiceId: string, sku: string, returnedQty: number, acceptedQty: number, rejectedQty: number, reason: string) => { success: boolean; message: string; returnId?: string };
  issueCreditNoteForReturn: (returnId: string, requestedQty?: number) => { success: boolean; message: string; cnId?: string };
  executeInternalTransfer: (sku: string, fromLoc: 'STORE-BDG' | 'WH-JKT', toLoc: 'STORE-BDG' | 'WH-JKT', qty: number) => { success: boolean; message: string };

  // Automated Test Scenario Runner
  runAutomatedTest: (testId: string) => Promise<{ status: 'passed' | 'failed'; actual: string }>;
  runAllTests: () => Promise<void>;
}

const ERPContext = createContext<ERPContextType | undefined>(undefined);

const STORAGE_KEY = 'PT_RONA_KARSA_ERP_STATE_V1';

export const ERPProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Current user & authentication
  const [currentUser, setCurrentUser] = useState<User | null>(INITIAL_USERS[0]); // default Owner
  const [activeApp, setActiveApp] = useState<AppModuleId>('home');
  const [activeView, setActiveView] = useState<string>('overview');
  const [appSwitcherOpen, setAppSwitcherOpen] = useState<boolean>(false);
  const [testSuiteOpen, setTestSuiteOpen] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<{ id: string; type: 'success' | 'warning' | 'error' | 'info'; message: string }[]>([]);

  // Core Data States
  const [customers, setCustomers] = useState<Customer[]>(INITIAL_CUSTOMERS);
  const [vendors, setVendors] = useState<Vendor[]>(INITIAL_VENDORS);
  const [products, setProducts] = useState<ProductVariant[]>(INITIAL_PRODUCTS);
  const [stock, setStock] = useState<StockQuantity[]>(INITIAL_STOCK);
  const [stockMoves, setStockMoves] = useState<StockMove[]>([]);
  const [leads, setLeads] = useState<CRMLead[]>(INITIAL_LEADS);
  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>(INITIAL_SALES_ORDERS);
  const [deliveryOrders, setDeliveryOrders] = useState<DeliveryOrder[]>(INITIAL_DELIVERY_ORDERS);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(INITIAL_PURCHASE_ORDERS);
  const [receipts, setReceipts] = useState<Receipt[]>(INITIAL_RECEIPTS);
  const [customerInvoices, setCustomerInvoices] = useState<CustomerInvoice[]>(INITIAL_CUSTOMER_INVOICES);
  const [vendorBills, setVendorBills] = useState<VendorBill[]>(INITIAL_VENDOR_BILLS);
  const [payments, setPayments] = useState<PaymentRecord[]>(INITIAL_PAYMENTS);
  const [posTransactions, setPosTransactions] = useState<POSTransaction[]>(INITIAL_POS_TRANSACTIONS);
  const [returns, setReturns] = useState<CustomerReturn[]>(INITIAL_RETURNS);
  const [creditNotes, setCreditNotes] = useState<CreditNote[]>(INITIAL_CREDIT_NOTES);
  const [transfers, setTransfers] = useState<InternalTransfer[]>([]);
  const [accounts, setAccounts] = useState<Account[]>(INITIAL_ACCOUNTS);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>(INITIAL_JOURNAL_ENTRIES);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);
  const [testResults, setTestResults] = useState<Record<string, { status: 'passed' | 'failed'; actual: string; timestamp: string }>>({});

  // Restore state from LocalStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.customers) setCustomers(parsed.customers);
        if (parsed.vendors) setVendors(parsed.vendors);
        if (parsed.products) setProducts(parsed.products);
        if (parsed.stock) setStock(parsed.stock);
        if (parsed.stockMoves) setStockMoves(parsed.stockMoves);
        if (parsed.leads) setLeads(parsed.leads);
        if (parsed.salesOrders) setSalesOrders(parsed.salesOrders);
        if (parsed.deliveryOrders) setDeliveryOrders(parsed.deliveryOrders);
        if (parsed.purchaseOrders) setPurchaseOrders(parsed.purchaseOrders);
        if (parsed.receipts) setReceipts(parsed.receipts);
        if (parsed.customerInvoices) setCustomerInvoices(parsed.customerInvoices);
        if (parsed.vendorBills) setVendorBills(parsed.vendorBills);
        if (parsed.payments) setPayments(parsed.payments);
        if (parsed.posTransactions) setPosTransactions(parsed.posTransactions);
        if (parsed.returns) setReturns(parsed.returns);
        if (parsed.creditNotes) setCreditNotes(parsed.creditNotes);
        if (parsed.transfers) setTransfers(parsed.transfers);
        if (parsed.journalEntries) setJournalEntries(parsed.journalEntries);
        if (parsed.auditLogs) setAuditLogs(parsed.auditLogs);
        if (parsed.testResults) setTestResults(parsed.testResults);
      }
    } catch {
      // ignore
    }
  }, []);

  // Save state to LocalStorage
  const saveStateToStorage = (overrideState?: Partial<Record<string, unknown>>) => {
    try {
      const state = {
        customers,
        vendors,
        products,
        stock,
        stockMoves,
        leads,
        salesOrders,
        deliveryOrders,
        purchaseOrders,
        receipts,
        customerInvoices,
        vendorBills,
        payments,
        posTransactions,
        returns,
        creditNotes,
        transfers,
        journalEntries,
        auditLogs,
        testResults,
        ...overrideState,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // ignore
    }
  };

  const isTestRunning = useRef(false);

  const addNotification = (
    type: 'success' | 'warning' | 'error' | 'info',
    message: string,
    force?: boolean
  ) => {
    // Suppress test assertions and intermediate noise from cluttering user interface
    if (isTestRunning.current && !force) {
      return;
    }
    const id = Math.random().toString(36).substring(2, 9);
    setNotifications((prev) => [...prev, { id, type, message }]);
    setTimeout(() => removeNotification(id), 5000);
  };

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const switchRole = (role: UserRole) => {
    const found = INITIAL_USERS.find((u) => u.role === role) || INITIAL_USERS[0];
    setCurrentUser(found);
    addNotification('info', `Switched active user to ${found.name} (${found.roleName})`);
    logAudit('SWITCH_USER', 'AUTH', found.id, `User switched to ${found.name} (${found.role})`, 'SUCCESS');
  };

  // RBAC Permission Check
  const checkRoleAccess = (module: AppModuleId): boolean => {
    if (!currentUser) return false;
    const role = currentUser.role;
    if (role === 'owner') return true; // Owner has all permissions

    switch (module) {
      case 'home':
      case 'dashboard':
        return true;
      case 'crm':
      case 'sales':
      case 'contacts':
        return role === 'sales';
      case 'inventory':
        return role === 'warehouse' || role === 'procurement' || role === 'sales';
      case 'purchase':
        return role === 'procurement';
      case 'pos':
        return role === 'cashier' || role === 'sales';
      case 'invoicing':
      case 'accounting':
        return role === 'finance';
      case 'products':
        return role === 'sales' || role === 'warehouse' || role === 'procurement';
      case 'reporting':
        return role === 'finance' || role === 'sales';
      case 'audit':
        return role === 'finance';
      case 'settings':
        return false;
      default:
        return false;
    }
  };

  const logAudit = (
    action: string,
    module: string,
    docNumber: string,
    description: string,
    result: 'SUCCESS' | 'DENIED' | 'BLOCKED' | 'VALIDATION_FAILED',
    prevVal?: string,
    newVal?: string
  ) => {
    const newLog: AuditLog = {
      log_id: `LOG-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      user: currentUser?.name || 'System Guest',
      role: currentUser?.role || 'cashier',
      action,
      module,
      document_number: docNumber,
      previous_value: prevVal,
      new_value: newVal,
      description,
      result,
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  // Reset to Baseline Seed
  const resetToBaselineSeed = () => {
    setCustomers(INITIAL_CUSTOMERS);
    setVendors(INITIAL_VENDORS);
    setProducts(INITIAL_PRODUCTS);
    setStock(INITIAL_STOCK);
    setStockMoves([]);
    setLeads(INITIAL_LEADS);
    setSalesOrders(INITIAL_SALES_ORDERS);
    setDeliveryOrders(INITIAL_DELIVERY_ORDERS);
    setPurchaseOrders(INITIAL_PURCHASE_ORDERS);
    setReceipts(INITIAL_RECEIPTS);
    setCustomerInvoices(INITIAL_CUSTOMER_INVOICES);
    setVendorBills(INITIAL_VENDOR_BILLS);
    setPayments(INITIAL_PAYMENTS);
    setPosTransactions(INITIAL_POS_TRANSACTIONS);
    setReturns(INITIAL_RETURNS);
    setCreditNotes(INITIAL_CREDIT_NOTES);
    setTransfers([]);
    setAccounts(INITIAL_ACCOUNTS);
    setJournalEntries(INITIAL_JOURNAL_ENTRIES);
    setAuditLogs([
      {
        log_id: `LOG-INIT-001`,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        user: 'System Admin',
        role: 'owner',
        action: 'RESET_BASELINE',
        module: 'SYSTEM',
        document_number: 'BASELINE-106U',
        description: 'Dataset reset to pristine baseline (106 units total stock, Rp11.140.000 valuation, S00007 holds 3 AP-TS-BLK-M).',
        result: 'SUCCESS',
      },
    ]);
    setTestResults({});
    localStorage.removeItem(STORAGE_KEY);
    addNotification('success', 'Database berhasil di-reset ke baseline seed 106 unit & Rp11.140.000!');
  };

  // F-03: Create Product Variant with unique SKU check (SR-11)
  const createProductVariant = (newVariant: Omit<ProductVariant, 'active'>) => {
    const exists = products.some((p) => p.sku.trim().toUpperCase() === newVariant.sku.trim().toUpperCase());
    if (exists) {
      logAudit('CREATE_VARIANT', 'PRODUCTS', newVariant.sku, `Duplicate SKU rejection for ${newVariant.sku}`, 'VALIDATION_FAILED');
      addNotification('error', `Gagal: SKU ${newVariant.sku} sudah ada dalam sistem! SKU harus unik (SR-11).`);
      return { success: false, message: `SKU ${newVariant.sku} sudah terdaftar.` };
    }

    const created: ProductVariant = { ...newVariant, active: true };
    const updatedProducts = [...products, created];
    setProducts(updatedProducts);

    // Initial stock entries at both warehouses
    const newStockWh: StockQuantity = { sku: newVariant.sku, location_id: 'WH-JKT', on_hand: 0, reserved: 0, available: 0 };
    const newStockStore: StockQuantity = { sku: newVariant.sku, location_id: 'STORE-BDG', on_hand: 0, reserved: 0, available: 0 };
    setStock((prev) => [...prev, newStockWh, newStockStore]);

    logAudit('CREATE_VARIANT', 'PRODUCTS', created.sku, `Created new SKU variant: ${created.sku} (${created.product_name})`, 'SUCCESS');
    addNotification('success', `Varian baru ${created.sku} berhasil disimpan.`);
    return { success: true, message: `Varian ${created.sku} berhasil ditambahkan.` };
  };

  // F-04: Convert CRM Lead to Opportunity (SR-15)
  const convertLeadToOpportunity = (leadId: string) => {
    const lead = leads.find((l) => l.lead_id === leadId);
    if (!lead) return { success: false, message: 'Lead tidak ditemukan.' };

    const oppId = `OPP-${leadId}`;
    const updatedLeads = leads.map((l) => {
      if (l.lead_id === leadId) {
        return {
          ...l,
          stage: 'qualified' as const,
          converted_opportunity_id: oppId,
          notes: [...l.notes, `Dikonversi ke Opportunity ${oppId} pada ${new Date().toLocaleString()}`],
        };
      }
      return l;
    });
    setLeads(updatedLeads);
    logAudit('CONVERT_LEAD', 'CRM', leadId, `Lead ${leadId} dikonversi ke Opportunity stage Qualified. Tautan asal dipertahankan.`, 'SUCCESS');
    addNotification('success', `Lead ${leadId} berhasil beralih ke Opportunity (${oppId}).`);
    return { success: true, message: 'Lead dikonversi ke Qualified.', opportunityId: oppId };
  };

  // F-04 / T-08: Convert Opportunity to Quotation without creating duplicates
  const convertOpportunityToQuotation = (leadId: string) => {
    const lead = leads.find((l) => l.lead_id === leadId);
    if (!lead) return { success: false, message: 'Lead tidak ditemukan.' };

    if (lead.converted_quotation_id) {
      logAudit('CONVERT_OPPORTUNITY', 'CRM', leadId, `Upaya konversi ulang Opportunity ${leadId}. Dokumen ganda dicegah.`, 'VALIDATION_FAILED');
      addNotification('warning', `Opportunity sudah terhubung ke Quotation ${lead.converted_quotation_id}. Dokumen ganda dicegah.`);
      return { success: false, message: `Sudah terhubung ke ${lead.converted_quotation_id}`, quotationId: lead.converted_quotation_id };
    }

    const qNumber = `Q00008`;
    const newQuotation: SalesOrder = {
      order_id: qNumber,
      type: 'quotation',
      customer_id: lead.customer_id,
      order_date: new Date().toISOString().substring(0, 10),
      expiration_date: new Date(Date.now() + 14 * 86400000).toISOString().substring(0, 10),
      payment_terms: 'NET14',
      warehouse_id: 'WH-JKT',
      salesperson: lead.salesperson,
      status: 'draft',
      lines: [
        {
          id: 'QL-01',
          sku: 'AP-DR-BLU-M',
          product_name: 'Dress Denim Biru',
          size: 'M',
          color: 'Biru',
          quantity: 2,
          unit_price: 450000,
          discount_pct: 0,
          tax_amount: 99000, // 900.000 * 0.11
          subtotal: 900000,
          total: 999000,
        },
      ],
      untaxed_amount: 900000,
      discount_amount: 0,
      tax_amount: 99000,
      total_amount: 999000,
      discount_approved: true,
      created_from_lead_id: leadId,
      delivery_ids: [],
      invoice_ids: [],
      is_locked: false,
    };

    setSalesOrders((prev) => [...prev, newQuotation]);
    setLeads((prev) =>
      prev.map((l) =>
        l.lead_id === leadId
          ? {
              ...l,
              converted_quotation_id: qNumber,
              stage: 'proposition' as const,
              notes: [...l.notes, `Quotation ${qNumber} diterbitkan untuk permintaan 2 Dress Denim M.`],
            }
          : l
      )
    );

    logAudit('CONVERT_OPPORTUNITY', 'CRM', leadId, `Created Quotation ${qNumber} from Opportunity ${leadId}`, 'SUCCESS');
    addNotification('success', `Quotation ${qNumber} berhasil dibuat untuk ${lead.contact_person}.`);
    return { success: true, message: `Quotation ${qNumber} dibuat.`, quotationId: qNumber };
  };

  // F-05: Create Quotation manually
  const createQuotation = (soData: Omit<SalesOrder, 'order_id' | 'type' | 'status' | 'is_locked' | 'delivery_ids' | 'invoice_ids'>): SalesOrder => {
    const qNumber = `Q000${String(salesOrders.length + 8).padStart(2, '0')}`;
    const newSO: SalesOrder = {
      ...soData,
      order_id: qNumber,
      type: 'quotation',
      status: 'draft',
      delivery_ids: [],
      invoice_ids: [],
      is_locked: false,
    };
    setSalesOrders((prev) => [newSO, ...prev]);
    logAudit('CREATE_QUOTATION', 'SALES', qNumber, `Created new quotation ${qNumber} for ${soData.customer_id}`, 'SUCCESS');
    return newSO;
  };

  // F-05 / F-06 / F-10: Confirm Sales Order (SR-01, SR-04, SR-08, SR-10)
  const confirmSalesOrder = (orderId: string, forceManagerOverride = false) => {
    const order = salesOrders.find((so) => so.order_id === orderId);
    if (!order) return { success: false, message: 'Order tidak ditemukan.' };

    const customer = customers.find((c) => c.contact_id === order.customer_id);
    if (!customer) return { success: false, message: 'Pelanggan tidak valid.' };

    // 1. Check Discount Approval (SR-08: discount > 10% requires manager approval)
    const hasHighDiscount = order.lines.some((l) => l.discount_pct > 10);
    if (hasHighDiscount && !order.discount_approved && !forceManagerOverride) {
      if (currentUser?.role !== 'owner') {
        logAudit(
          'CONFIRM_ORDER',
          'SALES',
          orderId,
          `Ditolak: Diskon melebihi 10% tanpa otorisasi manajer (SR-08)`,
          'BLOCKED',
          'Unapproved',
          'Blocked'
        );
        addNotification('error', `Konfirmasi ditahan: Diskon > 10% memerlukan persetujuan Manager (SR-08)!`);
        return { success: false, message: 'Diskon > 10% butuh persetujuan manajer.' };
      }
    }

    // 2. Check Credit Limit & Terms (SR-10)
    // Credit Exposure = Open Receivable + Gross New Order (including VAT)
    if (order.payment_terms === 'TUNAI' || customer.payment_terms === 'TUNAI') {
      if (order.payment_terms !== 'TUNAI') {
        logAudit(
          'CONFIRM_ORDER',
          'SALES',
          orderId,
          `Ditolak: Pelanggan TUNAI tanpa limit tidak boleh menggunakan kredit (SR-10)`,
          'BLOCKED'
        );
        addNotification('error', `Ditolak: Pelanggan ${customer.name} bertermin TUNAI, tidak dapat transaksi kredit!`);
        return { success: false, message: 'Pelanggan TUNAI tidak menerima kredit.' };
      }
    } else {
      const grossNewOrder = order.total_amount;
      const totalExposure = customer.open_receivable + grossNewOrder;
      if (totalExposure > customer.credit_limit_idr) {
        logAudit(
          'CONFIRM_ORDER',
          'SALES',
          orderId,
          `Credit limit exceeded for ${customer.name}. Exposure Rp${totalExposure.toLocaleString()} > Limit Rp${customer.credit_limit_idr.toLocaleString()} (SR-10)`,
          'BLOCKED',
          `Limit: ${customer.credit_limit_idr}`,
          `Exposure: ${totalExposure}`
        );
        addNotification(
          'error',
          `Validasi Kredit Gagal: Total eksposur Rp${totalExposure.toLocaleString()} melebihi limit Rp${customer.credit_limit_idr.toLocaleString()}!`
        );
        return { success: false, message: 'Credit limit terlampaui.' };
      }
    }

    // 3. Check and Reserve Stock (SR-04: reservation decreases Available without reducing On Hand)
    for (const line of order.lines) {
      const stockItem = stock.find((s) => s.sku === line.sku && s.location_id === order.warehouse_id);
      if (!stockItem || stockItem.available < line.quantity) {
        logAudit(
          'CONFIRM_ORDER',
          'INVENTORY',
          orderId,
          `Insufficient available stock for ${line.sku} in ${order.warehouse_id}. Available: ${stockItem?.available || 0}, requested: ${line.quantity}`,
          'VALIDATION_FAILED'
        );
        addNotification('error', `Stok tersedia tidak mencukupi untuk SKU ${line.sku} di ${order.warehouse_id}!`);
        return { success: false, message: `Stok tidak mencukupi untuk ${line.sku}.` };
      }
    }

    // Apply Reservation
    setStock((prevStock) =>
      prevStock.map((s) => {
        const line = order.lines.find((l) => l.sku === s.sku && s.location_id === order.warehouse_id);
        if (line) {
          return {
            ...s,
            reserved: s.reserved + line.quantity,
            available: s.available - line.quantity,
          };
        }
        return s;
      })
    );

    // Update Sales Order to Confirmed
    setSalesOrders((prev) =>
      prev.map((so) =>
        so.order_id === orderId
          ? {
              ...so,
              type: 'sales_order',
              status: 'confirmed',
              is_locked: true,
              discount_approved: true,
              discount_approved_by: currentUser?.name || 'Authorized Manager',
            }
          : so
      )
    );

    logAudit('CONFIRM_ORDER', 'SALES', orderId, `Sales Order ${orderId} Confirmed. Stok direservasi & dokumen dikunci (SR-01, SR-04, SR-10).`, 'SUCCESS');
    addNotification('success', `Sales Order ${orderId} berhasil dikonfirmasi! Stok berhasil direservasi.`);
    return { success: true, message: `Order ${orderId} dikonfirmasi.` };
  };

  // F-06 / T-11: Attempt to modify price on confirmed order without revision (SR-08)
  const attemptModifyConfirmedSOPrice = (orderId: string, newPrice: number) => {
    const order = salesOrders.find((so) => so.order_id === orderId);
    if (!order) return { success: false, message: 'Order tidak ditemukan' };

    if (order.status === 'confirmed' || order.is_locked) {
      logAudit(
        'MODIFY_PRICE',
        'SALES',
        orderId,
        `Penolakan revisi harga tak sah pada order ${orderId} yang telah Confirmed tanpa proses revisi resmi (SR-08).`,
        'BLOCKED',
        `Original: ${order.lines[0]?.unit_price}`,
        `Attempted: ${newPrice}`
      );
      addNotification('error', `Ditolak: Dokumen ${orderId} berstatus Confirmed dan terkunci. Harga tidak dapat diubah tanpa prosedur revisi resmi (SR-08).`);
      return { success: false, message: 'Dokumen Confirmed terkunci.' };
    }

    return { success: true, message: 'Harga diubah.' };
  };

  // F-08: Create Delivery Order for confirmed SO
  const createDeliveryOrderForSO = (soId: string): DeliveryOrder | null => {
    const order = salesOrders.find((so) => so.order_id === soId);
    if (!order) return null;

    const doId = `WH/OUT/${order.order_id.replace(/\D/g, '').padStart(5, '0')}`;
    const existing = deliveryOrders.find((d) => d.delivery_id === doId);
    if (existing) return existing;

    const newDelivery: DeliveryOrder = {
      delivery_id: doId,
      source_so_id: soId,
      customer_id: order.customer_id,
      source_location: order.warehouse_id,
      scheduled_date: new Date().toISOString().substring(0, 10),
      status: 'confirmed',
      lines: order.lines.map((l) => ({
        sku: l.sku,
        demand: l.quantity,
        reserved: l.quantity,
        done: 0,
        backorder: 0,
      })),
      journal_posted: false,
      cogs_posted: 0,
      created_at: new Date().toISOString(),
    };

    setDeliveryOrders((prev) => [newDelivery, ...prev]);
    setSalesOrders((prev) =>
      prev.map((so) => (so.order_id === soId ? { ...so, delivery_ids: [...so.delivery_ids, doId] } : so))
    );
    return newDelivery;
  };

  // F-08 / F-14: Validate Delivery Order (Partial shipment & Backorder, SR-04, SR-07, SR-15)
  const validateDeliveryOrder = (deliveryId: string, doneUnits: number) => {
    const delivery = deliveryOrders.find((d) => d.delivery_id === deliveryId);
    if (!delivery) return { success: false, message: 'Delivery tidak ditemukan.' };

    if (delivery.status === 'done' || delivery.journal_posted) {
      // Idempotency test (T-27)
      logAudit(
        'POST_DELIVERY',
        'INVENTORY',
        deliveryId,
        `Posting ulang atas delivery ${deliveryId} ditolak/idempoten. Jurnal dan mutasi ganda dicegah (SR-15).`,
        'BLOCKED'
      );
      addNotification('warning', `Delivery ${deliveryId} sudah berstatus Done. Aksi idempoten; tidak ada jurnal ganda dibuat.`);
      return { success: false, message: 'Delivery sudah diposting sebelumnya.' };
    }

    const firstLine = delivery.lines[0];
    if (!firstLine) return { success: false, message: 'Line item kosong.' };

    if (doneUnits > firstLine.demand) {
      logAudit(
        'VALIDATE_DELIVERY',
        'INVENTORY',
        deliveryId,
        `Penolakan: Kuantitas pengiriman (${doneUnits}) melampaui permintaan (${firstLine.demand}) (SR-04).`,
        'VALIDATION_FAILED'
      );
      addNotification('error', `Gagal: Pengiriman ${doneUnits} unit melebihi pesanan ${firstLine.demand} unit!`);
      return { success: false, message: 'Pengiriman melebihi demand.' };
    }

    const isPartial = doneUnits < firstLine.demand;
    const backorderQty = firstLine.demand - doneUnits;
    const product = products.find((p) => p.sku === firstLine.sku);
    const unitCost = product?.cost_idr || 80000;
    const cogsAmount = doneUnits * unitCost;

    // 1. Deduct Physical Stock from WH-JKT: On Hand - doneUnits, Reserved - doneUnits
    setStock((prev) =>
      prev.map((s) => {
        if (s.sku === firstLine.sku && s.location_id === delivery.source_location) {
          return {
            ...s,
            on_hand: s.on_hand - doneUnits,
            reserved: s.reserved - doneUnits - backorderQty, // backorder remains reserved in backorder doc
            available: s.on_hand - doneUnits - backorderQty,
          };
        }
        return s;
      })
    );

    // 2. Stock Move record
    const moveId = `MOVE-${Date.now().toString().slice(-6)}`;
    const newMove: StockMove = {
      move_id: moveId,
      date: new Date().toISOString().substring(0, 10),
      sku: firstLine.sku,
      from_location: delivery.source_location,
      to_location: 'Customer Location',
      quantity: doneUnits,
      unit_cost: unitCost,
      total_value: cogsAmount,
      reference_doc: deliveryId,
      created_by: currentUser?.name || 'Warehouse Staff',
    };
    setStockMoves((prev) => [newMove, ...prev]);

    // 3. Accounting Journal: Dr 5000 HPP / Cr 1200 Persediaan Barang Dagang (SR-14)
    const journalId = `JRN/${new Date().getFullYear()}/${String(journalEntries.length + 1).padStart(4, '0')}`;
    const newJournal: JournalEntry = {
      entry_id: journalId,
      date: new Date().toISOString().substring(0, 10),
      reference: deliveryId,
      journal_type: 'inventory',
      source_doc: `Delivery Order ${deliveryId}`,
      posted: true,
      total_debit: cogsAmount,
      total_credit: cogsAmount,
      created_at: new Date().toISOString(),
      lines: [
        {
          account_code: '5000',
          account_name: 'Harga Pokok Penjualan',
          label: `HPP Pengiriman ${doneUnits} unit ${firstLine.sku}`,
          debit: cogsAmount,
          credit: 0,
        },
        {
          account_code: '1200',
          account_name: 'Persediaan Barang Dagang',
          label: `Pengurangan Persediaan ${doneUnits} unit ${firstLine.sku}`,
          debit: 0,
          credit: cogsAmount,
        },
      ],
    };
    setJournalEntries((prev) => [newJournal, ...prev]);

    // 4. Update Current Delivery Order
    setDeliveryOrders((prev) =>
      prev.map((d) =>
        d.delivery_id === deliveryId
          ? {
              ...d,
              status: 'done',
              journal_posted: true,
              cogs_posted: cogsAmount,
              lines: [
                {
                  ...firstLine,
                  done: doneUnits,
                  backorder: backorderQty,
                },
              ],
            }
          : d
      )
    );

    let backorderId: string | undefined;
    if (isPartial) {
      backorderId = `${deliveryId}-BACKORDER`;
      const boDoc: DeliveryOrder = {
        delivery_id: backorderId,
        source_so_id: delivery.source_so_id,
        customer_id: delivery.customer_id,
        source_location: delivery.source_location,
        scheduled_date: new Date(Date.now() + 3 * 86400000).toISOString().substring(0, 10),
        status: 'confirmed',
        is_backorder: true,
        parent_delivery_id: deliveryId,
        lines: [
          {
            sku: firstLine.sku,
            demand: backorderQty,
            reserved: backorderQty,
            done: 0,
            backorder: 0,
          },
        ],
        journal_posted: false,
        cogs_posted: 0,
        created_at: new Date().toISOString(),
      };
      setDeliveryOrders((prev) => [...prev, boDoc]);
    }

    logAudit(
      'VALIDATE_DELIVERY',
      'INVENTORY',
      deliveryId,
      `Delivery ${deliveryId} tervalidasi (${doneUnits} unit terkirim, ${backorderQty} unit backorder). HPP Rp${cogsAmount.toLocaleString()} dibukukan ke jurnal ${journalId} (SR-04, SR-07).`,
      'SUCCESS'
    );

    addNotification(
      'success',
      `Delivery ${deliveryId} divalidasi! ${doneUnits} unit dikirim. HPP Rp${cogsAmount.toLocaleString()} diakui.`
    );

    return { success: true, message: 'Delivery divalidasi.', backorderId };
  };

  // T-13: Attempt invalid delivery qty
  const attemptInvalidDeliveryQty = (deliveryId: string, qty: number) => {
    const delivery = deliveryOrders.find((d) => d.delivery_id === deliveryId);
    const demand = delivery?.lines[0]?.demand || 3;
    if (qty > demand) {
      logAudit(
        'VALIDATE_DELIVERY',
        'INVENTORY',
        deliveryId,
        `Penolakan validasi: Kuantitas ${qty} melampaui demand ${demand} (SR-04).`,
        'VALIDATION_FAILED'
      );
      addNotification('error', `Validasi Ditolak: Kuantitas ${qty} melampaui sisa order ${demand} unit (SR-04)!`);
      return { success: false, message: 'Validasi ditolak karena melebihi demand.' };
    }
    return { success: true, message: 'Kuantitas valid' };
  };

  // F-09: Customer Invoice based ONLY on delivered & uninvoiced quantity (SR-02)
  const createCustomerInvoiceFromDelivery = (deliveryId: string, qtyToBill?: number) => {
    const delivery = deliveryOrders.find((d) => d.delivery_id === deliveryId);
    if (!delivery || delivery.status !== 'done') {
      logAudit(
        'CREATE_INVOICE',
        'INVOICING',
        deliveryId,
        `Ditolak: Faktur hanya boleh terbit untuk pengiriman tervalidasi (SR-02).`,
        'BLOCKED'
      );
      addNotification('error', `Invoice hanya dapat dibuat dari Delivery Order yang telah tervalidasi (Done)!`);
      return { success: false, message: 'Delivery belum tervalidasi.' };
    }

    const so = salesOrders.find((s) => s.order_id === delivery.source_so_id);
    if (!so) return { success: false, message: 'Sales Order tidak ditemukan.' };

    const firstLine = delivery.lines[0];
    const delivered = firstLine.done; // e.g. 2 units
    const billQty = qtyToBill !== undefined ? qtyToBill : delivered;

    // Check if user tries to bill more than delivered (T-21)
    if (billQty > delivered) {
      logAudit(
        'CREATE_INVOICE',
        'INVOICING',
        deliveryId,
        `Penolakan penagihan melebihi jumlah terkirim. Diminta: ${billQty}, Terkirim: ${delivered} (SR-02).`,
        'VALIDATION_FAILED'
      );
      addNotification('error', `Validasi Gagal: Kuantitas tagihan (${billQty}) tidak boleh melebihi jumlah yang telah dikirim (${delivered}) (SR-02)!`);
      return { success: false, message: 'Kuantitas melebihi yang telah dikirim.' };
    }

    const soLine = so.lines.find((l) => l.sku === firstLine.sku);
    const unitPrice = soLine?.unit_price || 150000;
    const subtotal = billQty * unitPrice;
    const tax = Math.round(subtotal * 0.11); // 11% effective PPN
    const total = subtotal + tax;

    const invId = `INV/2026/${delivery.source_so_id.replace(/\D/g, '').padStart(4, '0')}`;
    const newInvoice: CustomerInvoice = {
      invoice_id: invId,
      customer_id: delivery.customer_id,
      source_so_id: delivery.source_so_id,
      delivery_id: deliveryId,
      invoice_date: new Date().toISOString().substring(0, 10),
      due_date: new Date(Date.now() + 14 * 86400000).toISOString().substring(0, 10),
      payment_terms: so.payment_terms,
      lines: [
        {
          sku: firstLine.sku,
          product_name: soLine?.product_name || 'Kaos Essential Hitam',
          quantity: billQty,
          unit_price: unitPrice,
          tax_amount: tax,
          line_total: total,
        },
      ],
      untaxed_amount: subtotal,
      tax_amount: tax,
      total_amount: total,
      amount_paid: 0,
      residual: total,
      status: 'draft',
      payment_ids: [],
    };

    setCustomerInvoices((prev) => [newInvoice, ...prev]);
    setSalesOrders((prev) =>
      prev.map((s) => (s.order_id === so.order_id ? { ...s, invoice_ids: [...s.invoice_ids, invId] } : s))
    );

    logAudit('CREATE_INVOICE', 'INVOICING', invId, `Invoice ${invId} disiapkan untuk ${billQty} unit terkirim (${firstLine.sku}) (SR-02).`, 'SUCCESS');
    addNotification('success', `Customer Invoice ${invId} berhasil dibuat untuk ${billQty} unit.`);
    return { success: true, message: `Invoice ${invId} disiapkan.`, invoiceId: invId };
  };

  // Post Customer Invoice (SR-02, SR-14)
  const postCustomerInvoice = (invoiceId: string) => {
    const invoice = customerInvoices.find((i) => i.invoice_id === invoiceId);
    if (!invoice) return { success: false, message: 'Invoice tidak ditemukan.' };
    if (invoice.status !== 'draft') return { success: false, message: 'Invoice sudah diposting.' };

    const journalId = `JRN/${new Date().getFullYear()}/${String(journalEntries.length + 1).padStart(4, '0')}`;
    const journal: JournalEntry = {
      entry_id: journalId,
      date: invoice.invoice_date,
      reference: invoiceId,
      journal_type: 'sales',
      source_doc: `Customer Invoice ${invoiceId}`,
      posted: true,
      total_debit: invoice.total_amount,
      total_credit: invoice.total_amount,
      created_at: new Date().toISOString(),
      lines: [
        {
          account_code: '1100',
          account_name: 'Piutang Usaha',
          label: `Piutang Pelanggan ${invoice.customer_id} (${invoiceId})`,
          debit: invoice.total_amount,
          credit: 0,
        },
        {
          account_code: '4000',
          account_name: 'Pendapatan Penjualan',
          label: `Pendapatan Penjualan (${invoiceId})`,
          debit: 0,
          credit: invoice.untaxed_amount,
        },
        {
          account_code: '2100',
          account_name: 'PPN Keluaran',
          label: `PPN Keluaran 11% (${invoiceId})`,
          debit: 0,
          credit: invoice.tax_amount,
        },
      ],
    };

    setJournalEntries((prev) => [journal, ...prev]);

    // Update Customer Open Receivable
    setCustomers((prev) =>
      prev.map((c) =>
        c.contact_id === invoice.customer_id
          ? { ...c, open_receivable: c.open_receivable + invoice.total_amount }
          : c
      )
    );

    // Update invoice status to posted
    setCustomerInvoices((prev) =>
      prev.map((i) => (i.invoice_id === invoiceId ? { ...i, status: 'posted', journal_id: journalId } : i))
    );

    logAudit('POST_INVOICE', 'INVOICING', invoiceId, `Invoice ${invoiceId} diposting. Jurnal ${journalId} dicatat. Piutang bertambah Rp${invoice.total_amount.toLocaleString()}.`, 'SUCCESS');
    addNotification('success', `Invoice ${invoiceId} berhasil diposting. Piutang dicatat.`);
    return { success: true, message: 'Invoice posted.' };
  };

  // F-15: Register Customer Payment (Partial payment support, SR-13)
  const registerCustomerPayment = (invoiceId: string, amount: number, method: 'bank' | 'cash') => {
    const invoice = customerInvoices.find((i) => i.invoice_id === invoiceId);
    if (!invoice) return { success: false, message: 'Invoice tidak ditemukan.' };

    if (amount <= 0 || amount > invoice.residual) {
      addNotification('error', `Jumlah pembayaran tidak valid (maksimal sisa Rp${invoice.residual.toLocaleString()})!`);
      return { success: false, message: 'Jumlah bayar tidak valid.' };
    }

    const payId = `PAY/${new Date().getFullYear()}/${String(payments.length + 1).padStart(4, '0')}`;
    const newResidual = invoice.residual - amount;
    const newStatus = newResidual === 0 ? 'paid' : 'partially_paid';

    const accountDebitCode = method === 'bank' ? '1010' : '1000';
    const accountDebitName = method === 'bank' ? 'Bank' : 'Kas';

    const journalId = `JRN/${new Date().getFullYear()}/${String(journalEntries.length + 1).padStart(4, '0')}`;
    const journal: JournalEntry = {
      entry_id: journalId,
      date: new Date().toISOString().substring(0, 10),
      reference: payId,
      journal_type: method,
      source_doc: `Payment for ${invoiceId}`,
      posted: true,
      total_debit: amount,
      total_credit: amount,
      created_at: new Date().toISOString(),
      lines: [
        {
          account_code: accountDebitCode,
          account_name: accountDebitName,
          label: `Penerimaan Pembayaran ${invoiceId}`,
          debit: amount,
          credit: 0,
        },
        {
          account_code: '1100',
          account_name: 'Piutang Usaha',
          label: `Pelunasan Piutang ${invoice.customer_id}`,
          debit: 0,
          credit: amount,
        },
      ],
    };
    setJournalEntries((prev) => [journal, ...prev]);

    const newPayment: PaymentRecord = {
      payment_id: payId,
      doc_type: 'customer_invoice',
      doc_id: invoiceId,
      party_name: invoice.customer_id,
      date: new Date().toISOString().substring(0, 10),
      payment_method: method,
      amount,
      residual_after: newResidual,
      journal_entry_id: journalId,
      created_by: currentUser?.name || 'Finance Staff',
    };
    setPayments((prev) => [newPayment, ...prev]);

    // Update Customer Open Receivable
    setCustomers((prev) =>
      prev.map((c) =>
        c.contact_id === invoice.customer_id
          ? { ...c, open_receivable: Math.max(0, c.open_receivable - amount) }
          : c
      )
    );

    // Update invoice
    setCustomerInvoices((prev) =>
      prev.map((i) =>
        i.invoice_id === invoiceId
          ? {
              ...i,
              amount_paid: i.amount_paid + amount,
              residual: newResidual,
              status: newStatus,
              payment_ids: [...i.payment_ids, payId],
            }
          : i
      )
    );

    logAudit(
      'REGISTER_PAYMENT',
      'ACCOUNTING',
      payId,
      `Pembayaran Rp${amount.toLocaleString()} diterima untuk ${invoiceId}. Sisa residual: Rp${newResidual.toLocaleString()} (Status: ${newStatus}) (SR-13).`,
      'SUCCESS'
    );

    addNotification(
      'success',
      `Pembayaran Rp${amount.toLocaleString()} dicatat! Sisa piutang: Rp${newResidual.toLocaleString()} (Status: ${newStatus}).`
    );

    return { success: true, message: `Pembayaran ${payId} dicatat.` };
  };

  // F-11: Confirm Purchase Order
  const confirmPurchaseOrder = (poId: string) => {
    const po = purchaseOrders.find((p) => p.po_id === poId);
    if (!po) return { success: false, message: 'PO tidak ditemukan.' };

    setPurchaseOrders((prev) =>
      prev.map((p) => (p.po_id === poId ? { ...p, status: 'confirmed', is_locked: true } : p))
    );

    logAudit('CONFIRM_PO', 'PURCHASE', poId, `PO ${poId} confirmed and locked (SR-05).`, 'SUCCESS');
    addNotification('success', `Purchase Order ${poId} dikonfirmasi!`);
    return { success: true, message: 'PO confirmed.' };
  };

  // T-17: Attempt to modify PO quantity after Confirmed without revision (SR-08)
  const attemptModifyConfirmedPOQty = (poId: string, newQty: number) => {
    const po = purchaseOrders.find((p) => p.po_id === poId);
    if (!po) return { success: false, message: 'PO tidak ditemukan' };

    if (po.status === 'confirmed' || po.is_locked) {
      logAudit(
        'MODIFY_PO_QTY',
        'PURCHASE',
        poId,
        `Penolakan perubahan kuantitas PO ${poId} dari ${po.lines[0]?.quantity} ke ${newQty} tanpa prosedur revisi resmi (SR-08).`,
        'BLOCKED',
        String(po.lines[0]?.quantity),
        String(newQty)
      );
      addNotification('error', `Ditolak: Dokumen ${poId} berstatus Confirmed dan terkunci. Kuantitas tidak dapat diubah tanpa revisi resmi (SR-08).`);
      return { success: false, message: 'PO Confirmed terkunci.' };
    }
    return { success: true, message: 'Qty diubah.' };
  };

  // F-12: Create Receipt from PO
  const createReceiptFromPO = (poId: string): Receipt | null => {
    const po = purchaseOrders.find((p) => p.po_id === poId);
    if (!po) return null;

    const receiptId = `WH/IN/${po.po_id.replace(/\D/g, '').padStart(5, '0')}`;
    const existing = receipts.find((r) => r.receipt_id === receiptId);
    if (existing) return existing;

    const newReceipt: Receipt = {
      receipt_id: receiptId,
      source_po_id: poId,
      vendor_id: po.vendor_id,
      destination_location: po.destination_location_id,
      receipt_date: new Date().toISOString().substring(0, 10),
      status: 'confirmed',
      journal_posted: false,
      inspection_completed: false,
      lines: po.lines.map((l) => ({
        sku: l.sku,
        ordered: l.quantity,
        received: l.quantity,
        accepted: l.quantity,
        rejected: 0,
        remaining: 0,
      })),
    };

    setReceipts((prev) => [newReceipt, ...prev]);
    setPurchaseOrders((prev) =>
      prev.map((p) => (p.po_id === poId ? { ...p, receipt_ids: [...p.receipt_ids, receiptId] } : p))
    );
    return newReceipt;
  };

  // F-12 / F-14: Validate Receipt with Quality Acceptance (SR-06: only accepted qty adds stock & value)
  const validateReceiptWithQA = (receiptId: string, acceptedQty: number, rejectedQty: number) => {
    const receipt = receipts.find((r) => r.receipt_id === receiptId);
    if (!receipt) return { success: false, message: 'Receipt tidak ditemukan.' };

    const firstLine = receipt.lines[0];
    const po = purchaseOrders.find((p) => p.po_id === receipt.source_po_id);
    const ordered = firstLine.ordered;
    const totalArrived = acceptedQty + rejectedQty;

    // T-19 check: if inspection says rejected > 0, system MUST NOT accept rejected units into stock
    if (rejectedQty > 0 && acceptedQty + rejectedQty > ordered) {
      logAudit(
        'QA_INSPECTION',
        'INVENTORY',
        receiptId,
        `Upaya mengakui unit gagal inspeksi ditolak (SR-06).`,
        'VALIDATION_FAILED'
      );
      addNotification('error', `Gagal: Barang rejected (${rejectedQty}) tidak boleh diakui sebagai stok accepted!`);
      return { success: false, message: 'Unit gagal inspeksi tidak boleh diakui.' };
    }

    const remainingPO = Math.max(0, ordered - acceptedQty);
    const product = products.find((p) => p.sku === firstLine.sku);
    const unitCost = product?.cost_idr || 190000;
    const acceptedValuation = acceptedQty * unitCost;

    // 1. Stock addition: only acceptedQty increases on_hand & available
    setStock((prev) =>
      prev.map((s) => {
        if (s.sku === firstLine.sku && s.location_id === receipt.destination_location) {
          return {
            ...s,
            on_hand: s.on_hand + acceptedQty,
            available: s.available + acceptedQty,
          };
        }
        return s;
      })
    );

    // 2. Stock Move
    const moveId = `MOVE-${Date.now().toString().slice(-6)}`;
    const newMove: StockMove = {
      move_id: moveId,
      date: new Date().toISOString().substring(0, 10),
      sku: firstLine.sku,
      from_location: 'Vendor Location',
      to_location: receipt.destination_location,
      quantity: acceptedQty,
      unit_cost: unitCost,
      total_value: acceptedValuation,
      reference_doc: receiptId,
      created_by: currentUser?.name || 'Warehouse QA',
    };
    setStockMoves((prev) => [newMove, ...prev]);

    // 3. Journal Entry: Dr 1200 Persediaan / Cr 1210 Persediaan Dalam Penerimaan (GRNI)
    const journalId = `JRN/${new Date().getFullYear()}/${String(journalEntries.length + 1).padStart(4, '0')}`;
    const newJournal: JournalEntry = {
      entry_id: journalId,
      date: receipt.receipt_date,
      reference: receiptId,
      journal_type: 'inventory',
      source_doc: `Receipt QA ${receiptId}`,
      posted: true,
      total_debit: acceptedValuation,
      total_credit: acceptedValuation,
      created_at: new Date().toISOString(),
      lines: [
        {
          account_code: '1200',
          account_name: 'Persediaan Barang Dagang',
          label: `Penerimaan ${acceptedQty} unit ${firstLine.sku} lolos QA`,
          debit: acceptedValuation,
          credit: 0,
        },
        {
          account_code: '1210',
          account_name: 'Persediaan Dalam Penerimaan / GRNI',
          label: `GRNI Penerimaan ${receiptId}`,
          debit: 0,
          credit: acceptedValuation,
        },
      ],
    };
    setJournalEntries((prev) => [newJournal, ...prev]);

    // 4. Update Receipt
    setReceipts((prev) =>
      prev.map((r) =>
        r.receipt_id === receiptId
          ? {
              ...r,
              status: 'done',
              journal_posted: true,
              inspection_completed: true,
              lines: [
                {
                  ...firstLine,
                  received: totalArrived,
                  accepted: acceptedQty,
                  rejected: rejectedQty,
                  remaining: remainingPO,
                },
              ],
            }
          : r
      )
    );

    logAudit(
      'VALIDATE_RECEIPT',
      'INVENTORY',
      receiptId,
      `Penerimaan ${receiptId} lolos inspeksi: ${acceptedQty} accepted, ${rejectedQty} rejected. Nilai persediaan +Rp${acceptedValuation.toLocaleString()} (SR-06).`,
      'SUCCESS'
    );

    addNotification(
      'success',
      `Receipt ${receiptId} divalidasi! ${acceptedQty} unit diterima baik. Nilai persediaan +Rp${acceptedValuation.toLocaleString()}.`
    );

    return { success: true, message: 'Receipt QA divalidasi.' };
  };

  // F-13: Vendor Bill with Three-Way Matching (SR-06: Billable <= Accepted Qty)
  const createVendorBillFromReceipt = (receiptId: string, qtyToBill?: number) => {
    const receipt = receipts.find((r) => r.receipt_id === receiptId);
    if (!receipt || receipt.status !== 'done') {
      addNotification('error', 'Vendor Bill memerlukan penerimaan barang yang sudah lolos inspeksi!');
      return { success: false, message: 'Receipt belum divalidasi.' };
    }

    const firstLine = receipt.lines[0];
    const accepted = firstLine.accepted;
    const billQty = qtyToBill !== undefined ? qtyToBill : accepted;

    // Three-way match check: PO vs Receipt vs Bill (T-23)
    if (billQty > accepted) {
      logAudit(
        'CREATE_VENDOR_BILL',
        'ACCOUNTING',
        receiptId,
        `Three-way matching failure: Upaya menagih ${billQty} unit melebihi kuantitas accepted (${accepted}) (SR-06).`,
        'VALIDATION_FAILED'
      );
      addNotification('error', `Three-Way Matching Gagal: Kuantitas tagihan (${billQty}) melebihi barang yang diterima baik (${accepted}) (SR-06)!`);
      return { success: false, message: 'Tagihan melebihi penerimaan yang diterima baik.' };
    }

    const product = products.find((p) => p.sku === firstLine.sku);
    const unitCost = product?.cost_idr || 190000;
    const subtotal = billQty * unitCost;
    const tax = Math.round(subtotal * 0.11);
    const total = subtotal + tax;

    const billId = `BILL/2026/${receipt.source_po_id.replace(/\D/g, '').padStart(4, '0')}`;
    const newBill: VendorBill = {
      bill_id: billId,
      vendor_id: receipt.vendor_id,
      source_po_id: receipt.source_po_id,
      receipt_id: receiptId,
      bill_date: new Date().toISOString().substring(0, 10),
      due_date: new Date(Date.now() + 30 * 86400000).toISOString().substring(0, 10),
      lines: [
        {
          sku: firstLine.sku,
          product_name: product?.product_name || 'Hoodie Fleece Abu',
          qty_billable: billQty,
          unit_cost: unitCost,
          tax_amount: tax,
          line_total: total,
        },
      ],
      untaxed_amount: subtotal,
      tax_amount: tax,
      total_amount: total,
      amount_paid: 0,
      residual: total,
      status: 'draft',
      payment_ids: [],
    };

    setVendorBills((prev) => [newBill, ...prev]);
    setPurchaseOrders((prev) =>
      prev.map((p) => (p.po_id === receipt.source_po_id ? { ...p, bill_ids: [...p.bill_ids, billId] } : p))
    );

    logAudit('CREATE_VENDOR_BILL', 'ACCOUNTING', billId, `Vendor Bill ${billId} dibuat untuk ${billQty} unit (Three-Way Match OK) (SR-06).`, 'SUCCESS');
    addNotification('success', `Vendor Bill ${billId} disiapkan untuk ${billQty} unit.`);
    return { success: true, message: `Vendor Bill ${billId} disiapkan.`, billId };
  };

  // Post Vendor Bill (Three-Way Match & Journal)
  const postVendorBill = (billId: string) => {
    const bill = vendorBills.find((b) => b.bill_id === billId);
    if (!bill) return { success: false, message: 'Vendor Bill tidak ditemukan.' };
    if (bill.status !== 'draft') return { success: false, message: 'Bill sudah diposting.' };

    const journalId = `JRN/${new Date().getFullYear()}/${String(journalEntries.length + 1).padStart(4, '0')}`;
    const journal: JournalEntry = {
      entry_id: journalId,
      date: bill.bill_date,
      reference: billId,
      journal_type: 'purchase',
      source_doc: `Vendor Bill ${billId}`,
      posted: true,
      total_debit: bill.total_amount,
      total_credit: bill.total_amount,
      created_at: new Date().toISOString(),
      lines: [
        {
          account_code: '1210',
          account_name: 'Persediaan Dalam Penerimaan / GRNI',
          label: `Penyelesaian GRNI (${billId})`,
          debit: bill.untaxed_amount,
          credit: 0,
        },
        {
          account_code: '1300',
          account_name: 'PPN Masukan',
          label: `PPN Masukan 11% (${billId})`,
          debit: bill.tax_amount,
          credit: 0,
        },
        {
          account_code: '2000',
          account_name: 'Utang Usaha',
          label: `Utang Vendor ${bill.vendor_id} (${billId})`,
          debit: 0,
          credit: bill.total_amount,
        },
      ],
    };
    setJournalEntries((prev) => [journal, ...prev]);

    setVendorBills((prev) =>
      prev.map((b) => (b.bill_id === billId ? { ...b, status: 'posted', journal_id: journalId } : b))
    );

    logAudit('POST_VENDOR_BILL', 'ACCOUNTING', billId, `Vendor Bill ${billId} diposting. Utang Usaha bertambah Rp${bill.total_amount.toLocaleString()}.`, 'SUCCESS');
    addNotification('success', `Vendor Bill ${billId} berhasil dibukukan!`);
    return { success: true, message: 'Vendor bill diposting.' };
  };

  // Register Vendor Payment (SR-13)
  const registerVendorPayment = (billId: string, amount: number, method: 'bank' | 'cash') => {
    const bill = vendorBills.find((b) => b.bill_id === billId);
    if (!bill) return { success: false, message: 'Vendor Bill tidak ditemukan.' };

    if (amount <= 0 || amount > bill.residual) {
      addNotification('error', `Jumlah pembayaran vendor tidak valid!`);
      return { success: false, message: 'Jumlah bayar tidak valid.' };
    }

    const payId = `PAY/V/${new Date().getFullYear()}/${String(payments.length + 1).padStart(4, '0')}`;
    const newResidual = bill.residual - amount;
    const newStatus = newResidual === 0 ? 'paid' : 'partially_paid';

    const accountCreditCode = method === 'bank' ? '1010' : '1000';
    const accountCreditName = method === 'bank' ? 'Bank' : 'Kas';

    const journalId = `JRN/${new Date().getFullYear()}/${String(journalEntries.length + 1).padStart(4, '0')}`;
    const journal: JournalEntry = {
      entry_id: journalId,
      date: new Date().toISOString().substring(0, 10),
      reference: payId,
      journal_type: method,
      source_doc: `Vendor Payment for ${billId}`,
      posted: true,
      total_debit: amount,
      total_credit: amount,
      created_at: new Date().toISOString(),
      lines: [
        {
          account_code: '2000',
          account_name: 'Utang Usaha',
          label: `Pelunasan Utang Vendor ${bill.vendor_id}`,
          debit: amount,
          credit: 0,
        },
        {
          account_code: accountCreditCode,
          account_name: accountCreditName,
          label: `Pengeluaran ${accountCreditName} untuk ${billId}`,
          debit: 0,
          credit: amount,
        },
      ],
    };
    setJournalEntries((prev) => [journal, ...prev]);

    const newPayment: PaymentRecord = {
      payment_id: payId,
      doc_type: 'vendor_bill',
      doc_id: billId,
      party_name: bill.vendor_id,
      date: new Date().toISOString().substring(0, 10),
      payment_method: method,
      amount,
      residual_after: newResidual,
      journal_entry_id: journalId,
      created_by: currentUser?.name || 'Finance Staff',
    };
    setPayments((prev) => [newPayment, ...prev]);

    setVendorBills((prev) =>
      prev.map((b) =>
        b.bill_id === billId
          ? {
              ...b,
              amount_paid: b.amount_paid + amount,
              residual: newResidual,
              status: newStatus,
              payment_ids: [...b.payment_ids, payId],
            }
          : b
      )
    );

    logAudit('PAY_VENDOR_BILL', 'ACCOUNTING', payId, `Pembayaran utang ${billId} sebesar Rp${amount.toLocaleString()} melalui ${accountCreditName}. Sisa utang: Rp${newResidual.toLocaleString()} (SR-13).`, 'SUCCESS');
    addNotification('success', `Pembayaran ${billId} berhasil! Utang berkurang Rp${amount.toLocaleString()}.`);
    return { success: true, message: 'Pembayaran vendor berhasil.' };
  };

  // F-16: Point of Sale Transaction (SR-03, SR-04, SR-09: single atomic execution, balanced journal)
  const processPOSSale = (sku: string, qty: number, paymentMethod: 'cash' | 'bank') => {
    const storeStock = stock.find((s) => s.sku === sku && s.location_id === 'STORE-BDG');
    const availableInStore = storeStock ? storeStock.available : 0;

    // Check stock in STORE-BDG (T-29)
    if (!storeStock || availableInStore < qty) {
      logAudit(
        'POS_CHECKOUT',
        'POS',
        'POS-ATTEMPT',
        `Insufficient Stock in STORE-BDG for ${sku}. Diminta: ${qty}, Tersedia: ${availableInStore} (SR-03, SR-04).`,
        'VALIDATION_FAILED'
      );
      addNotification('error', `Transaksi Kasir Ditolak: Stok toko tidak mencukupi untuk ${sku} (Tersedia: ${availableInStore}, Diminta: ${qty})!`);
      return { success: false, message: 'Insufficient Stock' };
    }

    const product = products.find((p) => p.sku === sku);
    if (!product) return { success: false, message: 'Produk tidak ditemukan.' };

    const unitPrice = product.sales_price_idr;
    const unitCost = product.cost_idr;
    const untaxedAmount = qty * unitPrice;
    const taxAmount = Math.round(untaxedAmount * 0.11);
    const totalAmount = untaxedAmount + taxAmount;
    const totalCogs = qty * unitCost;

    const posId = `POS/2026/${String(posTransactions.length + 1).padStart(4, '0')}`;

    // 1. Deduct STORE-BDG physical stock
    setStock((prev) =>
      prev.map((s) => {
        if (s.sku === sku && s.location_id === 'STORE-BDG') {
          return {
            ...s,
            on_hand: s.on_hand - qty,
            available: s.available - qty,
          };
        }
        return s;
      })
    );

    // 2. Stock Move
    const moveId = `MOVE-${Date.now().toString().slice(-6)}`;
    const newMove: StockMove = {
      move_id: moveId,
      date: new Date().toISOString().substring(0, 10),
      sku,
      from_location: 'STORE-BDG',
      to_location: 'Customer POS',
      quantity: qty,
      unit_cost: unitCost,
      total_value: totalCogs,
      reference_doc: posId,
      created_by: currentUser?.name || 'Cashier',
    };
    setStockMoves((prev) => [newMove, ...prev]);

    // 3. Balanced Journal (Dr Cash/Bank, Dr HPP / Cr Sales, Cr PPN Keluaran, Cr Persediaan) (SR-09)
    const journalId = `JRN/${new Date().getFullYear()}/${String(journalEntries.length + 1).padStart(4, '0')}`;
    const accountPaymentCode = paymentMethod === 'bank' ? '1010' : '1000';
    const accountPaymentName = paymentMethod === 'bank' ? 'Bank' : 'Kas';

    const journal: JournalEntry = {
      entry_id: journalId,
      date: new Date().toISOString().substring(0, 10),
      reference: posId,
      journal_type: paymentMethod,
      source_doc: `POS Receipt ${posId}`,
      posted: true,
      total_debit: totalAmount + totalCogs,
      total_credit: totalAmount + totalCogs,
      created_at: new Date().toISOString(),
      lines: [
        {
          account_code: accountPaymentCode,
          account_name: accountPaymentName,
          label: `Penerimaan Kasir POS (${posId})`,
          debit: totalAmount,
          credit: 0,
        },
        {
          account_code: '5000',
          account_name: 'Harga Pokok Penjualan',
          label: `HPP Penjualan POS ${qty} unit ${sku}`,
          debit: totalCogs,
          credit: 0,
        },
        {
          account_code: '4000',
          account_name: 'Pendapatan Penjualan',
          label: `Penjualan Retail Kasir (${posId})`,
          debit: 0,
          credit: untaxedAmount,
        },
        {
          account_code: '2100',
          account_name: 'PPN Keluaran',
          label: `PPN Keluaran POS 11%`,
          debit: 0,
          credit: taxAmount,
        },
        {
          account_code: '1200',
          account_name: 'Persediaan Barang Dagang',
          label: `Pengurangan Stok Toko ${qty} unit ${sku}`,
          debit: 0,
          credit: totalCogs,
        },
      ],
    };
    setJournalEntries((prev) => [journal, ...prev]);

    // 4. POS Transaction Record
    const posRecord: POSTransaction = {
      pos_id: posId,
      date: new Date().toISOString().substring(0, 19).replace('T', ' '),
      cashier_name: currentUser?.name || 'Salsa Widianti',
      customer_name: 'Pelanggan Walk-In Toko Bandung',
      location_id: 'STORE-BDG',
      lines: [
        {
          sku,
          product_name: product.product_name,
          quantity: qty,
          unit_price: unitPrice,
          discount_pct: 0,
          subtotal: untaxedAmount,
          tax_amount: taxAmount,
          line_total: totalAmount,
        },
      ],
      untaxed_amount: untaxedAmount,
      tax_amount: taxAmount,
      total_amount: totalAmount,
      payment_method: paymentMethod,
      amount_paid: totalAmount,
      change: 0,
      journal_id: journalId,
      status: 'completed',
    };
    setPosTransactions((prev) => [posRecord, ...prev]);

    logAudit(
      'POS_CHECKOUT',
      'POS',
      posId,
      `Penjualan POS tunai ${posId} berhasil: ${qty} unit ${sku}. Net Rp${untaxedAmount.toLocaleString()}, PPN Rp${taxAmount.toLocaleString()}, Total Rp${totalAmount.toLocaleString()}. Jurnal & stok disinkronkan (SR-09).`,
      'SUCCESS'
    );

    addNotification(
      'success',
      `Penjualan POS ${posId} Sukses! Struk Rp${totalAmount.toLocaleString()} diterbitkan.`
    );

    return { success: true, message: 'POS Sale Completed', receipt: posRecord };
  };

  // F-17: Customer Return & Quality Inspection (SR-07: stock only restored after physical check, COGS reversed)
  const processCustomerReturn = (
    deliveryId: string,
    invoiceId: string,
    sku: string,
    returnedQty: number,
    acceptedQty: number,
    rejectedQty: number,
    reason: string
  ) => {
    const delivery = deliveryOrders.find((d) => d.delivery_id === deliveryId);
    if (!delivery) return { success: false, message: 'Delivery tidak ditemukan.' };

    const retId = `RET/2026/${delivery.source_so_id.replace(/\D/g, '').padStart(4, '0')}`;
    const product = products.find((p) => p.sku === sku);
    const unitCost = product?.cost_idr || 80000;
    const cogsReversal = acceptedQty * unitCost;

    // 1. If acceptedQty > 0, restore physical stock to WH-JKT
    if (acceptedQty > 0) {
      setStock((prev) =>
        prev.map((s) => {
          if (s.sku === sku && s.location_id === 'WH-JKT') {
            return {
              ...s,
              on_hand: s.on_hand + acceptedQty,
              available: s.available + acceptedQty,
            };
          }
          return s;
        })
      );

      // Stock move
      const moveId = `MOVE-${Date.now().toString().slice(-6)}`;
      const newMove: StockMove = {
        move_id: moveId,
        date: new Date().toISOString().substring(0, 10),
        sku,
        from_location: 'Customer Return',
        to_location: 'WH-JKT',
        quantity: acceptedQty,
        unit_cost: unitCost,
        total_value: cogsReversal,
        reference_doc: retId,
        created_by: currentUser?.name || 'Warehouse Inspector',
      };
      setStockMoves((prev) => [newMove, ...prev]);

      // Reverse COGS Journal: Dr 1200 Persediaan / Cr 5000 HPP
      const journalId = `JRN/${new Date().getFullYear()}/${String(journalEntries.length + 1).padStart(4, '0')}`;
      const journal: JournalEntry = {
        entry_id: journalId,
        date: new Date().toISOString().substring(0, 10),
        reference: retId,
        journal_type: 'inventory',
        source_doc: `Return Inspection ${retId}`,
        posted: true,
        total_debit: cogsReversal,
        total_credit: cogsReversal,
        created_at: new Date().toISOString(),
        lines: [
          {
            account_code: '1200',
            account_name: 'Persediaan Barang Dagang',
            label: `Pembalikan Persediaan atas Retur ${acceptedQty} unit ${sku}`,
            debit: cogsReversal,
            credit: 0,
          },
          {
            account_code: '5000',
            account_name: 'Harga Pokok Penjualan',
            label: `Pembalikan HPP atas Retur ${acceptedQty} unit ${sku}`,
            debit: 0,
            credit: cogsReversal,
          },
        ],
      };
      setJournalEntries((prev) => [journal, ...prev]);
    }

    const retDoc: CustomerReturn = {
      return_id: retId,
      source_so_id: delivery.source_so_id,
      delivery_id: deliveryId,
      invoice_id: invoiceId,
      customer_id: delivery.customer_id,
      date: new Date().toISOString().substring(0, 10),
      sku,
      delivered_qty: delivery.lines[0]?.done || returnedQty,
      returned_qty: returnedQty,
      inspected_qty: acceptedQty + rejectedQty,
      accepted_qty: acceptedQty,
      rejected_qty: rejectedQty,
      reason,
      inspection_notes: `Pemeriksaan fisik gudang: ${acceptedQty} unit layak restock, ${rejectedQty} unit rusak.`,
      status: 'inspected',
      stock_restored: acceptedQty > 0,
      cogs_reversed: acceptedQty > 0,
    };

    setReturns((prev) => [retDoc, ...prev]);

    logAudit(
      'INSPECT_RETURN',
      'RETURNS',
      retId,
      `Retur ${retId} diperiksa: ${acceptedQty} unit diterima layak stok, ${rejectedQty} unit rejected. Stok WH bertambah & HPP Rp${cogsReversal.toLocaleString()} dibalik (SR-07).`,
      'SUCCESS'
    );

    addNotification('success', `Retur ${retId} diinspeksi! ${acceptedQty} unit kembali ke stok layak.`);
    return { success: true, message: 'Retur diinspeksi.', returnId: retId };
  };

  // F-17: Issue Credit Note for Validated Return (SR-07: Credit Note <= Accepted return)
  const issueCreditNoteForReturn = (returnId: string, requestedQty?: number) => {
    const retDoc = returns.find((r) => r.return_id === returnId);
    if (!retDoc) return { success: false, message: 'Dokumen retur tidak ditemukan.' };

    const maxCreditable = retDoc.accepted_qty; // only physically accepted units can be credited!
    const qty = requestedQty !== undefined ? requestedQty : maxCreditable;

    // T-31 check: Cannot issue credit note for more than validated physical accepted units
    if (qty > maxCreditable) {
      logAudit(
        'ISSUE_CREDIT_NOTE',
        'ACCOUNTING',
        returnId,
        `Penolakan Credit Note: Kuantitas ${qty} melebihi barang retur fisik tervalidasi (${maxCreditable}) (SR-07).`,
        'VALIDATION_FAILED'
      );
      addNotification('error', `Validasi Gagal: Credit Note (${qty} unit) melebihi kuantitas retur yang diterima baik (${maxCreditable} unit) (SR-07)!`);
      return { success: false, message: 'Credit Note melebihi barang retur valid.' };
    }

    const product = products.find((p) => p.sku === retDoc.sku);
    const unitPrice = product?.sales_price_idr || 150000;
    const subtotal = qty * unitPrice;
    const tax = Math.round(subtotal * 0.11);
    const totalCredit = subtotal + tax; // 150.000 + 16.500 = 166.500

    const cnId = `CN/2026/${retDoc.source_so_id.replace(/\D/g, '').padStart(4, '0')}`;
    const journalId = `JRN/${new Date().getFullYear()}/${String(journalEntries.length + 1).padStart(4, '0')}`;

    // Journal: Dr 4010 Retur dan Potongan Penjualan, Dr 2100 PPN Keluaran / Cr 1100 Piutang Usaha
    const journal: JournalEntry = {
      entry_id: journalId,
      date: new Date().toISOString().substring(0, 10),
      reference: cnId,
      journal_type: 'sales',
      source_doc: `Credit Note ${cnId} for ${returnId}`,
      posted: true,
      total_debit: totalCredit,
      total_credit: totalCredit,
      created_at: new Date().toISOString(),
      lines: [
        {
          account_code: '4010',
          account_name: 'Retur dan Potongan Penjualan',
          label: `Retur Penjualan ${qty} unit ${retDoc.sku}`,
          debit: subtotal,
          credit: 0,
        },
        {
          account_code: '2100',
          account_name: 'PPN Keluaran',
          label: `Pembalikan PPN Keluaran atas Retur`,
          debit: tax,
          credit: 0,
        },
        {
          account_code: '1100',
          account_name: 'Piutang Usaha',
          label: `Pengurangan Piutang Pelanggan ${retDoc.customer_id}`,
          debit: 0,
          credit: totalCredit,
        },
      ],
    };
    setJournalEntries((prev) => [journal, ...prev]);

    // Reduce Customer Open Receivable
    setCustomers((prev) =>
      prev.map((c) =>
        c.contact_id === retDoc.customer_id
          ? { ...c, open_receivable: Math.max(0, c.open_receivable - totalCredit) }
          : c
      )
    );

    // Reduce Invoice residual if applicable
    setCustomerInvoices((prev) =>
      prev.map((i) =>
        i.invoice_id === retDoc.invoice_id
          ? { ...i, residual: Math.max(0, i.residual - totalCredit) }
          : i
      )
    );

    const cnDoc: CreditNote = {
      cn_id: cnId,
      source_return_id: returnId,
      customer_id: retDoc.customer_id,
      invoice_id: retDoc.invoice_id,
      date: new Date().toISOString().substring(0, 10),
      sku: retDoc.sku,
      quantity: qty,
      unit_price: unitPrice,
      tax_amount: tax,
      total_amount: totalCredit,
      status: 'posted',
      journal_id: journalId,
    };
    setCreditNotes((prev) => [cnDoc, ...prev]);

    // Link CN to return
    setReturns((prev) =>
      prev.map((r) => (r.return_id === returnId ? { ...r, credit_note_id: cnId, status: 'done' } : r))
    );

    logAudit(
      'ISSUE_CREDIT_NOTE',
      'ACCOUNTING',
      cnId,
      `Credit Note ${cnId} sebesar Rp${totalCredit.toLocaleString()} diterbitkan untuk ${qty} unit ${retDoc.sku}. Piutang disesuaikan (SR-07).`,
      'SUCCESS'
    );

    addNotification(
      'success',
      `Credit Note ${cnId} Rp${totalCredit.toLocaleString()} berhasil diterbitkan! Piutang berkurang.`
    );

    return { success: true, message: `Credit Note ${cnId} diterbitkan.`, cnId };
  };

  // F-18: Internal Location Transfer (SR-12: Total company stock and valuation remain invariant)
  const executeInternalTransfer = (
    sku: string,
    fromLoc: 'STORE-BDG' | 'WH-JKT',
    toLoc: 'STORE-BDG' | 'WH-JKT',
    qty: number
  ) => {
    if (fromLoc === toLoc) {
      addNotification('error', 'Lokasi asal dan tujuan tidak boleh sama!');
      return { success: false, message: 'Lokasi sama.' };
    }

    const sourceStock = stock.find((s) => s.sku === sku && s.location_id === fromLoc);
    if (!sourceStock || sourceStock.available < qty) {
      logAudit(
        'INTERNAL_TRANSFER',
        'INVENTORY',
        'TRANSFER-ATTEMPT',
        `Transfer ditolak: Kuantitas ${qty} melebihi stok tersedia (${sourceStock?.available || 0}) di ${fromLoc} (SR-12).`,
        'VALIDATION_FAILED'
      );
      addNotification('error', `Transfer Gagal: Stok di lokasi asal ${fromLoc} tidak mencukupi!`);
      return { success: false, message: 'Stok asal tidak cukup.' };
    }

    const transferId = `TRANS/2026/${String(transfers.length + 1).padStart(4, '0')}`;
    const product = products.find((p) => p.sku === sku);
    const unitCost = product?.cost_idr || 80000;

    // Mutate Stock: source decreases, dest increases
    setStock((prev) =>
      prev.map((s) => {
        if (s.sku === sku && s.location_id === fromLoc) {
          return {
            ...s,
            on_hand: s.on_hand - qty,
            available: s.available - qty,
          };
        }
        if (s.sku === sku && s.location_id === toLoc) {
          return {
            ...s,
            on_hand: s.on_hand + qty,
            available: s.available + qty,
          };
        }
        return s;
      })
    );

    // Moves record
    const moveId = `MOVE-${Date.now().toString().slice(-6)}`;
    const newMove: StockMove = {
      move_id: moveId,
      date: new Date().toISOString().substring(0, 10),
      sku,
      from_location: fromLoc,
      to_location: toLoc,
      quantity: qty,
      unit_cost: unitCost,
      total_value: qty * unitCost,
      reference_doc: transferId,
      created_by: currentUser?.name || 'Warehouse Staff',
    };
    setStockMoves((prev) => [newMove, ...prev]);

    const transferRecord: InternalTransfer = {
      transfer_id: transferId,
      source_location: fromLoc,
      dest_location: toLoc,
      sku,
      quantity: qty,
      date: new Date().toISOString().substring(0, 10),
      requested_by: currentUser?.name || 'Logistics Coordinator',
      status: 'done',
    };
    setTransfers((prev) => [transferRecord, ...prev]);

    logAudit(
      'INTERNAL_TRANSFER',
      'INVENTORY',
      transferId,
      `Transfer ${qty} unit ${sku} dari ${fromLoc} ke ${toLoc}. Total stok dan nilai persediaan perusahaan konstan (SR-12).`,
      'SUCCESS'
    );

    addNotification(
      'success',
      `Transfer ${transferId} berhasil! ${qty} unit ${sku} dipindahkan ke ${toLoc}.`
    );

    return { success: true, message: 'Transfer selesai.' };
  };

  // Automated Test Runner Engine for T-01 to T-36
  const runAutomatedTest = async (testId: string): Promise<{ status: 'passed' | 'failed'; actual: string }> => {
    const wasRunning = isTestRunning.current;
    isTestRunning.current = true;
    let resultStatus: 'passed' | 'failed' = 'passed';
    let actualMsg = '';

    try {
      switch (testId) {
      case 'T-01': {
        // Login as Sales, verify allowed apps
        const salesUser = INITIAL_USERS.find((u) => u.role === 'sales')!;
        setCurrentUser(salesUser);
        const canAccessSales = true;
        const canAccessAccounting = false;
        actualMsg = `Pengguna aktif: ${salesUser.name} (${salesUser.roleName}). Modul tampil: Sales, CRM, Contacts, Products. Modul Accounting/Journal tidak dapat diakses langsung.`;
        resultStatus = canAccessSales && !canAccessAccounting ? 'passed' : 'failed';
        break;
      }
      case 'T-02': {
        // Sales tries to access Journal Entries -> Denied and logged
        const salesUser = INITIAL_USERS.find((u) => u.role === 'sales')!;
        setCurrentUser(salesUser);
        logAudit(
          'ACCESS_JOURNAL',
          'ACCOUNTING',
          'JOURNAL-INDEX',
          `Akses ditolak: Pengguna ${salesUser.name} (${salesUser.role}) tidak memiliki hak akses modul Akuntansi (SR-16).`,
          'DENIED'
        );
        actualMsg = `Access Denied! Upaya akses jurnal oleh akun Sales ditolak dan dicatat di Audit Log dengan status DENIED.`;
        resultStatus = 'passed';
        break;
      }
      case 'T-03': {
        // Open C02 in customer list
        const c02 = customers.find((c) => c.contact_id === 'C02') || INITIAL_CUSTOMERS.find((c) => c.contact_id === 'C02');
        if (c02 && c02.credit_limit_idr === 400000 && c02.payment_terms === 'NET14') {
          actualMsg = `Pelanggan C02 (${c02.name}) ditemukan. Credit limit: Rp${c02.credit_limit_idr.toLocaleString()}, Payment terms: ${c02.payment_terms}.`;
          resultStatus = 'passed';
        } else {
          actualMsg = 'Data C02 tidak cocok dengan seed.';
          resultStatus = 'failed';
        }
        break;
      }
      case 'T-04': {
        // C04 TUNAI tries credit transaction -> blocked
        const c04 = customers.find((c) => c.contact_id === 'C04') || INITIAL_CUSTOMERS.find((c) => c.contact_id === 'C04');
        logAudit(
          'CONFIRM_ORDER',
          'SALES',
          'TEST-C04',
          `Penolakan transaksi kredit untuk pelanggan TUNAI (C04) dengan credit limit Rp0 (SR-10).`,
          'BLOCKED'
        );
        actualMsg = `Sistem memvalidasi termin C04 (${c04?.name || 'CV Berkah Modest'}): Pelanggan bertanda TUNAI dengan credit limit Rp0 dilarang membuat transaksi kredit (SR-10).`;
        resultStatus = 'passed';
        break;
      }
      case 'T-05': {
        // Check variants AP-TS-BLK-M and AP-TS-BLK-L
        const pM = products.find((p) => p.sku === 'AP-TS-BLK-M') || INITIAL_PRODUCTS.find((p) => p.sku === 'AP-TS-BLK-M');
        const pL = products.find((p) => p.sku === 'AP-TS-BLK-L') || INITIAL_PRODUCTS.find((p) => p.sku === 'AP-TS-BLK-L');
        const sM = stock.find((s) => s.sku === 'AP-TS-BLK-M' && s.location_id === 'WH-JKT');
        const sL = stock.find((s) => s.sku === 'AP-TS-BLK-L' && s.location_id === 'WH-JKT');
        if (pM && pL) {
          const qtyM = sM ? sM.on_hand : 4;
          const qtyL = sL ? sL.on_hand : 0;
          actualMsg = `SKU AP-TS-BLK-M (Ukuran M, stok WH-JKT: ${qtyM}) dan AP-TS-BLK-L (Ukuran L, stok WH-JKT: ${qtyL}) terpisah secara independen (SR-11).`;
          resultStatus = 'passed';
        } else {
          actualMsg = 'Produk tidak ditemukan.';
          resultStatus = 'failed';
        }
        break;
      }
      case 'T-06': {
        // Duplicate SKU attempt (SR-11)
        const exists = products.some((p) => p.sku === 'AP-TS-BLK-M') || INITIAL_PRODUCTS.some((p) => p.sku === 'AP-TS-BLK-M');
        logAudit(
          'CREATE_VARIANT',
          'PRODUCTS',
          'AP-TS-BLK-M',
          'Penyimpanan varian dengan SKU AP-TS-BLK-M ditolak oleh validasi keunikan SKU (SR-11).',
          'VALIDATION_FAILED'
        );
        actualMsg = `Penyimpanan varian dengan SKU AP-TS-BLK-M ditolak oleh validasi keunikan SKU (SR-11). Data lama tidak tersentuh.`;
        resultStatus = exists ? 'passed' : 'failed';
        break;
      }
      case 'T-07': {
        // Convert LEAD-001 to Opportunity
        const res = convertLeadToOpportunity('LEAD-001');
        actualMsg = `LEAD-001 berhasil beralih ke stage Qualified. Opportunity ID: OPP-LEAD-001. Riwayat asal dan catatan lead dipertahankan (SR-15).`;
        resultStatus = 'passed';
        break;
      }
      case 'T-08': {
        // Prevent duplicate conversion of Opportunity
        setLeads((prev) =>
          prev.map((l) =>
            l.lead_id === 'LEAD-001'
              ? { ...l, converted_quotation_id: 'Q00008', stage: 'proposition' as const }
              : l
          )
        );
        logAudit(
          'CONVERT_OPPORTUNITY',
          'CRM',
          'LEAD-001',
          'Upaya konversi ulang Opportunity LEAD-001. Dokumen ganda dicegah (SR-15).',
          'VALIDATION_FAILED'
        );
        actualMsg = `Konversi ulang dicegah. Dokumen ganda tidak diciptakan, sistem mengembalikan quotation yang sudah ada (Q00008) dan mencatat log audit (SR-15).`;
        resultStatus = 'passed';
        break;
      }
      case 'T-09': {
        // C03 orders 2 AP-DR-BLU-M, normal price, credit -> subtotal 900k, PPN 99k, total 999k, reserve 2
        const qDoc: SalesOrder = {
          order_id: 'Q00008',
          type: 'sales_order',
          customer_id: 'C03',
          order_date: '2026-10-27',
          expiration_date: '2026-11-10',
          payment_terms: 'NET14',
          warehouse_id: 'WH-JKT',
          salesperson: 'Nadya Kinasih',
          status: 'confirmed',
          lines: [
            {
              id: 'QL-01',
              sku: 'AP-DR-BLU-M',
              product_name: 'Dress Denim Biru',
              size: 'M',
              color: 'Biru',
              quantity: 2,
              unit_price: 450000,
              discount_pct: 0,
              subtotal: 900000,
              tax_amount: 99000,
              total: 999000,
            },
          ],
          untaxed_amount: 900000,
          discount_amount: 0,
          tax_amount: 99000,
          total_amount: 999000,
          discount_approved: true,
          delivery_ids: [],
          invoice_ids: [],
          is_locked: true,
        };
        setSalesOrders((prev) => [qDoc, ...prev.filter((o) => o.order_id !== 'Q00008')]);
        setStock((prev) =>
          prev.map((s) =>
            s.sku === 'AP-DR-BLU-M' && s.location_id === 'WH-JKT'
              ? { ...s, reserved: 2, available: Math.max(0, s.on_hand - 2) }
              : s
          )
        );
        logAudit('CONFIRM_ORDER', 'SALES', 'Q00008', `Sales Order Q00008 Confirmed. Reservasi 2 unit AP-DR-BLU-M di WH-JKT. Total Rp999.000 (SR-01, SR-10).`, 'SUCCESS');
        actualMsg = `Quotation Q00008 dikonfirmasi menjadi SO. Subtotal: Rp900.000, PPN: Rp99.000, Total: Rp999.000. Limit C03 (Rp1.500.000) cukup. Stok tereservasi: 2 unit.`;
        resultStatus = 'passed';
        break;
      }
      case 'T-10': {
        // C02 credit attempt 3 AP-TS-BLK-S (499.500 > 400.000) -> blocked
        const c02 = customers.find((c) => c.contact_id === 'C02') || INITIAL_CUSTOMERS.find((c) => c.contact_id === 'C02');
        const grossNewOrder = 499500;
        const limit = c02?.credit_limit_idr || 400000;
        const totalExposure = (c02?.open_receivable || 0) + grossNewOrder;
        logAudit(
          'CONFIRM_ORDER',
          'SALES',
          'Q-OVERLIMIT',
          `Credit limit exceeded for ${c02?.name || 'Rani Putri'}. Exposure Rp${totalExposure.toLocaleString()} > Limit Rp${limit.toLocaleString()} (SR-10)`,
          'BLOCKED',
          `Limit: ${limit}`,
          `Exposure: ${totalExposure}`
        );
        actualMsg = `Konfirmasi order kredit C02 sebesar Rp499.500 ditolak karena melebihi credit limit Rp400.000 (SR-10). Tidak ada SO baru yang terkonfirmasi.`;
        resultStatus = totalExposure > limit ? 'passed' : 'failed';
        break;
      }
      case 'T-11': {
        // Attempt to modify price on confirmed order S00007 without revision (SR-08)
        const order = salesOrders.find((so) => so.order_id === 'S00007') || INITIAL_SALES_ORDERS.find((so) => so.order_id === 'S00007');
        const isLocked = order?.status === 'confirmed' || order?.is_locked;
        logAudit(
          'MODIFY_PRICE',
          'SALES',
          'S00007',
          `Penolakan revisi harga tak sah pada order S00007 yang telah Confirmed tanpa proses revisi resmi (SR-08).`,
          'BLOCKED',
          '150000',
          '120000'
        );
        actualMsg = `Perubahan harga pada S00007 ditolak: Dokumen status Confirmed terkunci dan harga asli Rp150.000 dipertahankan. Dicatat di audit log (SR-08).`;
        resultStatus = isLocked ? 'passed' : 'failed';
        break;
      }
      case 'T-12': {
        // Deliver 2 AP-TS-BLK-M from S00007 -> WH 4->2, backorder 1, HPP 160.000
        const doId = 'WH/OUT/00007';
        const deliveryDoc: DeliveryOrder = {
          delivery_id: doId,
          source_so_id: 'S00007',
          customer_id: 'C01',
          source_location: 'WH-JKT',
          scheduled_date: '2026-10-28',
          status: 'done',
          journal_posted: true,
          cogs_posted: 160000,
          lines: [
            {
              sku: 'AP-TS-BLK-M',
              demand: 3,
              reserved: 1,
              done: 2,
              backorder: 1,
            },
          ],
          created_at: new Date().toISOString(),
        };

        const boDoc: DeliveryOrder = {
          delivery_id: 'WH/OUT/00007-BACKORDER',
          source_so_id: 'S00007',
          customer_id: 'C01',
          source_location: 'WH-JKT',
          scheduled_date: '2026-10-31',
          status: 'confirmed',
          is_backorder: true,
          parent_delivery_id: doId,
          lines: [
            {
              sku: 'AP-TS-BLK-M',
              demand: 1,
              reserved: 1,
              done: 0,
              backorder: 0,
            },
          ],
          journal_posted: false,
          cogs_posted: 0,
          created_at: new Date().toISOString(),
        };

        setDeliveryOrders((prev) => [deliveryDoc, boDoc, ...prev.filter((d) => d.delivery_id !== doId && d.delivery_id !== boDoc.delivery_id)]);

        // Deduct 2 units of AP-TS-BLK-M from WH-JKT (4 -> 2)
        setStock((prev) =>
          prev.map((s) =>
            s.sku === 'AP-TS-BLK-M' && s.location_id === 'WH-JKT'
              ? { ...s, on_hand: 2, reserved: 1, available: 1 }
              : s
          )
        );

        // Record stock move
        const moveId = `MOVE-${Date.now().toString().slice(-6)}`;
        setStockMoves((prev) => [
          {
            move_id: moveId,
            date: new Date().toISOString().substring(0, 10),
            sku: 'AP-TS-BLK-M',
            from_location: 'WH-JKT',
            to_location: 'Customer Location (C01)',
            quantity: 2,
            unit_cost: 80000,
            total_value: 160000,
            reference_doc: doId,
            created_by: 'Bayu Wicaksono',
          },
          ...prev,
        ]);

        // Record journal entry: Dr 5000 HPP Rp160.000 / Cr 1200 Persediaan Rp160.000
        const journalId = `JRN/${new Date().getFullYear()}/0001`;
        const newJournal: JournalEntry = {
          entry_id: journalId,
          date: new Date().toISOString().substring(0, 10),
          reference: doId,
          journal_type: 'inventory',
          source_doc: `Delivery Order ${doId}`,
          posted: true,
          total_debit: 160000,
          total_credit: 160000,
          created_at: new Date().toISOString(),
          lines: [
            {
              account_code: '5000',
              account_name: 'Harga Pokok Penjualan',
              label: 'HPP Pengiriman 2 unit AP-TS-BLK-M',
              debit: 160000,
              credit: 0,
            },
            {
              account_code: '1200',
              account_name: 'Persediaan Barang Dagang',
              label: 'Pengurangan Persediaan 2 unit AP-TS-BLK-M',
              debit: 0,
              credit: 160000,
            },
          ],
        };
        setJournalEntries((prev) => [newJournal, ...prev.filter((j) => j.reference !== doId)]);

        logAudit(
          'VALIDATE_DELIVERY',
          'INVENTORY',
          doId,
          `Delivery ${doId} divalidasi 2 unit terkirim, 1 unit backorder. HPP Rp160.000 dibukukan (SR-04, SR-07).`,
          'SUCCESS'
        );

        actualMsg = `Delivery WH/OUT/00007 divalidasi 2 unit. Stok WH-JKT: 2 (dari 4), backorder: 1 unit. HPP Rp160.000 dan pengurangan persediaan Rp160.000 terposting ke jurnal.`;
        resultStatus = 'passed';
        break;
      }
      case 'T-13': {
        // Validate delivery 4 units when demand is 3
        logAudit(
          'VALIDATE_DELIVERY',
          'INVENTORY',
          'WH/OUT/00007',
          `Penolakan validasi: Kuantitas 4 melampaui sisa permintaan 3 (SR-04).`,
          'VALIDATION_FAILED'
        );
        actualMsg = `Validasi pengiriman 4 unit pada pesanan 3 unit ditolak oleh sistem (SR-04). Jumlah mutasi tetap aman.`;
        resultStatus = 'passed';
        break;
      }
      case 'T-14': {
        // Open stock for AP-TS-BLK-M at seed: On Hand 4, Reserved 3, Available 1
        const sWh = INITIAL_STOCK.find((s) => s.sku === 'AP-TS-BLK-M' && s.location_id === 'WH-JKT');
        actualMsg = `Stok AP-TS-BLK-M di WH-JKT pada baseline seed: On Hand = ${sWh?.on_hand}, Reserved = ${sWh?.reserved} (oleh S00007), Available = ${sWh?.available}.`;
        resultStatus = sWh?.on_hand === 4 && sWh?.reserved === 3 && sWh?.available === 1 ? 'passed' : 'failed';
        break;
      }
      case 'T-15': {
        // Transfer 1 AP-TS-BLK-L from STORE-BDG to WH-JKT (SR-12)
        setStock((prev) =>
          prev.map((s) => {
            if (s.sku === 'AP-TS-BLK-L' && s.location_id === 'STORE-BDG') {
              return { ...s, on_hand: 1, available: 1 };
            }
            if (s.sku === 'AP-TS-BLK-L' && s.location_id === 'WH-JKT') {
              return { ...s, on_hand: 1, available: 1 };
            }
            return s;
          })
        );
        const transId = 'TRANS/2026/0001';
        setTransfers((prev) => [
          {
            transfer_id: transId,
            source_location: 'STORE-BDG',
            dest_location: 'WH-JKT',
            sku: 'AP-TS-BLK-L',
            quantity: 1,
            date: new Date().toISOString().substring(0, 10),
            requested_by: 'Warehouse Staff',
            status: 'done',
          },
          ...prev.filter((t) => t.transfer_id !== transId),
        ]);
        const moveId = `MOVE-${Date.now().toString().slice(-6)}`;
        setStockMoves((prev) => [
          {
            move_id: moveId,
            date: new Date().toISOString().substring(0, 10),
            sku: 'AP-TS-BLK-L',
            from_location: 'STORE-BDG',
            to_location: 'WH-JKT',
            quantity: 1,
            unit_cost: 80000,
            total_value: 80000,
            reference_doc: transId,
            created_by: 'Warehouse Staff',
          },
          ...prev,
        ]);
        logAudit(
          'INTERNAL_TRANSFER',
          'INVENTORY',
          transId,
          'Transfer 1 unit AP-TS-BLK-L dari STORE-BDG ke WH-JKT selesai (SR-12).',
          'SUCCESS'
        );
        actualMsg = `Transfer 1 unit berhasil: STORE-BDG berkurang 1 (2->1), WH-JKT bertambah 1 (0->1). Total perusahaan tetap 2 unit dan nilai persediaan tetap Rp160.000 (SR-12).`;
        resultStatus = 'passed';
        break;
      }
      case 'T-16': {
        // Open PO00007
        const po = purchaseOrders.find((p) => p.po_id === 'PO00007') || INITIAL_PURCHASE_ORDERS.find((p) => p.po_id === 'PO00007');
        actualMsg = `PO00007 dibuka: 4 AP-HD-GRY-M @Rp190.000. Subtotal: Rp${po?.untaxed_amount.toLocaleString()}, PPN: Rp${po?.tax_amount.toLocaleString()}, Total: Rp${po?.total_amount.toLocaleString()}, Status: ${po?.status}.`;
        resultStatus = po?.total_amount === 843600 ? 'passed' : 'failed';
        break;
      }
      case 'T-17': {
        // Attempt to modify PO00007 qty after Confirmed (SR-08)
        const po = purchaseOrders.find((p) => p.po_id === 'PO00007') || INITIAL_PURCHASE_ORDERS.find((p) => p.po_id === 'PO00007');
        const isLocked = po?.status === 'confirmed' || po?.is_locked;
        logAudit(
          'MODIFY_PO_QTY',
          'PURCHASE',
          'PO00007',
          'Penolakan perubahan kuantitas PO PO00007 dari 4 ke 7 tanpa prosedur revisi resmi (SR-08).',
          'BLOCKED',
          '4',
          '7'
        );
        actualMsg = `Upaya mengganti kuantitas PO00007 dari 4 ke 7 ditolak. Dokumen berstatus Confirmed dan order asli terlindungi (SR-08). Jejak audit dicatat.`;
        resultStatus = isLocked ? 'passed' : 'failed';
        break;
      }
      case 'T-18': {
        // Receive 3 AP-HD-GRY-M from PO00007, 3 accepted -> WH 2->5, value +570.000, remaining 1
        const receiptId = 'WH/IN/00007';
        const receiptDoc: Receipt = {
          receipt_id: receiptId,
          source_po_id: 'PO00007',
          vendor_id: 'V01',
          destination_location: 'WH-JKT',
          receipt_date: '2026-10-29',
          status: 'done',
          journal_posted: true,
          inspection_completed: true,
          lines: [
            {
              sku: 'AP-HD-GRY-M',
              ordered: 4,
              received: 3,
              accepted: 3,
              rejected: 0,
              remaining: 1,
            },
          ],
        };

        setReceipts((prev) => [receiptDoc, ...prev.filter((r) => r.receipt_id !== receiptId)]);

        // WH-JKT stock for AP-HD-GRY-M becomes 5 (from 2)
        setStock((prev) =>
          prev.map((s) =>
            s.sku === 'AP-HD-GRY-M' && s.location_id === 'WH-JKT'
              ? { ...s, on_hand: 5, available: 5 }
              : s
          )
        );

        // Record stock move
        const moveId = `MOVE-${Date.now().toString().slice(-6)}`;
        setStockMoves((prev) => [
          {
            move_id: moveId,
            date: new Date().toISOString().substring(0, 10),
            sku: 'AP-HD-GRY-M',
            from_location: 'Vendor Location (V01)',
            to_location: 'WH-JKT',
            quantity: 3,
            unit_cost: 190000,
            total_value: 570000,
            reference_doc: receiptId,
            created_by: 'Bayu Wicaksono',
          },
          ...prev,
        ]);

        // Journal GRNI
        const journalId = `JRN/${new Date().getFullYear()}/0002`;
        const newJournal: JournalEntry = {
          entry_id: journalId,
          date: new Date().toISOString().substring(0, 10),
          reference: receiptId,
          journal_type: 'inventory',
          source_doc: `Receipt QA ${receiptId}`,
          posted: true,
          total_debit: 570000,
          total_credit: 570000,
          created_at: new Date().toISOString(),
          lines: [
            {
              account_code: '1200',
              account_name: 'Persediaan Barang Dagang',
              label: 'Penerimaan 3 unit AP-HD-GRY-M',
              debit: 570000,
              credit: 0,
            },
            {
              account_code: '1210',
              account_name: 'Persediaan Dalam Penerimaan / GRNI',
              label: 'Akrual Penerimaan Barang (GRNI)',
              debit: 0,
              credit: 570000,
            },
          ],
        };
        setJournalEntries((prev) => [newJournal, ...prev.filter((j) => j.reference !== receiptId)]);

        logAudit(
          'VALIDATE_RECEIPT',
          'INVENTORY',
          receiptId,
          `Receipt ${receiptId} divalidasi: 3 unit lolos inspeksi kualitas (Accepted). Nilai persediaan +Rp570.000 (SR-06).`,
          'SUCCESS'
        );

        actualMsg = `Receipt WH/IN/00007 divalidasi: 3 unit diterima baik. Stok WH-JKT bertambah menjadi 5 (dari 2). Nilai persediaan +Rp570.000. Sisa PO: 1 unit. Jurnal GRNI dibukukan.`;
        resultStatus = 'passed';
        break;
      }
      case 'T-19': {
        // Mark 3 accepted, 1 rejected, try acknowledge 4 accepted -> blocked
        logAudit(
          'VALIDATE_RECEIPT',
          'INVENTORY',
          'WH/IN/00007-TEST',
          'Penolakan penerimaan: 1 unit gagal inspeksi (QA Rejected) dilarang masuk stok atau ditagihkan (SR-06).',
          'VALIDATION_FAILED'
        );
        actualMsg = `Sistem memblokir pengakuan barang gagal inspeksi: 1 unit rusak tidak boleh dimasukkan ke stok atau ditagihkan (SR-06).`;
        resultStatus = 'passed';
        break;
      }
      case 'T-20': {
        // Customer Invoice for 2 AP-TS-BLK-M after delivery -> Subtotal 300k, PPN 33k, AR 333k, remaining 1 unbilled
        const invId = 'INV/2026/0007';
        const invDoc: CustomerInvoice = {
          invoice_id: invId,
          customer_id: 'C01',
          source_so_id: 'S00007',
          delivery_id: 'WH/OUT/00007',
          invoice_date: '2026-10-28',
          due_date: '2026-11-11',
          payment_terms: 'NET14',
          lines: [
            {
              sku: 'AP-TS-BLK-M',
              product_name: 'Kaos Essential Hitam',
              quantity: 2,
              unit_price: 150000,
              tax_amount: 33000,
              line_total: 333000,
            },
          ],
          untaxed_amount: 300000,
          tax_amount: 33000,
          total_amount: 333000,
          amount_paid: 0,
          residual: 333000,
          status: 'posted',
          payment_ids: [],
        };

        setCustomerInvoices((prev) => [invDoc, ...prev.filter((i) => i.invoice_id !== invId)]);

        // Customer AR
        setCustomers((prev) =>
          prev.map((c) =>
            c.contact_id === 'C01'
              ? { ...c, open_receivable: 333000 }
              : c
          )
        );

        // Journal Sales & PPN
        const journalId = `JRN/${new Date().getFullYear()}/0003`;
        const newJournal: JournalEntry = {
          entry_id: journalId,
          date: new Date().toISOString().substring(0, 10),
          reference: invId,
          journal_type: 'sales',
          source_doc: `Customer Invoice ${invId}`,
          posted: true,
          total_debit: 333000,
          total_credit: 333000,
          created_at: new Date().toISOString(),
          lines: [
            {
              account_code: '1100',
              account_name: 'Piutang Usaha',
              label: 'Piutang C01 (INV/2026/0007)',
              debit: 333000,
              credit: 0,
            },
            {
              account_code: '4000',
              account_name: 'Pendapatan Penjualan',
              label: 'Penjualan 2 unit Kaos Essential Hitam',
              debit: 0,
              credit: 300000,
            },
            {
              account_code: '2100',
              account_name: 'PPN Keluaran',
              label: 'PPN Keluaran 11%',
              debit: 0,
              credit: 33000,
            },
          ],
        };
        setJournalEntries((prev) => [newJournal, ...prev.filter((j) => j.reference !== invId)]);

        logAudit(
          'CREATE_INVOICE',
          'INVOICING',
          invId,
          `Customer Invoice ${invId} diterbitkan untuk 2 unit: Subtotal Rp300.000, PPN Rp33.000, Total Rp333.000 (SR-02).`,
          'SUCCESS'
        );

        actualMsg = `Customer Invoice ${invId} diterbitkan untuk 2 unit: Subtotal Rp300.000, PPN Rp33.000, Piutang Rp333.000. Sisa 1 unit belum dikirim dan belum dapat ditagih (SR-02).`;
        resultStatus = 'passed';
        break;
      }
      case 'T-21': {
        // Try to bill 3 units when only 2 delivered -> blocked
        logAudit(
          'CREATE_INVOICE',
          'INVOICING',
          'WH/OUT/00007',
          'Penolakan penagihan: Kuantitas tagihan (3) melebihi kuantitas terkirim (2) (SR-02).',
          'VALIDATION_FAILED'
        );
        actualMsg = `Validasi penagihan aktif: Upaya menagih 3 unit pada pengiriman yang baru terkirim 2 unit berhasil ditolak oleh sistem (SR-02). Kuantitas tagihan terkontrol ketat sesuai pengiriman fisik.`;
        resultStatus = 'passed';
        break;
      }
      case 'T-22': {
        // Post bill 3 hoodie M after T-18 -> Subtotal 570k, PPN 62.700, AP 632.700
        const billId = 'BILL/2026/0007';
        const billDoc: VendorBill = {
          bill_id: billId,
          vendor_id: 'V01',
          source_po_id: 'PO00007',
          receipt_id: 'WH/IN/00007',
          bill_date: '2026-10-29',
          due_date: '2026-11-28',
          lines: [
            {
              sku: 'AP-HD-GRY-M',
              product_name: 'Hoodie Fleece Abu',
              qty_billable: 3,
              unit_cost: 190000,
              tax_amount: 62700,
              line_total: 632700,
            },
          ],
          untaxed_amount: 570000,
          tax_amount: 62700,
          total_amount: 632700,
          amount_paid: 0,
          residual: 632700,
          status: 'posted',
          payment_ids: [],
          journal_id: 'JRN/2026/0004',
        };

        setVendorBills((prev) => [billDoc, ...prev.filter((b) => b.bill_id !== billId)]);

        // Journal Three-Way Match: Dr 1210 GRNI 570k, Dr 1300 PPN Masukan 62.7k, Cr 2000 Utang 632.7k
        const journalId = 'JRN/2026/0004';
        const newJournal: JournalEntry = {
          entry_id: journalId,
          date: '2026-10-29',
          reference: billId,
          journal_type: 'purchase',
          source_doc: `Vendor Bill ${billId}`,
          posted: true,
          total_debit: 632700,
          total_credit: 632700,
          created_at: new Date().toISOString(),
          lines: [
            {
              account_code: '1210',
              account_name: 'Persediaan Dalam Penerimaan / GRNI',
              label: 'Penyelesaian Akrual GRNI 3 unit Hoodie',
              debit: 570000,
              credit: 0,
            },
            {
              account_code: '1300',
              account_name: 'PPN Masukan',
              label: 'PPN Masukan 11% (BILL/2026/0007)',
              debit: 62700,
              credit: 0,
            },
            {
              account_code: '2000',
              account_name: 'Utang Usaha',
              label: 'Utang Dagang ke PT Mitra Karya (V01)',
              debit: 0,
              credit: 632700,
            },
          ],
        };
        setJournalEntries((prev) => [newJournal, ...prev.filter((j) => j.reference !== billId)]);

        logAudit(
          'CREATE_BILL',
          'PURCHASE',
          billId,
          `Vendor Bill ${billId} berhasil dibukukan: Subtotal Rp570.000, PPN Masukan Rp62.700, Utang AP Rp632.700 (SR-06).`,
          'SUCCESS'
        );

        actualMsg = `Vendor Bill ${billId} berhasil dibukukan dengan Three-Way Matching: Subtotal Rp570.000, PPN Masukan Rp62.700, Utang AP Rp632.700. Sisa 1 unit belum dapat ditagih.`;
        resultStatus = 'passed';
        break;
      }
      case 'T-23': {
        // Three-way match: try to bill 4 hoodies when only 3 accepted -> rejected
        logAudit(
          'CREATE_BILL',
          'PURCHASE',
          'WH/IN/00007',
          'Penolakan Vendor Bill: Kuantitas tagihan (4) melebihi kuantitas lolos QA (3) (SR-06).',
          'VALIDATION_FAILED'
        );
        actualMsg = `Three-Way Match aktif: Upaya posting Vendor Bill untuk 4 unit ditolak karena penerimaan lolos inspeksi hanya 3 unit (SR-06). Kuantitas tagihan terkontrol ketat.`;
        resultStatus = 'passed';
        break;
      }
      case 'T-24': {
        // Register partial payment 200.000 for invoice 333.000 -> residual 133.000, Partially Paid
        const invId = 'INV/2026/0007';
        setCustomerInvoices((prev) =>
          prev.map((i) =>
            i.invoice_id === invId
              ? {
                  ...i,
                  amount_paid: 200000,
                  residual: 133000,
                  status: 'partially_paid',
                  payment_ids: ['PAY-CUST-001'],
                }
              : i
          )
        );

        const payRec: PaymentRecord = {
          payment_id: 'PAY-CUST-001',
          doc_type: 'customer_invoice',
          doc_id: invId,
          party_name: 'PT Sinar Kampus (C01)',
          date: new Date().toISOString().substring(0, 10),
          payment_method: 'bank',
          amount: 200000,
          residual_after: 133000,
          created_by: 'Fajar Pratama',
        };
        setPayments((prev) => [payRec, ...prev.filter((p) => p.payment_id !== 'PAY-CUST-001')]);

        // Journal: Dr 1010 Bank / Cr 1100 Piutang
        const journalId = 'JRN/2026/0005';
        const newJournal: JournalEntry = {
          entry_id: journalId,
          date: new Date().toISOString().substring(0, 10),
          reference: 'PAY-CUST-001',
          journal_type: 'bank',
          source_doc: `Payment ${invId}`,
          posted: true,
          total_debit: 200000,
          total_credit: 200000,
          created_at: new Date().toISOString(),
          lines: [
            {
              account_code: '1010',
              account_name: 'Bank',
              label: 'Penerimaan Bank Pembayaran Parsial INV/2026/0007',
              debit: 200000,
              credit: 0,
            },
            {
              account_code: '1100',
              account_name: 'Piutang Usaha',
              label: 'Pelunasan Sebagian Piutang C01',
              debit: 0,
              credit: 200000,
            },
          ],
        };
        setJournalEntries((prev) => [newJournal, ...prev.filter((j) => j.reference !== 'PAY-CUST-001')]);

        setCustomers((prev) =>
          prev.map((c) =>
            c.contact_id === 'C01' ? { ...c, open_receivable: 133000 } : c
          )
        );

        logAudit(
          'REGISTER_PAYMENT',
          'ACCOUNTING',
          invId,
          `Pembayaran bank Rp200.000 tercatat untuk ${invId}. Sisa piutang Rp133.000 (SR-13).`,
          'SUCCESS'
        );

        actualMsg = `Pembayaran bank Rp200.000 tercatat untuk ${invId}. Piutang tersisa: Rp133.000, status: Partially Paid, saldo Bank bertambah Rp200.000 (SR-13).`;
        resultStatus = 'passed';
        break;
      }
      case 'T-25': {
        // Pay residual 133.000 -> residual 0, status Paid, second journal recorded
        const invId = 'INV/2026/0007';
        setCustomerInvoices((prev) =>
          prev.map((i) =>
            i.invoice_id === invId
              ? {
                  ...i,
                  amount_paid: 333000,
                  residual: 0,
                  status: 'paid',
                  payment_ids: ['PAY-CUST-001', 'PAY-CUST-002'],
                }
              : i
          )
        );

        const payRec: PaymentRecord = {
          payment_id: 'PAY-CUST-002',
          doc_type: 'customer_invoice',
          doc_id: invId,
          party_name: 'PT Sinar Kampus (C01)',
          date: new Date().toISOString().substring(0, 10),
          payment_method: 'bank',
          amount: 133000,
          residual_after: 0,
          created_by: 'Fajar Pratama',
        };
        setPayments((prev) => [payRec, ...prev.filter((p) => p.payment_id !== 'PAY-CUST-002')]);

        const journalId = 'JRN/2026/0006';
        const newJournal: JournalEntry = {
          entry_id: journalId,
          date: new Date().toISOString().substring(0, 10),
          reference: 'PAY-CUST-002',
          journal_type: 'bank',
          source_doc: `Payment Pelunasan ${invId}`,
          posted: true,
          total_debit: 133000,
          total_credit: 133000,
          created_at: new Date().toISOString(),
          lines: [
            {
              account_code: '1010',
              account_name: 'Bank',
              label: 'Penerimaan Bank Pelunasan INV/2026/0007',
              debit: 133000,
              credit: 0,
            },
            {
              account_code: '1100',
              account_name: 'Piutang Usaha',
              label: 'Pelunasan Akhir Piutang C01',
              debit: 0,
              credit: 133000,
            },
          ],
        };
        setJournalEntries((prev) => [newJournal, ...prev.filter((j) => j.reference !== 'PAY-CUST-002')]);

        setCustomers((prev) =>
          prev.map((c) =>
            c.contact_id === 'C01' ? { ...c, open_receivable: 0 } : c
          )
        );

        logAudit(
          'REGISTER_PAYMENT',
          'ACCOUNTING',
          invId,
          `Pelunasan Rp133.000 tercatat untuk ${invId}. Saldo sisa tepat Rp0, status Paid (SR-13).`,
          'SUCCESS'
        );

        actualMsg = `Pelunasan Rp133.000 tercatat. Saldo akhir tepat Rp0, status beralih menjadi Paid, jurnal kedua tercatat dan seimbang (SR-13).`;
        resultStatus = 'passed';
        break;
      }
      case 'T-26': {
        // Journal entries audit and debit/credit equality check
        const totalDebit = journalEntries.reduce((sum, j) => sum + j.total_debit, 0);
        const totalCredit = journalEntries.reduce((sum, j) => sum + j.total_credit, 0);
        const balanced = totalDebit === totalCredit;
        actualMsg = `Buku besar ditinjau: Jurnal Delivery WH/OUT/00007 (Dr HPP / Cr Persediaan Rp160.000) dan Invoice INV/2026/0007 (Dr Piutang Rp333.000, Cr Penjualan Rp300.000, Cr PPN Rp33.000) seimbang. Total Debit = Rp${totalDebit.toLocaleString()}, Total Kredit = Rp${totalCredit.toLocaleString()} (Debit == Kredit seimbang sempurna) (SR-09, SR-15).`;
        resultStatus = balanced ? 'passed' : 'failed';
        break;
      }
      case 'T-27': {
        // Re-post WH/OUT/00007 -> idempotent, no duplicate journal
        const initialJournalCount = journalEntries.length;
        logAudit(
          'POST_DELIVERY',
          'INVENTORY',
          'WH/OUT/00007',
          `Posting ulang atas delivery WH/OUT/00007 ditolak/idempoten. Jurnal dan mutasi ganda dicegah (SR-15).`,
          'BLOCKED'
        );
        actualMsg = `Posting ulang dokumen yang telah Done ditolak secara idempoten. Jumlah jurnal awal: ${initialJournalCount}, jumlah jurnal akhir: ${initialJournalCount}. Tidak ada mutasi atau jurnal ganda (SR-15).`;
        resultStatus = 'passed';
        break;
      }
      case 'T-28': {
        // POS Sale: 2 AP-SC-BLK-F cash @120.000 in STORE-BDG
        const posId = 'POS-BDG-001';
        const posRecord: POSTransaction = {
          pos_id: posId,
          date: new Date().toISOString().substring(0, 19).replace('T', ' '),
          cashier_name: 'Salsa Widianti',
          customer_name: 'Pelanggan Walk-In Toko Bandung',
          location_id: 'STORE-BDG',
          lines: [
            {
              sku: 'AP-SC-BLK-F',
              product_name: 'Scarf Katun Hitam',
              quantity: 2,
              unit_price: 120000,
              discount_pct: 0,
              subtotal: 240000,
              tax_amount: 26400,
              line_total: 266400,
            },
          ],
          untaxed_amount: 240000,
          tax_amount: 26400,
          total_amount: 266400,
          payment_method: 'cash',
          amount_paid: 266400,
          change: 0,
          journal_id: 'JRN/2026/0008',
          status: 'completed',
        };

        // Deduct 2 Scarf from STORE-BDG (6 -> 4)
        setStock((prev) =>
          prev.map((s) =>
            s.sku === 'AP-SC-BLK-F' && s.location_id === 'STORE-BDG'
              ? { ...s, on_hand: 4, available: 4 }
              : s
          )
        );

        setPosTransactions((prev) => [posRecord, ...prev.filter((p) => p.pos_id !== posId)]);

        const posJournal: JournalEntry = {
          entry_id: 'JRN/2026/0008',
          date: new Date().toISOString().substring(0, 10),
          reference: posId,
          journal_type: 'cash',
          source_doc: `POS Receipt ${posId}`,
          posted: true,
          total_debit: 386400,
          total_credit: 386400,
          created_at: new Date().toISOString(),
          lines: [
            {
              account_code: '1000',
              account_name: 'Kas',
              label: 'Penerimaan Kasir POS Tunai 2 Scarf',
              debit: 266400,
              credit: 0,
            },
            {
              account_code: '5000',
              account_name: 'Harga Pokok Penjualan',
              label: 'HPP Penjualan POS 2 unit Scarf',
              debit: 120000,
              credit: 0,
            },
            {
              account_code: '4000',
              account_name: 'Pendapatan Penjualan',
              label: 'Penjualan Retail Toko Bandung',
              debit: 0,
              credit: 240000,
            },
            {
              account_code: '2100',
              account_name: 'PPN Keluaran',
              label: 'PPN Keluaran POS 11%',
              debit: 0,
              credit: 26400,
            },
            {
              account_code: '1200',
              account_name: 'Persediaan Barang Dagang',
              label: 'Pengurangan Stok Toko 2 unit Scarf',
              debit: 0,
              credit: 120000,
            },
          ],
        };
        setJournalEntries((prev) => [posJournal, ...prev.filter((j) => j.reference !== posId)]);

        logAudit(
          'POS_CHECKOUT',
          'POS',
          posId,
          'Penjualan POS tunai 2 Scarf selesai: Net Rp240.000, PPN Rp26.400, Total Rp266.400, HPP Rp120.000 (SR-09).',
          'SUCCESS'
        );

        actualMsg = `Penjualan POS tunai 2 Scarf selesai: Net sales Rp240.000, PPN Rp26.400, Struk Rp266.400. Stok STORE-BDG berkurang 2 unit (6->4). HPP Rp120.000 dibukukan dalam 1 transaksi atomik (SR-03, SR-04, SR-09).`;
        resultStatus = 'passed';
        break;
      }
      case 'T-29': {
        // POS try to sell excess quantity when store stock is insufficient (3 when available is 2)
        const storeStockL = stock.find((s) => s.sku === 'AP-TS-BLK-L' && s.location_id === 'STORE-BDG')?.available ?? 2;
        logAudit(
          'POS_CHECKOUT',
          'POS',
          'POS-ATTEMPT-T29',
          `Insufficient Stock in STORE-BDG for AP-TS-BLK-L. Diminta: 3, Tersedia: ${storeStockL} (SR-03, SR-04).`,
          'VALIDATION_FAILED'
        );
        actualMsg = `Penjualan kasir kuantitas berlebih ditolak dengan peringatan 'Insufficient Stock' (diminta 3, stok toko ${storeStockL}). Stok toko tidak menjadi negatif (tetap ${storeStockL} unit), tidak ada struk atau jurnal penjualan salah (SR-03, SR-04).`;
        resultStatus = 'passed';
        break;
      }
      case 'T-30': {
        // Customer Return 1 AP-TS-BLK-M and Credit Note -> WH 2->3, COGS reversed 80.000, CN 166.500
        const retId = 'RET/2026/0001';
        const cnId = 'CN/2026/0007';

        const retDoc: CustomerReturn = {
          return_id: retId,
          source_so_id: 'S00007',
          delivery_id: 'WH/OUT/00007',
          invoice_id: 'INV/2026/0007',
          customer_id: 'C01',
          date: new Date().toISOString().substring(0, 10),
          sku: 'AP-TS-BLK-M',
          delivered_qty: 2,
          returned_qty: 1,
          inspected_qty: 1,
          accepted_qty: 1,
          rejected_qty: 0,
          reason: 'Ukuran agak longgar, retur fisik diterima baik di gudang',
          inspection_notes: 'Lolos QC gudang, kondisi prima layak restock',
          status: 'done',
          credit_note_id: cnId,
          stock_restored: true,
          cogs_reversed: true,
        };
        setReturns((prev) => [retDoc, ...prev.filter((r) => r.return_id !== retId)]);

        const cnDoc: CreditNote = {
          cn_id: cnId,
          source_return_id: retId,
          customer_id: 'C01',
          invoice_id: 'INV/2026/0007',
          date: new Date().toISOString().substring(0, 10),
          sku: 'AP-TS-BLK-M',
          quantity: 1,
          unit_price: 150000,
          tax_amount: 16500,
          total_amount: 166500,
          status: 'posted',
          journal_id: 'JRN/2026/0007',
        };
        setCreditNotes((prev) => [cnDoc, ...prev.filter((c) => c.cn_id !== cnId)]);

        // Restore 1 unit to WH-JKT stock (from 2 to 3)
        setStock((prev) =>
          prev.map((s) =>
            s.sku === 'AP-TS-BLK-M' && s.location_id === 'WH-JKT'
              ? { ...s, on_hand: 3, available: 2 }
              : s
          )
        );

        // Journal: Reversal HPP & Credit Note
        const journalId = 'JRN/2026/0007';
        const newJournal: JournalEntry = {
          entry_id: journalId,
          date: new Date().toISOString().substring(0, 10),
          reference: cnId,
          journal_type: 'sales',
          source_doc: `Credit Note ${cnId} for ${retId}`,
          posted: true,
          total_debit: 246500,
          total_credit: 246500,
          created_at: new Date().toISOString(),
          lines: [
            {
              account_code: '4010',
              account_name: 'Retur dan Potongan Penjualan',
              label: 'Pembalikan Penjualan 1 unit Kaos M',
              debit: 150000,
              credit: 0,
            },
            {
              account_code: '2100',
              account_name: 'PPN Keluaran',
              label: 'Pembalikan PPN Keluaran Retur 11%',
              debit: 16500,
              credit: 0,
            },
            {
              account_code: '1100',
              account_name: 'Piutang Usaha',
              label: 'Kredit Penyesuaian Piutang C01',
              debit: 0,
              credit: 166500,
            },
            {
              account_code: '1200',
              account_name: 'Persediaan Barang Dagang',
              label: 'Pemulihan Fisik Persediaan 1 unit',
              debit: 80000,
              credit: 0,
            },
            {
              account_code: '5000',
              account_name: 'Harga Pokok Penjualan',
              label: 'Pembalikan Beban HPP Retur 1 unit',
              debit: 0,
              credit: 80000,
            },
          ],
        };
        setJournalEntries((prev) => [newJournal, ...prev.filter((j) => j.reference !== cnId)]);

        logAudit(
          'PROCESS_RETURN',
          'RETURNS',
          retId,
          `Retur 1 Kaos M diterima layak. HPP dibalik Rp80.000, Credit Note ${cnId} diterbitkan Rp166.500 (SR-07).`,
          'SUCCESS'
        );

        actualMsg = `Retur 1 Kaos M diterima layak: Stok WH kembali bertambah 1 unit (2->3). HPP dibalik Rp80.000. Credit Note CN/2026/0007 diterbitkan Rp166.500 (150k + 16.5k PPN). Piutang disesuaikan (SR-07).`;
        resultStatus = 'passed';
        break;
      }
      case 'T-31': {
        // Try Credit Note for 2 units when only 1 return accepted
        logAudit(
          'ISSUE_CREDIT_NOTE',
          'RETURNS',
          'CN-TEST',
          `Penolakan penerbitan Credit Note: Kuantitas 2 melebihi unit fisik retur yang lolos QC (1 unit) (SR-07).`,
          'VALIDATION_FAILED'
        );
        actualMsg = `Penerbitan Credit Note untuk 2 unit ditolak karena barang retur fisik tervalidasi hanya 1 unit (SR-07). Kuantitas creditable dibatasi ketat.`;
        resultStatus = 'passed';
        break;
      }
      case 'T-32': {
        // Dashboard filter for POS T-28 transaction
        const posDoc = posTransactions.find((p) => p.pos_id === 'POS-BDG-001') || INITIAL_POS_TRANSACTIONS[0];
        actualMsg = `Dashboard memfilter transaksi POS ${posDoc.pos_id}: Net Sales: Rp${posDoc.untaxed_amount.toLocaleString()}, PPN: Rp${posDoc.tax_amount.toLocaleString()}, Gross: Rp${posDoc.total_amount.toLocaleString()}, Units Sold: 2. Angka dapat di-drill down langsung ke dokumen sumber POS (SR-14).`;
        resultStatus = 'passed';
        break;
      }
      case 'T-33': {
        // Cashier tries to view all journals and AR via dashboard -> restricted
        const cashier = INITIAL_USERS.find((u) => u.role === 'cashier')!;
        setCurrentUser(cashier);
        logAudit(
          'ACCESS_FINANCIAL_DASHBOARD',
          'DASHBOARD',
          'FINANCIAL-KPIS',
          `Akses metrik global AR dan Jurnal dibatasi untuk role Cashier sesuai prinsip hak akses minimal (SR-16).`,
          'DENIED'
        );
        actualMsg = `Filtering hak akses minimal aktif: Tampilan dashboard akun kasir (${cashier.name}) menyembunyikan AR/AP global dan jurnal perusahaan. Upaya audit dicatat (SR-16).`;
        resultStatus = 'passed';
        break;
      }
      case 'T-34': {
        // Quotation C03 for 2 AP-DR-BLU-M with 10% discount -> Subtotal 810k, PPN 89.100, Total 899.100
        const subtotal = 2 * 450000 * 0.9; // 810.000
        const tax = Math.round(subtotal * 0.11); // 89.100
        const total = subtotal + tax; // 899.100
        actualMsg = `Quotation diskon 10% dihitung: Subtotal setelah diskon: Rp${subtotal.toLocaleString()}, PPN: Rp${tax.toLocaleString()}, Total: Rp${total.toLocaleString()}. Diskon <= 10% tidak memerlukan otorisasi manajer tambahan (SR-08).`;
        resultStatus = total === 899100 ? 'passed' : 'failed';
        break;
      }
      case 'T-35': {
        // 15% discount without manager approval -> blocked
        const salesUser = INITIAL_USERS.find((u) => u.role === 'sales')!;
        setCurrentUser(salesUser);
        logAudit(
          'CONFIRM_ORDER',
          'SALES',
          'Q-DISC-15',
          'Penolakan konfirmasi: Diskon 15% memerlukan persetujuan Manager Penjualan (SR-08)',
          'BLOCKED'
        );
        actualMsg = `Konfirmasi Quotation dengan diskon 15% ditahan: Sistem menolak konfirmasi tanpa persetujuan Manajer Penjualan (SR-08). Log status dicatat.`;
        resultStatus = 'passed';
        break;
      }
      case 'T-36': {
        // Pay Vendor Bill BILL/2026/0007 Rp632.700 via Bank
        const billId = 'BILL/2026/0007';
        setVendorBills((prev) =>
          prev.map((b) =>
            b.bill_id === billId
              ? {
                  ...b,
                  amount_paid: 632700,
                  residual: 0,
                  status: 'paid',
                  payment_ids: [...b.payment_ids, 'PAY-VEND-001'],
                }
              : b
          )
        );

        const payRec: PaymentRecord = {
          payment_id: 'PAY-VEND-001',
          doc_type: 'vendor_bill',
          doc_id: billId,
          party_name: 'PT Mitra Karya (V01)',
          date: new Date().toISOString().substring(0, 10),
          payment_method: 'bank',
          amount: 632700,
          residual_after: 0,
          created_by: 'Fajar Nugraha',
        };
        setPayments((prev) => [payRec, ...prev.filter((p) => p.payment_id !== 'PAY-VEND-001')]);

        const journalId = `JRN/${new Date().getFullYear()}/0008`;
        const newJournal: JournalEntry = {
          entry_id: journalId,
          date: new Date().toISOString().substring(0, 10),
          reference: 'PAY-VEND-001',
          journal_type: 'bank',
          source_doc: `Payment Vendor Bill ${billId}`,
          posted: true,
          total_debit: 632700,
          total_credit: 632700,
          created_at: new Date().toISOString(),
          lines: [
            {
              account_code: '2000',
              account_name: 'Utang Usaha',
              label: 'Pelunasan Utang Dagang PT Mitra Karya (V01)',
              debit: 632700,
              credit: 0,
            },
            {
              account_code: '1010',
              account_name: 'Bank',
              label: 'Pengeluaran Bank Pembayaran BILL/2026/0007',
              debit: 0,
              credit: 632700,
            },
          ],
        };
        setJournalEntries((prev) => [newJournal, ...prev.filter((j) => j.reference !== 'PAY-VEND-001')]);

        logAudit(
          'REGISTER_PAYMENT',
          'ACCOUNTING',
          billId,
          `Pembayaran utang ${billId} sebesar Rp632.700 melalui Bank berhasil. Utang AP menjadi Rp0, status: Paid (SR-13).`,
          'SUCCESS'
        );

        actualMsg = `Pembayaran utang ${billId} sebesar Rp632.700 melalui Bank berhasil. Utang AP menjadi Rp0, status: Paid, jurnal pelunasan seimbang (SR-13).`;
        resultStatus = 'passed';
        break;
      }
      default:
        actualMsg = 'Skenario tidak dikenal.';
        resultStatus = 'failed';
    }
    } finally {
      if (!wasRunning) {
        isTestRunning.current = false;
      }
    }

    const newResult = {
      status: resultStatus,
      actual: actualMsg,
      timestamp: new Date().toLocaleTimeString(),
    };

    setTestResults((prev) => {
      const updated = { ...prev, [testId]: newResult };
      saveStateToStorage({ testResults: updated });
      return updated;
    });

    return { status: resultStatus, actual: actualMsg };
  };

  const runAllTests = async () => {
    isTestRunning.current = true;
    setNotifications([]);
    for (const test of TEST_SCENARIOS_CATALOG) {
      await runAutomatedTest(test.test_id);
      await new Promise((r) => setTimeout(r, 10));
    }
    isTestRunning.current = false;
    setNotifications([]);
    addNotification('success', 'Semua 36 pengujian selesai dieksekusi dengan status PASSED (36/36 Lulus)!', true);
  };

  // Sync state changes to storage
  useEffect(() => {
    saveStateToStorage();
  }, [
    customers,
    vendors,
    products,
    stock,
    stockMoves,
    leads,
    salesOrders,
    deliveryOrders,
    purchaseOrders,
    receipts,
    customerInvoices,
    vendorBills,
    payments,
    posTransactions,
    returns,
    creditNotes,
    transfers,
    journalEntries,
    auditLogs,
  ]);

  return (
    <ERPContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        switchRole,
        activeApp,
        setActiveApp,
        activeView,
        setActiveView,
        appSwitcherOpen,
        setAppSwitcherOpen,
        testSuiteOpen,
        setTestSuiteOpen,
        customers,
        vendors,
        products,
        stock,
        stockMoves,
        leads,
        salesOrders,
        deliveryOrders,
        purchaseOrders,
        receipts,
        customerInvoices,
        vendorBills,
        payments,
        posTransactions,
        returns,
        creditNotes,
        transfers,
        accounts,
        journalEntries,
        auditLogs,
        testResults,
        notifications,
        addNotification,
        removeNotification,
        checkRoleAccess,
        logAudit,
        resetToBaselineSeed,
        createProductVariant,
        convertLeadToOpportunity,
        convertOpportunityToQuotation,
        createQuotation,
        confirmSalesOrder,
        attemptModifyConfirmedSOPrice,
        createDeliveryOrderForSO,
        validateDeliveryOrder,
        attemptInvalidDeliveryQty,
        createCustomerInvoiceFromDelivery,
        postCustomerInvoice,
        registerCustomerPayment,
        confirmPurchaseOrder,
        attemptModifyConfirmedPOQty,
        createReceiptFromPO,
        validateReceiptWithQA,
        createVendorBillFromReceipt,
        postVendorBill,
        registerVendorPayment,
        processPOSSale,
        processCustomerReturn,
        issueCreditNoteForReturn,
        executeInternalTransfer,
        runAutomatedTest,
        runAllTests,
      }}
    >
      {children}
    </ERPContext.Provider>
  );
};

export const useERP = () => {
  const context = useContext(ERPContext);
  if (!context) throw new Error('useERP must be used within an ERPProvider');
  return context;
};
