import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
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
} from '../types/erp';
import {
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
} from '../data/seedData';
import { supabase } from '../lib/supabaseClient';
import { loadERPState, loadERPAuditLogs, saveERPAuditLog, saveERPState } from '../lib/erpDatabase';

interface ERPContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  activeApp: AppModuleId;
  setActiveApp: (app: AppModuleId) => void;
  activeView: string;
  setActiveView: (view: string) => void;
  appSwitcherOpen: boolean;
  setAppSwitcherOpen: (open: boolean) => void;

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

  // Toast / notification
  notifications: { id: string; type: 'success' | 'warning' | 'error' | 'info'; message: string }[];
  addNotification: (type: 'success' | 'warning' | 'error' | 'info', message: string) => void;
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
  createCustomer: (customerData: Omit<Customer, 'contact_id' | 'open_receivable'>) => Customer;
  createProductVariant: (newVariant: Omit<ProductVariant, 'active'>) => { success: boolean; message: string };
  updateProductPrice: (sku: string, salesPriceIdr: number, costIdr: number) => { success: boolean; message: string };
  createLead: (leadData: {
    customer_id: string;
    title: string;
    contact_person: string;
    email: string;
    phone: string;
    expected_revenue: number;
    priority: CRMLead['priority'];
    stage?: CRMLead['stage'];
    initial_note?: string;
  }) => CRMLead;
  updateLeadStage: (leadId: string, stage: CRMLead['stage']) => { success: boolean; message: string };
  updateLeadDetails: (
    leadId: string,
    updates: {
      title: string;
      contact_person: string;
      email: string;
      phone: string;
      expected_revenue: number;
      priority: CRMLead['priority'];
      stage: CRMLead['stage'];
    }
  ) => { success: boolean; message: string };
  addLeadNote: (leadId: string, note: string) => void;
  convertLeadToOpportunity: (leadId: string) => { success: boolean; message: string; opportunityId?: string };
  convertOpportunityToQuotation: (leadId: string) => { success: boolean; message: string; quotationId?: string };
  createQuotation: (so: Omit<SalesOrder, 'order_id' | 'type' | 'status' | 'is_locked' | 'delivery_ids' | 'invoice_ids'>) => SalesOrder;
  updateSalesOrderLine: (
    orderId: string,
    lineId: string,
    updates: { unit_price?: number; quantity?: number; discount_pct?: number }
  ) => { success: boolean; message: string };
  confirmSalesOrder: (orderId: string, forceManagerOverride?: boolean) => { success: boolean; message: string };
  createDeliveryOrderForSO: (soId: string) => DeliveryOrder | null;
  validateDeliveryOrder: (deliveryId: string, doneUnits: number) => { success: boolean; message: string; backorderId?: string };
  createCustomerInvoiceFromDelivery: (deliveryId: string, qtyToBill?: number) => { success: boolean; message: string; invoiceId?: string };
  postCustomerInvoice: (invoiceId: string) => { success: boolean; message: string };
  registerCustomerPayment: (invoiceId: string, amount: number, method: 'bank' | 'cash') => { success: boolean; message: string };
  confirmPurchaseOrder: (poId: string) => { success: boolean; message: string };
  updatePurchaseOrderLine: (
    poId: string,
    lineId: string,
    updates: { unit_cost?: number; quantity?: number }
  ) => { success: boolean; message: string };
  createReceiptFromPO: (poId: string) => Receipt | null;
  validateReceiptWithQA: (receiptId: string, acceptedQty: number, rejectedQty: number) => { success: boolean; message: string };
  createVendorBillFromReceipt: (receiptId: string, qtyToBill?: number) => { success: boolean; message: string; billId?: string };
  postVendorBill: (billId: string) => { success: boolean; message: string };
  registerVendorPayment: (billId: string, amount: number, method: 'bank' | 'cash') => { success: boolean; message: string };
  processPOSSale: (sku: string, qty: number, paymentMethod: 'cash' | 'bank', overrideUnitPrice?: number) => { success: boolean; message: string; receipt?: POSTransaction };
  processPOSCart: (params: {
    items: { sku: string; quantity: number; unitPrice: number; discountPct: number }[];
    paymentMethod: 'cash' | 'bank';
    customerName?: string;
    amountPaid?: number;
  }) => { success: boolean; message: string; receipt?: POSTransaction };
  processCustomerReturn: (deliveryId: string, invoiceId: string, sku: string, returnedQty: number, acceptedQty: number, rejectedQty: number, reason: string) => { success: boolean; message: string; returnId?: string };
  issueCreditNoteForReturn: (returnId: string, requestedQty?: number) => { success: boolean; message: string; cnId?: string };
  executeInternalTransfer: (sku: string, fromLoc: 'STORE-BDG' | 'WH-JKT', toLoc: 'STORE-BDG' | 'WH-JKT', qty: number) => { success: boolean; message: string };
}

const ERPContext = createContext<ERPContextType | undefined>(undefined);

const STORAGE_KEY = 'PT_RONA_KARSA_ERP_STATE_V1';

