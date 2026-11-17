import { supabase } from './supabaseClient';

type ERPState = Record<string, unknown>;
type ERPModuleRow = { module_name: string; data: unknown };

export type ERPAuditLog = {
  log_id: string;
  timestamp: string;
  user: string;
  role: string;
  action: string;
  module: string;
  document_number: string;
  previous_value?: string;
  new_value?: string;
  description: string;
  result: 'SUCCESS' | 'DENIED' | 'BLOCKED' | 'VALIDATION_FAILED';
};

let lastSavedSnapshot: ERPState | null = null;
let saveQueue: Promise<void> = Promise.resolve();

function cloneState(state: ERPState): ERPState {
  return JSON.parse(JSON.stringify(state)) as ERPState;
}

export async function loadERPState(): Promise<ERPState | null> {
  const { data, error } = await supabase
    .from('erp_module_states')
    .select('module_name, data');

  if (error) {
    console.error('Supabase load error:', error);
    throw error;
  }

  const state: ERPState = {};
  for (const row of (data ?? []) as ERPModuleRow[]) {
    state[row.module_name] = row.data;
  }

  lastSavedSnapshot = cloneState(state);
  return Object.keys(state).length > 0 ? state : null;
}

export async function loadERPAuditLogs(): Promise<ERPAuditLog[]> {
  const { data, error } = await supabase
    .from('erp_audit_logs')
    .select('log_id, timestamp, user, role, action, module, document_number, previous_value, new_value, description, result')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Supabase audit log load error:', error);
    throw error;
  }

  return (data ?? []) as ERPAuditLog[];
}

export async function saveERPAuditLog(
  log: ERPAuditLog,
  userId: string
): Promise<void> {
  const { error } = await supabase.from('erp_audit_logs').insert({
    log_id: log.log_id,
    timestamp: log.timestamp,
    user: log.user,
    role: log.role,
    action: log.action,
    module: log.module,
    document_number: log.document_number || '',
    previous_value: log.previous_value ?? null,
    new_value: log.new_value ?? null,
    description: log.description,
    result: log.result,
    created_by: userId,
  });

  if (error) {
    console.error('Supabase audit log save error:', error);
    throw error;
  }
}

export function saveERPState(
  state: ERPState,
  userId: string,
  userRole?: string
): Promise<void> {
  const snapshot = cloneState(state);

  const task = saveQueue.then(async () => {
    if (!lastSavedSnapshot) {
      throw new Error('ERP belum selesai dimuat. Penyimpanan dibatalkan.');
    }

    const changedModules = Object.keys(snapshot).filter((moduleName) => {
      // Audit log disimpan melalui tabel append-only erp_audit_logs.
      if (moduleName === 'auditLogs') return false;
      // Hasil pengujian hanya boleh ditulis oleh owner.
      if (moduleName === 'testResults' && userRole !== 'owner') return false;
      return JSON.stringify(snapshot[moduleName]) !==
        JSON.stringify(lastSavedSnapshot?.[moduleName]);
    });

    const failedModules: string[] = [];

    for (const moduleName of changedModules) {
      const { error } = await supabase
        .from('erp_module_states')
        .upsert(
          {
            module_name: moduleName,
            data: snapshot[moduleName],
            updated_at: new Date().toISOString(),
            updated_by: userId,
          },
          { onConflict: 'module_name' }
        );

      if (error) {
        console.error(`Gagal menyimpan modul ${moduleName}:`, error);
        failedModules.push(moduleName);
        continue;
      }

      lastSavedSnapshot[moduleName] = snapshot[moduleName];
    }

    if (failedModules.length > 0) {
      throw new Error(`Gagal menyimpan modul: ${failedModules.join(', ')}`);
    }
  });

  saveQueue = task.catch(() => undefined);
  return task;
}
