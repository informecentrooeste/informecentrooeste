import { AdminLayout } from "@/components/layout/AdminLayout";
import { useState } from "react";
import { Download, CheckCircle, AlertCircle, Loader2, Globe } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getAuthHeaders as getAuth } from "@/hooks/use-auth";

const API_BASE = import.meta.env.BASE_URL.replace(/\/$/, "") + "/api";

function getAuthHeaders() {
  return { "Content-Type": "application/json", ...getAuth() };
}

async function apiFetch(path: string, opts?: RequestInit) {
  const res = await fetch(`${API_BASE}${path}`, { ...opts, headers: { ...getAuthHeaders(), ...opts?.headers } });
  if (!res.ok) { const err = await res.json().catch(() => ({})); throw new Error(err.error || "Request failed"); }
  return res.json();
}

export default function WpImportAdmin() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [importing, setImporting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [log, setLog] = useState<any[]>([]);
  const [totalImported, setTotalImported] = useState(0);
  const [totalSkipped, setTotalSkipped] = useState(0);
  const [totalErrors, setTotalErrors] = useState(0);
  const [autoImport, setAutoImport] = useState(false);

  const { data: status, refetch: refetchStatus } = useQuery({
    queryKey: ["/api/admin/wp-import/status"],
    queryFn: () => apiFetch("/admin/wp-import/status"),
  });

  const importPage = async (page: number) => {
    try {
      const result = await apiFetch("/admin/wp-import/import", {
        method: "POST",
        body: JSON.stringify({ page, perPage }),
      });

      setTotalImported(prev => prev + (result.imported || 0));
      setTotalSkipped(prev => prev + (result.skipped || 0));
      setTotalErrors(prev => prev + (result.errors || 0));

      setLog(prev => [
        { page, imported: result.imported, skipped: result.skipped, errors: result.errors, time: new Date().toLocaleTimeString() },
        ...prev,
      ]);

      return result;
    } catch (e: any) {
      setLog(prev => [
        { page, error: e.message, time: new Date().toLocaleTimeString() },
        ...prev,
      ]);
      throw e;
    }
  };

  const handleImportPage = async () => {
    setImporting(true);
    try {
      const result = await importPage(currentPage);
      if (result.hasMore) setCurrentPage(prev => prev + 1);
      toast({ title: `Página ${currentPage} importada`, description: `${result.imported} importados, ${result.skipped} já existiam` });
      refetchStatus();
    } catch (e: any) {
      toast({ title: "Erro na importação", description: e.message, variant: "destructive" });
    } finally {
      setImporting(false);
    }
  };

  const handleAutoImport = async () => {
    setAutoImport(true);
    setImporting(true);
    let page = currentPage;
    let hasMore = true;

    try {
      while (hasMore && page <= currentPage + 49) {
        const result = await importPage(page);
        hasMore = result.hasMore;
        page++;
        setCurrentPage(page);
        await new Promise(r => setTimeout(r, 500));
      }
      toast({ title: "Importação concluída!", description: `Total: ${totalImported} importados` });
    } catch (e: any) {
      toast({ title: "Importação interrompida", description: e.message, variant: "destructive" });
    } finally {
      setImporting(false);
      setAutoImport(false);
      refetchStatus();
      qc.invalidateQueries({ queryKey: ["/api/public"] });
    }
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Globe className="h-7 w-7 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Importar do WordPress</h1>
            <p className="text-sm text-gray-500">informecentrooeste.com.br</p>
          </div>
        </div>
      </div>

      {status && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl border p-4">
            <p className="text-sm text-gray-500">Total no WordPress</p>
            <p className="text-2xl font-bold text-gray-900">{status.totalPosts?.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-xl border p-4">
            <p className="text-sm text-gray-500">Já importados</p>
            <p className="text-2xl font-bold text-green-600">{status.importedCount?.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-xl border p-4">
            <p className="text-sm text-gray-500">Disponíveis</p>
            <p className="text-2xl font-bold text-blue-600">{status.available?.toLocaleString()}</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border p-6 mb-6">
        <h2 className="text-lg font-bold mb-4">Configuração</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Página atual</label>
            <input
              type="number"
              min={1}
              className="w-full border rounded-lg px-3 py-2 text-sm"
              value={currentPage}
              onChange={e => setCurrentPage(Number(e.target.value))}
              disabled={importing}
            />
            <p className="text-xs text-gray-500 mt-1">Página 1 = posts mais recentes</p>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Posts por página</label>
            <select
              className="w-full border rounded-lg px-3 py-2 text-sm"
              value={perPage}
              onChange={e => setPerPage(Number(e.target.value))}
              disabled={importing}
            >
              <option value={10}>10 posts</option>
              <option value={20}>20 posts</option>
              <option value={50}>50 posts</option>
              <option value={100}>100 posts</option>
            </select>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleImportPage}
            disabled={importing}
            className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            {importing && !autoImport ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            Importar Página {currentPage}
          </button>
          <button
            onClick={handleAutoImport}
            disabled={importing}
            className="bg-green-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
          >
            {autoImport ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            Importar Tudo (50 páginas)
          </button>
        </div>
      </div>

      {(totalImported > 0 || totalSkipped > 0 || totalErrors > 0) && (
        <div className="bg-white rounded-xl border p-4 mb-6">
          <h3 className="font-bold text-sm mb-2">Resumo desta sessão</h3>
          <div className="flex gap-6 text-sm">
            <span className="text-green-600 font-semibold flex items-center gap-1"><CheckCircle className="h-4 w-4" /> {totalImported} importados</span>
            <span className="text-gray-500">{totalSkipped} já existiam</span>
            {totalErrors > 0 && <span className="text-red-500 font-semibold flex items-center gap-1"><AlertCircle className="h-4 w-4" /> {totalErrors} erros</span>}
          </div>
        </div>
      )}

      {log.length > 0 && (
        <div className="bg-white rounded-xl border overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 border-b">
            <h3 className="font-bold text-sm">Log de importação</h3>
          </div>
          <div className="max-h-[400px] overflow-y-auto">
            {log.map((entry, i) => (
              <div key={i} className="px-4 py-2 border-b border-gray-50 text-sm flex items-center gap-3">
                <span className="text-gray-400 text-xs w-20">{entry.time}</span>
                <span className="font-medium">Pág. {entry.page}</span>
                {entry.error ? (
                  <span className="text-red-500">{entry.error}</span>
                ) : (
                  <>
                    <span className="text-green-600">{entry.imported} importados</span>
                    <span className="text-gray-400">{entry.skipped} já existiam</span>
                    {entry.errors > 0 && <span className="text-red-500">{entry.errors} erros</span>}
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