export const ERPProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Current user & authentication
  const [currentUser, setCurrentUserState] = useState<User | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  const setCurrentUser = (user: User | null) => {
    setCurrentUserState(user);
    if (!user) {
      setIsHydrated(false);
      void supabase.auth.signOut();
    }
  };
  const [activeApp, setActiveApp] = useState<AppModuleId>('home');
  const [activeView, setActiveView] = useState<string>('overview');
  const [appSwitcherOpen, setAppSwitcherOpen] = useState<boolean>(false);
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

  // Muat dataset ERP bersama dari Supabase hanya setelah user terautentikasi.
  // Data seed tetap dipakai bila baris di cloud belum ada.
  useEffect(() => {
    let cancelled = false;

    const hydrateFromSupabase = async () => {
      if (!currentUser) {
        setIsHydrated(false);
        return;
      }

      setIsHydrated(false);
      try {
        const saved = await loadERPState();
        if (cancelled) return;

        if (saved) {
          if (saved.customers) setCustomers(saved.customers as Customer[]);
          if (saved.vendors) setVendors(saved.vendors as Vendor[]);
          if (saved.products) {
            // Baris produk lama di cloud belum punya imageUrl -> isi dari seed agar foto POS tampil.
            const hydratedProducts = (saved.products as ProductVariant[]).map((p) => {
              if (p.imageUrl) return p;
              const seedMatch =
                INITIAL_PRODUCTS.find((s) => s.sku === p.sku) ||
                INITIAL_PRODUCTS.find((s) => s.category === p.category);
              return seedMatch?.imageUrl ? { ...p, imageUrl: seedMatch.imageUrl } : p;
            });
            setProducts(hydratedProducts);
          }
          if (saved.stock) setStock(saved.stock as StockQuantity[]);
          if (saved.stockMoves) setStockMoves(saved.stockMoves as StockMove[]);
          if (saved.leads) setLeads(saved.leads as CRMLead[]);
          if (saved.salesOrders) setSalesOrders(saved.salesOrders as SalesOrder[]);
          if (saved.deliveryOrders) setDeliveryOrders(saved.deliveryOrders as DeliveryOrder[]);
          if (saved.purchaseOrders) setPurchaseOrders(saved.purchaseOrders as PurchaseOrder[]);
          if (saved.receipts) setReceipts(saved.receipts as Receipt[]);
          if (saved.customerInvoices) setCustomerInvoices(saved.customerInvoices as CustomerInvoice[]);
          if (saved.vendorBills) setVendorBills(saved.vendorBills as VendorBill[]);
          if (saved.payments) setPayments(saved.payments as PaymentRecord[]);
          if (saved.posTransactions) setPosTransactions(saved.posTransactions as POSTransaction[]);
          if (saved.returns) setReturns(saved.returns as CustomerReturn[]);
          if (saved.creditNotes) setCreditNotes(saved.creditNotes as CreditNote[]);
          if (saved.transfers) setTransfers(saved.transfers as InternalTransfer[]);
          if (saved.accounts) setAccounts(saved.accounts as Account[]);
          if (saved.journalEntries) setJournalEntries(saved.journalEntries as JournalEntry[]);
          if (saved.auditLogs) setAuditLogs(saved.auditLogs as AuditLog[]);
        }

        // Hanya owner dan finance (peran asli di database) yang boleh membaca audit log.
        if (currentUser.role === 'owner' || currentUser.role === 'finance') {
          try {
            const cloudAuditLogs = await loadERPAuditLogs();
            if (cancelled) return;
            const legacyLogs = (saved?.auditLogs as AuditLog[] | undefined) ?? INITIAL_AUDIT_LOGS;
            const mergedLogs = new Map<string, AuditLog>();
            [...legacyLogs, ...cloudAuditLogs].forEach((log) => mergedLogs.set(log.log_id, log as AuditLog));
            setAuditLogs(
              Array.from(mergedLogs.values()).sort(
                (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
              )
            );
          } catch (auditError) {
            console.error('Gagal memuat audit log dari Supabase:', auditError);
            addNotification('warning', 'Audit log cloud belum dapat dimuat. Pastikan tabel erp_audit_logs sudah dibuat.');
          }
        } else {
          setAuditLogs([]);
        }

        // Autosave baru aktif setelah pembacaan cloud berhasil.
        if (!cancelled) setIsHydrated(true);
      } catch (error) {
        console.error('Gagal memuat ERP state dari Supabase:', error);
        if (!cancelled) {
          addNotification('error', 'Data ERP gagal dimuat dari Supabase. Periksa koneksi dan konfigurasi database.');
        }
      }
    };

    void hydrateFromSupabase();
    return () => {
      cancelled = true;
    };
  }, [currentUser?.id]);

  const addNotification = (
    type: 'success' | 'warning' | 'error' | 'info',
    message: string
  ) => {
    const id = Math.random().toString(36).substring(2, 9);
    setNotifications((prev) => [...prev, { id, type, message }]);
    setTimeout(() => removeNotification(id), 5000);
  };

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
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

    if (currentUser?.id) {
      void saveERPAuditLog(newLog, currentUser.id).catch((error) => {
        console.error('Audit log gagal disimpan ke Supabase:', error);
        addNotification('warning', 'Aktivitas tercatat di aplikasi, tetapi gagal disimpan ke audit log cloud.');
      });
    }
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
    localStorage.removeItem(STORAGE_KEY);
    addNotification('success', 'Database berhasil di-reset ke baseline seed 106 unit & Rp11.140.000!');
  };

  // Create Product Variant with unique SKU check
  const createProductVariant = (newVariant: Omit<ProductVariant, 'active'>) => {
    const exists = products.some((p) => p.sku.trim().toUpperCase() === newVariant.sku.trim().toUpperCase());
    if (exists) {
      logAudit('CREATE_VARIANT', 'PRODUCTS', newVariant.sku, `Duplicate SKU rejection for ${newVariant.sku}`, 'VALIDATION_FAILED');
      addNotification('error', `Gagal: SKU ${newVariant.sku} sudah ada dalam sistem! SKU harus unik.`);
      return { success: false, message: `SKU ${newVariant.sku} sudah terdaftar.` };
    }

    const fallbackImage =
      newVariant.imageUrl ||
      INITIAL_PRODUCTS.find(
        (p) =>
          p.category === newVariant.category &&
          p.color.toLowerCase() === newVariant.color.toLowerCase()
      )?.imageUrl ||
      INITIAL_PRODUCTS.find((p) => p.category === newVariant.category)?.imageUrl;

    const created: ProductVariant = {
      ...newVariant,
      imageUrl: fallbackImage,
      active: true,
    };
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

  // Update Product sales price and cost
  const updateProductPrice = (sku: string, salesPriceIdr: number, costIdr: number) => {
    const prod = products.find((p) => p.sku === sku);
    if (!prod) return { success: false, message: 'Produk tidak ditemukan.' };
    if (salesPriceIdr < 0 || costIdr < 0) {
      addNotification('error', 'Harga jual maupun standar cost tidak boleh bernilai negatif.');
      return { success: false, message: 'Harga tidak boleh negatif.' };
    }

    setProducts((prev) =>
      prev.map((p) =>
        p.sku === sku
          ? {
              ...p,
              sales_price_idr: Math.round(salesPriceIdr),
              cost_idr: Math.round(costIdr),
            }
          : p
      )
    );

    logAudit(
      'UPDATE_PRODUCT_PRICE',
      'PRODUCTS',
      sku,
      `Harga ${sku} diperbarui: Jual Rp${prod.sales_price_idr.toLocaleString()} -> Rp${Math.round(salesPriceIdr).toLocaleString()}, Cost Rp${prod.cost_idr.toLocaleString()} -> Rp${Math.round(costIdr).toLocaleString()}`,
      'SUCCESS',
      `Jual: ${prod.sales_price_idr}, Cost: ${prod.cost_idr}`,
      `Jual: ${Math.round(salesPriceIdr)}, Cost: ${Math.round(costIdr)}`
    );
    addNotification('success', `Harga produk ${sku} berhasil diperbarui!`);
    return { success: true, message: 'Harga produk diperbarui.' };
  };

  // Create new Customer
  const createCustomer = (customerData: Omit<Customer, 'contact_id' | 'open_receivable'>): Customer => {
    const maxNum = customers.reduce((max, c) => {
      const n = parseInt(c.contact_id.replace(/\D/g, ''), 10);
      return Number.isNaN(n) ? max : Math.max(max, n);
    }, 0);
    const contactId = `C${String(maxNum + 1).padStart(2, '0')}`;
    const effectiveLimit = customerData.payment_terms === 'TUNAI' ? 0 : Math.max(0, customerData.credit_limit_idr);

    const newCustomer: Customer = {
      ...customerData,
      contact_id: contactId,
      credit_limit_idr: effectiveLimit,
      open_receivable: 0,
    };

    setCustomers((prev) => [...prev, newCustomer]);
    logAudit(
      'CREATE_CUSTOMER',
      'CRM',
      contactId,
      `Pelanggan baru ditambahkan: ${newCustomer.name} (${newCustomer.contact_type}, ${newCustomer.city}, Termin ${newCustomer.payment_terms})`,
      'SUCCESS'
    );
    addNotification('success', `Pelanggan baru ${newCustomer.name} (${contactId}) berhasil ditambahkan.`);
    return newCustomer;
  };

  // Create new CRM Lead
  const createLead = (leadData: {
    customer_id: string;
    title: string;
    contact_person: string;
    email: string;
    phone: string;
    expected_revenue: number;
    priority: CRMLead['priority'];
    stage?: CRMLead['stage'];
    initial_note?: string;
  }): CRMLead => {
    const maxNum = leads.reduce((max, l) => {
      const n = parseInt(l.lead_id.replace(/\D/g, ''), 10);
      return Number.isNaN(n) ? max : Math.max(max, n);
    }, 0);
    const leadId = `LEAD-${String(maxNum + 1).padStart(3, '0')}`;
    const customer = customers.find((c) => c.contact_id === leadData.customer_id);
    const stage = leadData.stage || 'new';

    const notes: string[] = [];
    if (leadData.initial_note && leadData.initial_note.trim()) {
      notes.push(leadData.initial_note.trim());
    } else {
      notes.push(`Prospek dibuat untuk ${customer?.name || leadData.contact_person}.`);
    }

    const newLead: CRMLead = {
      lead_id: leadId,
      customer_id: leadData.customer_id,
      title: leadData.title.trim(),
      contact_person: leadData.contact_person.trim() || customer?.name || '-',
      email: leadData.email.trim() || customer?.email || '-',
      phone: leadData.phone.trim() || customer?.phone || '-',
      expected_revenue: Math.max(0, leadData.expected_revenue),
      stage,
      priority: leadData.priority,
      salesperson: currentUser?.name || 'Nadya Kinasih',
      created_at: new Date().toISOString().replace('T', ' ').substring(0, 16),
      converted_opportunity_id: stage === 'qualified' ? `OPP-${leadId}` : undefined,
      notes,
    };

    setLeads((prev) => [newLead, ...prev]);
    logAudit('CREATE_LEAD', 'CRM', leadId, `Prospek baru dibuat: ${newLead.title} untuk ${customer?.name || leadData.customer_id}`, 'SUCCESS');
    addNotification('success', `Prospek ${leadId} (${newLead.title}) berhasil ditambahkan ke pipeline.`);
    return newLead;
  };

  // Update Lead stage (forward or backward across pipeline stages)
  const updateLeadStage = (leadId: string, stage: CRMLead['stage']) => {
    const lead = leads.find((l) => l.lead_id === leadId);
    if (!lead) return { success: false, message: 'Prospek tidak ditemukan.' };
    if (lead.stage === stage) return { success: true, message: 'Tahap tidak berubah.' };

    const stageNames: Record<CRMLead['stage'], string> = {
      new: '01. Prospek Baru',
      qualified: '02. Peluang Siap',
      proposition: '03. Penawaran Dikirim',
      won: '04. Deal Menang',
      lost: '05. Tidak Lanjut',
    };

    const stageOrder: Record<CRMLead['stage'], number> = {
      new: 1,
      qualified: 2,
      proposition: 3,
      won: 4,
      lost: 5,
    };
    const isMovingBack = lead.stage !== 'lost' && stage !== 'lost' && stageOrder[stage] < stageOrder[lead.stage];

    setLeads((prev) =>
      prev.map((l) =>
        l.lead_id === leadId
          ? {
              ...l,
              stage,
              converted_opportunity_id:
                stage !== 'new' && !l.converted_opportunity_id ? `OPP-${leadId}` : l.converted_opportunity_id,
              notes: [
                ...l.notes,
                `${isMovingBack ? 'Dikembalikan' : 'Tahap diubah'} dari "${stageNames[lead.stage]}" ke "${stageNames[stage]}" pada ${new Date().toLocaleString()}`,
              ],
            }
          : l
      )
    );
    logAudit(
      'UPDATE_LEAD_STAGE',
      'CRM',
      leadId,
      `Tahap prospek ${leadId} ${isMovingBack ? 'dikembalikan' : 'diubah'} dari ${stageNames[lead.stage]} ke ${stageNames[stage]}`,
      'SUCCESS',
      lead.stage,
      stage
    );
    addNotification(
      'success',
      `Prospek ${leadId} ${isMovingBack ? 'dikembalikan' : 'dipindahkan'} ke tahap ${stageNames[stage]}.`
    );
    return { success: true, message: `Dipindahkan ke ${stageNames[stage]}.` };
  };

  // Update Lead details (title, contact, revenue, priority, stage)
  const updateLeadDetails = (
    leadId: string,
    updates: {
      title: string;
      contact_person: string;
      email: string;
      phone: string;
      expected_revenue: number;
      priority: CRMLead['priority'];
      stage: CRMLead['stage'];
    }
  ) => {
    const lead = leads.find((l) => l.lead_id === leadId);
    if (!lead) return { success: false, message: 'Prospek tidak ditemukan.' };

    setLeads((prev) =>
      prev.map((l) =>
        l.lead_id === leadId
          ? {
              ...l,
              title: updates.title.trim() || l.title,
              contact_person: updates.contact_person.trim() || l.contact_person,
              email: updates.email.trim() || l.email,
              phone: updates.phone.trim() || l.phone,
              expected_revenue: Math.max(0, updates.expected_revenue),
              priority: updates.priority,
              stage: updates.stage,
              notes: [
                ...l.notes,
                `Data prospek diperbarui oleh ${currentUser?.name || 'Admin'} pada ${new Date().toLocaleString()}`,
              ],
            }
          : l
      )
    );
    logAudit('UPDATE_LEAD', 'CRM', leadId, `Detail prospek ${leadId} diperbarui (${updates.title})`, 'SUCCESS');
    addNotification('success', `Perubahan pada prospek ${leadId} berhasil disimpan.`);
    return { success: true, message: 'Perubahan prospek tersimpan.' };
  };

  // Add note to Lead
  const addLeadNote = (leadId: string, note: string) => {
    setLeads((prev) =>
      prev.map((l) => (l.lead_id === leadId ? { ...l, notes: [...l.notes, note] } : l))
    );
  };

  // Convert CRM Lead to Opportunity
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
          notes: [...l.notes, `Dikonversi ke Peluang (${oppId}) pada ${new Date().toLocaleString()}`],
        };
      }
      return l;
    });
    setLeads(updatedLeads);
    logAudit('CONVERT_LEAD', 'CRM', leadId, `Lead ${leadId} dikonversi ke Opportunity stage Qualified. Tautan asal dipertahankan.`, 'SUCCESS');
    addNotification('success', `Prospek ${leadId} berhasil diproses menjadi Peluang (${oppId}).`);
    return { success: true, message: 'Prospek diproses menjadi Peluang.', opportunityId: oppId };
  };

  // Convert Opportunity to Quotation without creating duplicates
  const convertOpportunityToQuotation = (leadId: string) => {
    const lead = leads.find((l) => l.lead_id === leadId);
    if (!lead) return { success: false, message: 'Lead tidak ditemukan.' };

    if (lead.converted_quotation_id) {
      logAudit('CONVERT_OPPORTUNITY', 'CRM', leadId, `Upaya konversi ulang Opportunity ${leadId}. Dokumen ganda dicegah.`, 'VALIDATION_FAILED');
      addNotification('warning', `Peluang sudah terhubung ke Penawaran ${lead.converted_quotation_id}. Dokumen ganda dicegah.`);
      return { success: false, message: `Sudah terhubung ke ${lead.converted_quotation_id}`, quotationId: lead.converted_quotation_id };
    }

    const customer = customers.find((c) => c.contact_id === lead.customer_id);
    const hasQ00008 = salesOrders.some((so) => so.order_id === 'Q00008');
    const maxQNum = salesOrders.reduce((max, so) => {
      const n = parseInt(so.order_id.replace(/\D/g, ''), 10);
      return Number.isNaN(n) ? max : Math.max(max, n);
    }, 8);
    const qNumber = leadId === 'LEAD-001' && !hasQ00008 ? 'Q00008' : `Q${String(maxQNum + 1).padStart(5, '0')}`;

    const isSeedLead = leadId === 'LEAD-001';
    const fallbackProduct = products[0];
    const subtotal = isSeedLead ? 900000 : Math.round((lead.expected_revenue || fallbackProduct.sales_price_idr) / 1.11);
    const taxAmount = isSeedLead ? 99000 : Math.round(subtotal * 0.11);
    const totalAmount = subtotal + taxAmount;

    const newQuotation: SalesOrder = {
      order_id: qNumber,
      type: 'quotation',
      customer_id: lead.customer_id,
      order_date: new Date().toISOString().substring(0, 10),
      expiration_date: new Date(Date.now() + 14 * 86400000).toISOString().substring(0, 10),
      payment_terms: customer?.payment_terms || 'NET14',
      warehouse_id: 'WH-JKT',
      salesperson: lead.salesperson,
      status: 'draft',
      lines: isSeedLead
        ? [
            {
              id: 'QL-01',
              sku: 'AP-DR-BLU-M',
              product_name: 'Dress Denim Biru',
              size: 'M',
              color: 'Biru',
              quantity: 2,
              unit_price: 450000,
              discount_pct: 0,
              tax_amount: 99000,
              subtotal: 900000,
              total: 999000,
            },
          ]
        : [
            {
              id: 'QL-01',
              sku: fallbackProduct?.sku || 'AP-TS-BLK-M',
              product_name: lead.title,
              size: fallbackProduct?.size || 'M',
              color: fallbackProduct?.color || 'Hitam',
              quantity: 1,
              unit_price: subtotal,
              discount_pct: 0,
              tax_amount: taxAmount,
              subtotal,
              total: totalAmount,
            },
          ],
      untaxed_amount: subtotal,
      discount_amount: 0,
      tax_amount: taxAmount,
      total_amount: totalAmount,
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
              notes: [...l.notes, `Penawaran ${qNumber} diterbitkan untuk "${l.title}".`],
            }
          : l
      )
    );

    logAudit('CONVERT_OPPORTUNITY', 'CRM', leadId, `Created Quotation ${qNumber} from Opportunity ${leadId}`, 'SUCCESS');
    addNotification('success', `Penawaran ${qNumber} berhasil dibuat untuk ${customer?.name || lead.contact_person}.`);
    return { success: true, message: `Penawaran ${qNumber} dibuat.`, quotationId: qNumber };
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

  // Update Quotation / Draft Sales Order Line Price, Qty, or Discount
  const updateSalesOrderLine = (
    orderId: string,
    lineId: string,
    updates: { unit_price?: number; quantity?: number; discount_pct?: number }
  ) => {
    const order = salesOrders.find((so) => so.order_id === orderId);
    if (!order) return { success: false, message: 'Dokumen tidak ditemukan.' };

    if (order.status === 'confirmed' || order.status === 'done' || order.is_locked) {
      addNotification('error', `Dokumen ${orderId} sudah dikonfirmasi dan terkunci.`);
      return { success: false, message: 'Dokumen terkunci.' };
    }

    const updatedLines = order.lines.map((line) => {
      if (line.id !== lineId) return line;
      const unitPrice = Math.max(0, updates.unit_price ?? line.unit_price);
      const quantity = Math.max(1, updates.quantity ?? line.quantity);
      const discountPct = Math.min(100, Math.max(0, updates.discount_pct ?? line.discount_pct));
      const subtotal = Math.round(quantity * unitPrice * (1 - discountPct / 100));
      const taxAmount = Math.round(subtotal * 0.11);
      const total = subtotal + taxAmount;
      return {
        ...line,
        unit_price: unitPrice,
        quantity,
        discount_pct: discountPct,
        subtotal,
        tax_amount: taxAmount,
        total,
      };
    });

    const untaxedAmount = updatedLines.reduce((s, l) => s + l.subtotal, 0);
    const discountAmount = updatedLines.reduce(
      (s, l) => s + Math.round(l.quantity * l.unit_price * (l.discount_pct / 100)),
      0
    );
    const taxAmount = updatedLines.reduce((s, l) => s + l.tax_amount, 0);
    const totalAmount = untaxedAmount + taxAmount;
    const discountApproved = !updatedLines.some((l) => l.discount_pct > 10);

    setSalesOrders((prev) =>
      prev.map((so) =>
        so.order_id === orderId
          ? {
              ...so,
              lines: updatedLines,
              untaxed_amount: untaxedAmount,
              discount_amount: discountAmount,
              tax_amount: taxAmount,
              total_amount: totalAmount,
              discount_approved: discountApproved,
            }
          : so
      )
    );

    logAudit('UPDATE_SO_PRICE', 'SALES', orderId, `Harga / rincian baris pada ${orderId} diperbarui`, 'SUCCESS');
    addNotification('success', `Harga pada ${orderId} berhasil diperbarui.`);
    return { success: true, message: 'Harga penawaran diperbarui.' };
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
          `Ditolak: Diskon melebihi 10% tanpa otorisasi manajer`,
          'BLOCKED',
          'Unapproved',
          'Blocked'
        );
        addNotification('error', `Konfirmasi ditahan: Diskon > 10% memerlukan persetujuan Manager!`);
        return { success: false, message: 'Diskon > 10% butuh persetujuan manajer.' };
      }
    }

    // Check Credit Limit & Terms
    // Credit Exposure = Open Receivable + Gross New Order (including VAT)
    if (order.payment_terms === 'TUNAI' || customer.payment_terms === 'TUNAI') {
      if (order.payment_terms !== 'TUNAI') {
        logAudit(
          'CONFIRM_ORDER',
          'SALES',
          orderId,
          `Ditolak: Pelanggan TUNAI tanpa limit tidak boleh menggunakan kredit`,
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
          `Credit limit exceeded for ${customer.name}. Exposure Rp${totalExposure.toLocaleString()} > Limit Rp${customer.credit_limit_idr.toLocaleString()}`,
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

    logAudit('CONFIRM_ORDER', 'SALES', orderId, `Sales Order ${orderId} Confirmed. Stok direservasi & dokumen dikunci.`, 'SUCCESS');
    addNotification('success', `Sales Order ${orderId} berhasil dikonfirmasi! Stok berhasil direservasi.`);
    return { success: true, message: `Order ${orderId} dikonfirmasi.` };
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
      // Idempotency guard
      logAudit(
        'POST_DELIVERY',
        'INVENTORY',
        deliveryId,
        `Posting ulang atas delivery ${deliveryId} ditolak/idempoten. Jurnal dan mutasi ganda dicegah.`,
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
        `Penolakan: Kuantitas pengiriman (${doneUnits}) melampaui permintaan (${firstLine.demand}).`,
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
      `Delivery ${deliveryId} tervalidasi (${doneUnits} unit terkirim, ${backorderQty} unit backorder). HPP Rp${cogsAmount.toLocaleString()} dibukukan ke jurnal ${journalId}.`,
      'SUCCESS'
    );

    addNotification(
      'success',
      `Delivery ${deliveryId} divalidasi! ${doneUnits} unit dikirim. HPP Rp${cogsAmount.toLocaleString()} diakui.`
    );

    return { success: true, message: 'Delivery divalidasi.', backorderId };
  };

  // Customer Invoice based ONLY on delivered & uninvoiced quantity
  const createCustomerInvoiceFromDelivery = (deliveryId: string, qtyToBill?: number) => {
    const delivery = deliveryOrders.find((d) => d.delivery_id === deliveryId);
    if (!delivery || delivery.status !== 'done') {
      logAudit(
        'CREATE_INVOICE',
        'INVOICING',
        deliveryId,
        `Ditolak: Faktur hanya boleh terbit untuk pengiriman tervalidasi.`,
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

    // Check if user tries to bill more than delivered
    if (billQty > delivered) {
      logAudit(
        'CREATE_INVOICE',
        'INVOICING',
        deliveryId,
        `Penolakan penagihan melebihi jumlah terkirim. Diminta: ${billQty}, Terkirim: ${delivered}.`,
        'VALIDATION_FAILED'
      );
      addNotification('error', `Validasi Gagal: Kuantitas tagihan (${billQty}) tidak boleh melebihi jumlah yang telah dikirim (${delivered})!`);
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

    logAudit('CREATE_INVOICE', 'INVOICING', invId, `Invoice ${invId} disiapkan untuk ${billQty} unit terkirim (${firstLine.sku}).`, 'SUCCESS');
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
      `Pembayaran Rp${amount.toLocaleString()} diterima untuk ${invoiceId}. Sisa residual: Rp${newResidual.toLocaleString()} (Status: ${newStatus}).`,
      'SUCCESS'
    );

    addNotification(
      'success',
      `Pembayaran Rp${amount.toLocaleString()} dicatat! Sisa piutang: Rp${newResidual.toLocaleString()} (Status: ${newStatus}).`
    );

    return { success: true, message: `Pembayaran ${payId} dicatat.` };
  };

  // Confirm Purchase Order
  const confirmPurchaseOrder = (poId: string) => {
    const po = purchaseOrders.find((p) => p.po_id === poId);
    if (!po) return { success: false, message: 'PO tidak ditemukan.' };

    setPurchaseOrders((prev) =>
      prev.map((p) => (p.po_id === poId ? { ...p, status: 'confirmed', is_locked: true } : p))
    );

    logAudit('CONFIRM_PO', 'PURCHASE', poId, `PO ${poId} confirmed and locked.`, 'SUCCESS');
    addNotification('success', `Purchase Order ${poId} dikonfirmasi!`);
    return { success: true, message: 'PO confirmed.' };
  };

  // Update Draft Purchase Order / RFQ Line Cost or Quantity
  const updatePurchaseOrderLine = (
    poId: string,
    lineId: string,
    updates: { unit_cost?: number; quantity?: number }
  ) => {
    const po = purchaseOrders.find((p) => p.po_id === poId);
    if (!po) return { success: false, message: 'PO tidak ditemukan.' };
    if (po.status === 'confirmed' || po.status === 'done' || po.is_locked) {
      addNotification('error', `PO ${poId} sudah dikonfirmasi dan terkunci.`);
      return { success: false, message: 'PO terkunci.' };
    }

    const updatedLines = po.lines.map((line) => {
      if (line.id !== lineId) return line;
      const unitCost = Math.max(0, updates.unit_cost ?? line.unit_cost);
      const quantity = Math.max(1, updates.quantity ?? line.quantity);
      const subtotal = Math.round(quantity * unitCost);
      const taxAmount = Math.round(subtotal * 0.11);
      const total = subtotal + taxAmount;
      return {
        ...line,
        unit_cost: unitCost,
        quantity,
        tax_amount: taxAmount,
        total,
      };
    });

    const untaxedAmount = updatedLines.reduce((s, l) => s + l.quantity * l.unit_cost, 0);
    const taxAmount = updatedLines.reduce((s, l) => s + l.tax_amount, 0);
    const totalAmount = untaxedAmount + taxAmount;

    setPurchaseOrders((prev) =>
      prev.map((p) =>
        p.po_id === poId
          ? {
              ...p,
              lines: updatedLines,
              untaxed_amount: untaxedAmount,
              tax_amount: taxAmount,
              total_amount: totalAmount,
            }
          : p
      )
    );

    logAudit('UPDATE_PO_PRICE', 'PURCHASE', poId, `Harga beli satuan pada ${poId} diperbarui`, 'SUCCESS');
    addNotification('success', `Harga beli pada ${poId} berhasil diperbarui.`);
    return { success: true, message: 'Harga PO diperbarui.' };
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

    if (rejectedQty > 0 && acceptedQty + rejectedQty > ordered) {
      logAudit(
        'QA_INSPECTION',
        'INVENTORY',
        receiptId,
        `Upaya mengakui unit gagal inspeksi ditolak.`,
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
      `Penerimaan ${receiptId} lolos inspeksi: ${acceptedQty} accepted, ${rejectedQty} rejected. Nilai persediaan +Rp${acceptedValuation.toLocaleString()}.`,
      'SUCCESS'
    );

    addNotification(
      'success',
      `Receipt ${receiptId} divalidasi! ${acceptedQty} unit diterima baik. Nilai persediaan +Rp${acceptedValuation.toLocaleString()}.`
    );

    return { success: true, message: 'Receipt QA divalidasi.' };
  };

  // Vendor Bill with Three-Way Matching
  const createVendorBillFromReceipt = (receiptId: string, qtyToBill?: number) => {
    const receipt = receipts.find((r) => r.receipt_id === receiptId);
    if (!receipt || receipt.status !== 'done') {
      addNotification('error', 'Vendor Bill memerlukan penerimaan barang yang sudah lolos inspeksi!');
      return { success: false, message: 'Receipt belum divalidasi.' };
    }

    const firstLine = receipt.lines[0];
    const accepted = firstLine.accepted;
    const billQty = qtyToBill !== undefined ? qtyToBill : accepted;

    // Three-way match check: PO vs Receipt vs Bill
    if (billQty > accepted) {
      logAudit(
        'CREATE_VENDOR_BILL',
        'ACCOUNTING',
        receiptId,
        `Three-way matching failure: Upaya menagih ${billQty} unit melebihi kuantitas accepted (${accepted}).`,
        'VALIDATION_FAILED'
      );
      addNotification('error', `Three-Way Matching Gagal: Kuantitas tagihan (${billQty}) melebihi barang yang diterima baik (${accepted})!`);
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

    logAudit('CREATE_VENDOR_BILL', 'ACCOUNTING', billId, `Vendor Bill ${billId} dibuat untuk ${billQty} unit (Three-Way Match OK).`, 'SUCCESS');
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

    logAudit('PAY_VENDOR_BILL', 'ACCOUNTING', payId, `Pembayaran utang ${billId} sebesar Rp${amount.toLocaleString()} melalui ${accountCreditName}. Sisa utang: Rp${newResidual.toLocaleString()}.`, 'SUCCESS');
    addNotification('success', `Pembayaran ${billId} berhasil! Utang berkurang Rp${amount.toLocaleString()}.`);
    return { success: true, message: 'Pembayaran vendor berhasil.' };
  };

  // Multi-item Point of Sale Transaction (Odoo POS Register)
  const processPOSCart = ({
    items,
    paymentMethod,
    customerName = 'Pelanggan Walk-In Toko Bandung',
    amountPaid,
  }: {
    items: { sku: string; quantity: number; unitPrice: number; discountPct: number }[];
    paymentMethod: 'cash' | 'bank';
    customerName?: string;
    amountPaid?: number;
  }) => {
    if (!items || items.length === 0) {
      addNotification('warning', 'Keranjang kasir masih kosong.');
      return { success: false, message: 'Keranjang kosong.' };
    }

    // Validate stock in STORE-BDG for every item
    for (const item of items) {
      const storeStock = stock.find((s) => s.sku === item.sku && s.location_id === 'STORE-BDG');
      const availableInStore = storeStock ? storeStock.available : 0;
      if (!storeStock || availableInStore < item.quantity) {
        logAudit(
          'POS_CHECKOUT',
          'POS',
          'POS-ATTEMPT',
          `Insufficient Stock in STORE-BDG for ${item.sku}. Diminta: ${item.quantity}, Tersedia: ${availableInStore}.`,
          'VALIDATION_FAILED'
        );
        addNotification(
          'error',
          `Transaksi Kasir Ditolak: Stok toko tidak mencukupi untuk ${item.sku} (Tersedia: ${availableInStore}, Diminta: ${item.quantity})!`
        );
        return { success: false, message: 'Insufficient Stock' };
      }
    }

    let untaxedAmount = 0;
    let totalTax = 0;
    let totalCogs = 0;
    const posLines: POSTransaction['lines'] = [];
    const newMoves: StockMove[] = [];
    const posId = `POS/2026/${String(posTransactions.length + 1).padStart(4, '0')}`;

    for (const item of items) {
      const product = products.find((p) => p.sku === item.sku);
      if (!product) return { success: false, message: `Produk ${item.sku} tidak ditemukan.` };

      const unitPrice = Math.max(0, item.unitPrice);
      const discountPct = Math.min(100, Math.max(0, item.discountPct));
      const lineSubtotal = Math.round(item.quantity * unitPrice * (1 - discountPct / 100));
      const lineTax = Math.round(lineSubtotal * 0.11);
      const lineTotal = lineSubtotal + lineTax;
      const lineCogs = item.quantity * product.cost_idr;

      untaxedAmount += lineSubtotal;
      totalTax += lineTax;
      totalCogs += lineCogs;

      posLines.push({
        sku: item.sku,
        product_name: product.product_name,
        quantity: item.quantity,
        unit_price: unitPrice,
        discount_pct: discountPct,
        subtotal: lineSubtotal,
        tax_amount: lineTax,
        line_total: lineTotal,
      });

      newMoves.push({
        move_id: `MOVE-${Date.now().toString().slice(-6)}-${item.sku.slice(-2)}`,
        date: new Date().toISOString().substring(0, 10),
        sku: item.sku,
        from_location: 'STORE-BDG',
        to_location: customerName,
        quantity: item.quantity,
        unit_cost: product.cost_idr,
        total_value: lineCogs,
        reference_doc: posId,
        created_by: currentUser?.name || 'Cashier',
      });
    }

    const totalAmount = untaxedAmount + totalTax;
    const effectivePaid = amountPaid !== undefined ? Math.max(totalAmount, amountPaid) : totalAmount;
    const change = Math.max(0, effectivePaid - totalAmount);

    // 1. Deduct STORE-BDG physical stock for all purchased SKUs
    setStock((prev) =>
      prev.map((s) => {
        if (s.location_id !== 'STORE-BDG') return s;
        const qtySold = items
          .filter((i) => i.sku === s.sku)
          .reduce((sum, i) => sum + i.quantity, 0);
        if (qtySold === 0) return s;
        return {
          ...s,
          on_hand: s.on_hand - qtySold,
          available: s.available - qtySold,
        };
      })
    );

    // 2. Stock Moves
    setStockMoves((prev) => [...newMoves, ...prev]);

    // 3. Balanced Journal (Dr Cash/Bank, Dr HPP / Cr Sales, Cr PPN Keluaran, Cr Persediaan)
    const journalId = `JRN/${new Date().getFullYear()}/${String(journalEntries.length + 1).padStart(4, '0')}`;
    const accountPaymentCode = paymentMethod === 'bank' ? '1010' : '1000';
    const accountPaymentName = paymentMethod === 'bank' ? 'Bank' : 'Kas';
    const totalUnits = items.reduce((s, i) => s + i.quantity, 0);

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
          label: `HPP Penjualan POS ${totalUnits} unit`,
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
          credit: totalTax,
        },
        {
          account_code: '1200',
          account_name: 'Persediaan Barang Dagang',
          label: `Pengurangan Stok Toko ${totalUnits} unit`,
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
      customer_name: customerName,
      location_id: 'STORE-BDG',
      lines: posLines,
      untaxed_amount: untaxedAmount,
      tax_amount: totalTax,
      total_amount: totalAmount,
      payment_method: paymentMethod,
      amount_paid: effectivePaid,
      change,
      journal_id: journalId,
      status: 'completed',
    };
    setPosTransactions((prev) => [posRecord, ...prev]);

    logAudit(
      'POS_CHECKOUT',
      'POS',
      posId,
      `Penjualan POS ${posId} berhasil (${totalUnits} unit, ${items.length} item). Net Rp${untaxedAmount.toLocaleString()}, PPN Rp${totalTax.toLocaleString()}, Total Rp${totalAmount.toLocaleString()}.`,
      'SUCCESS'
    );

    addNotification(
      'success',
      `Penjualan POS ${posId} berhasil! Struk Rp${totalAmount.toLocaleString()} diterbitkan.`
    );

    return { success: true, message: 'POS Sale Completed', receipt: posRecord };
  };

  // Single-item Point of Sale helper
  const processPOSSale = (sku: string, qty: number, paymentMethod: 'cash' | 'bank', overrideUnitPrice?: number) => {
    const product = products.find((p) => p.sku === sku);
    return processPOSCart({
      items: [
        {
          sku,
          quantity: qty,
          unitPrice: overrideUnitPrice !== undefined ? overrideUnitPrice : product?.sales_price_idr || 0,
          discountPct: 0,
        },
      ],
      paymentMethod,
    });
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
      `Retur ${retId} diperiksa: ${acceptedQty} unit diterima layak stok, ${rejectedQty} unit rejected. Stok WH bertambah & HPP Rp${cogsReversal.toLocaleString()} dibalik.`,
      'SUCCESS'
    );

    addNotification('success', `Retur ${retId} diinspeksi! ${acceptedQty} unit kembali ke stok layak.`);
    return { success: true, message: 'Retur diinspeksi.', returnId: retId };
  };

  // Issue Credit Note for Validated Return
  const issueCreditNoteForReturn = (returnId: string, requestedQty?: number) => {
    const retDoc = returns.find((r) => r.return_id === returnId);
    if (!retDoc) return { success: false, message: 'Dokumen retur tidak ditemukan.' };

    const maxCreditable = retDoc.accepted_qty; // only physically accepted units can be credited!
    const qty = requestedQty !== undefined ? requestedQty : maxCreditable;

    // Cannot issue credit note for more than validated physical accepted units
    if (qty > maxCreditable) {
      logAudit(
        'ISSUE_CREDIT_NOTE',
        'ACCOUNTING',
        returnId,
        `Penolakan Credit Note: Kuantitas ${qty} melebihi barang retur fisik tervalidasi (${maxCreditable}).`,
        'VALIDATION_FAILED'
      );
      addNotification('error', `Validasi Gagal: Credit Note (${qty} unit) melebihi kuantitas retur yang diterima baik (${maxCreditable} unit)!`);
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
      `Credit Note ${cnId} sebesar Rp${totalCredit.toLocaleString()} diterbitkan untuk ${qty} unit ${retDoc.sku}. Piutang disesuaikan.`,
      'SUCCESS'
    );

    addNotification(
      'success',
      `Credit Note ${cnId} Rp${totalCredit.toLocaleString()} berhasil diterbitkan! Piutang berkurang.`
    );

    return { success: true, message: `Credit Note ${cnId} diterbitkan.`, cnId };
  };

  // Internal Location Transfer
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
        `Transfer ditolak: Kuantitas ${qty} melebihi stok tersedia (${sourceStock?.available || 0}) di ${fromLoc}.`,
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
      `Transfer ${qty} unit ${sku} dari ${fromLoc} ke ${toLoc}. Total stok dan nilai persediaan perusahaan konstan.`,
      'SUCCESS'
    );

    addNotification(
      'success',
      `Transfer ${transferId} berhasil! ${qty} unit ${sku} dipindahkan ke ${toLoc}.`
    );

    return { success: true, message: 'Transfer selesai.' };
  };

  // Simpan perubahan state ke Supabase (hanya modul yang berubah).
  useEffect(() => {
    if (!isHydrated || !currentUser) return;

    const save = async () => {
      try {
        await saveERPState(
          {
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
          },
          currentUser.id,
          currentUser.role
        );
      } catch (error) {
        console.error('Supabase save failed:', error);
      }
    };

    void save();
  }, [
    isHydrated,
    currentUser,
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
  ]);

  return (
    <ERPContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        activeApp,
        setActiveApp,
        activeView,
        setActiveView,
        appSwitcherOpen,
        setAppSwitcherOpen,
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
        notifications,
        addNotification,
        removeNotification,
        checkRoleAccess,
        logAudit,
        resetToBaselineSeed,
        createCustomer,
        createProductVariant,
        updateProductPrice,
        createLead,
        updateLeadStage,
        updateLeadDetails,
        addLeadNote,
        convertLeadToOpportunity,
        convertOpportunityToQuotation,
        createQuotation,
        updateSalesOrderLine,
        confirmSalesOrder,
        createDeliveryOrderForSO,
        validateDeliveryOrder,
        createCustomerInvoiceFromDelivery,
        postCustomerInvoice,
        registerCustomerPayment,
        confirmPurchaseOrder,
        updatePurchaseOrderLine,
        createReceiptFromPO,
        validateReceiptWithQA,
        createVendorBillFromReceipt,
        postVendorBill,
        registerVendorPayment,
        processPOSSale,
        processPOSCart,
        processCustomerReturn,
        issueCreditNoteForReturn,
        executeInternalTransfer,
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
