import { AdminLayout } from "@/components/layout/AdminLayout";
import { useAdminAuditLogs } from "@/hooks/use-admin";
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Activity } from "lucide-react";

const ACTION_COLORS: Record<string, string> = {
  CREATE: "bg-green-100 text-green-700",
  UPDATE: "bg-blue-100 text-blue-700",
  DELETE: "bg-red-100 text-red-700",
  LOGIN: "bg-purple-100 text-purple-700",
  PUBLISH: "bg-emerald-100 text-emerald-700",
  ARCHIVE: "bg-yellow-100 text-yellow-700",
};

export default function AuditAdmin() {
  const [page, setPage] = useState(1);
  const { data: logsData, isLoading, isError } = useAdminAuditLogs({ page, limit: 20 });

  const logs = (logsData as any)?.data || [];
  const total = (logsData as any)?.total || 0;
  const totalPages = (logsData as any)?.totalPages || 1;

  const safeDate = (dateStr: string) => {
    try { return formatDistanceToNow(new Date(dateStr), { addSuffix: true, locale: ptBR }); }
    catch { return "data inválida"; }
  };

  if (isLoading) return <AdminLayout><div className="p-8">Carregando...</div></AdminLayout>;
  if (isError) return <AdminLayout><div className="p-8 bg-white rounded-xl border border-red-200 text-red-600">Erro ao carregar logs. Tente recarregar a página.</div></AdminLayout>;

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900">Logs de Auditoria</h1>
        <p className="text-gray-500 text-sm">{total} registros de atividade no sistema.</p>
      </div>

      <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-bold text-gray-600">Ação</th>
              <th className="text-left px-4 py-3 font-bold text-gray-600">Entidade</th>
              <th className="text-left px-4 py-3 font-bold text-gray-600">Usuário</th>
              <th className="text-left px-4 py-3 font-bold text-gray-600">Data</th>
              <th className="text-left px-4 py-3 font-bold text-gray-600">Detalhes</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log: any) => (
              <tr key={log.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded text-xs font-bold ${ACTION_COLORS[log.action] || "bg-gray-100 text-gray-700"}`}>
                    {log.action}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="font-medium">{log.entityType}</span>
                  {log.entityId && <span className="text-gray-400 ml-1">#{log.entityId}</span>}
                </td>
                <td className="px-4 py-3 text-gray-600">{log.user?.name || "Sistema"}</td>
                <td className="px-4 py-3 text-xs text-gray-500">
                  {safeDate(log.createdAt)}
                </td>
                <td className="px-4 py-3 text-xs text-gray-400 max-w-[200px] truncate">
                  {log.metadata ? JSON.stringify(log.metadata) : "—"}
                </td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">Nenhum log encontrado.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="md:hidden flex flex-col gap-3">
        {logs.map((log: any) => (
          <div key={log.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex justify-between items-start mb-2">
              <span className={`px-2 py-0.5 rounded text-xs font-bold ${ACTION_COLORS[log.action] || "bg-gray-100 text-gray-700"}`}>
                {log.action}
              </span>
              <span className="text-xs text-gray-400">
                {safeDate(log.createdAt)}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <Activity className="h-3 w-3 text-gray-400" />
              <span className="text-sm font-medium">{log.entityType}</span>
              {log.entityId && <span className="text-xs text-gray-400">#{log.entityId}</span>}
            </div>
            <p className="text-xs text-gray-500 mt-1">{log.user?.name || "Sistema"}</p>
          </div>
        ))}
        {logs.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center text-gray-400 text-sm">
            Nenhum log encontrado.
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-6">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-2 rounded-lg border hover:bg-gray-50 disabled:opacity-30"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-sm text-gray-600 font-medium">
            Página {page} de {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="p-2 rounded-lg border hover:bg-gray-50 disabled:opacity-30"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </AdminLayout>
  );
}
