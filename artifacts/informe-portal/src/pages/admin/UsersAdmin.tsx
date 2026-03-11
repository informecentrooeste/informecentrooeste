import { AdminLayout } from "@/components/layout/AdminLayout";
import { useAdminUsers, useCreateUser, useUpdateUser, useToggleUserStatus } from "@/hooks/use-admin";
import { useState } from "react";
import { Plus, Pencil, ToggleLeft, ToggleRight, Shield, UserIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const ROLES = [
  { value: "ADMIN", label: "Administrador", color: "bg-red-100 text-red-700" },
  { value: "EDITOR", label: "Editor", color: "bg-blue-100 text-blue-700" },
  { value: "AUTHOR", label: "Autor", color: "bg-green-100 text-green-700" },
] as const;

type UserForm = {
  name: string;
  email: string;
  password: string;
  role: string;
};

const emptyForm: UserForm = { name: "", email: "", password: "", role: "AUTHOR" };

export default function UsersAdmin() {
  const { data: usersData, isLoading, isError } = useAdminUsers();
  const createMut = useCreateUser();
  const updateMut = useUpdateUser();
  const toggleMut = useToggleUserStatus();
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<UserForm>(emptyForm);

  const users = (usersData as any)?.data || usersData || [];

  const openNew = () => { setForm(emptyForm); setEditId(null); setShowForm(true); };
  const openEdit = (u: any) => {
    setForm({ name: u.name, email: u.email, password: "", role: u.role });
    setEditId(u.id);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editId) {
        const payload: any = { name: form.name, email: form.email, role: form.role };
        await updateMut.mutateAsync({ id: editId, data: payload });
        toast({ title: "Usuário atualizado!" });
      } else {
        if (form.password.length < 8) { toast({ title: "Senha deve ter no mínimo 8 caracteres", variant: "destructive" }); return; }
        await createMut.mutateAsync({ data: { name: form.name, email: form.email, password: form.password, role: form.role as any } });
        toast({ title: "Usuário criado!" });
      }
      setShowForm(false);
    } catch {
      toast({ title: "Erro ao salvar usuário", variant: "destructive" });
    }
  };

  const handleToggle = async (id: number, isActive: boolean) => {
    try {
      await toggleMut.mutateAsync({ id, data: { isActive: !isActive } });
    } catch {
      toast({ title: "Erro ao alterar status", variant: "destructive" });
    }
  };

  if (isLoading) return <AdminLayout><div className="p-8">Carregando...</div></AdminLayout>;
  if (isError) return <AdminLayout><div className="p-8 bg-white rounded-xl border border-red-200 text-red-600">Erro ao carregar usuários. Tente recarregar a página.</div></AdminLayout>;

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900">Usuários</h1>
          <p className="text-gray-500 text-sm">Gerencie os usuários do sistema.</p>
        </div>
        <button onClick={openNew} className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:opacity-90">
          <Plus className="h-4 w-4" /> Novo Usuário
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <h2 className="text-lg font-bold mb-4">{editId ? "Editar Usuário" : "Novo Usuário"}</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Nome</label>
              <input className="w-full border rounded-lg px-3 py-2 text-sm" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">E-mail</label>
              <input type="email" className="w-full border rounded-lg px-3 py-2 text-sm" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
            </div>
            {!editId && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Senha</label>
                <input type="password" className="w-full border rounded-lg px-3 py-2 text-sm" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required minLength={8} />
              </div>
            )}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Perfil</label>
              <select className="w-full border rounded-lg px-3 py-2 text-sm" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </div>
            <div className="md:col-span-2 flex gap-3">
              <button type="submit" disabled={createMut.isPending || updateMut.isPending} className="bg-primary text-white px-6 py-2 rounded-lg text-sm font-bold hover:opacity-90 disabled:opacity-50">Salvar</button>
              <button type="button" onClick={() => setShowForm(false)} className="border px-6 py-2 rounded-lg text-sm font-bold hover:bg-gray-50">Cancelar</button>
            </div>
          </form>
        </div>
      )}

      <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-bold text-gray-600">Nome</th>
              <th className="text-left px-4 py-3 font-bold text-gray-600">E-mail</th>
              <th className="text-left px-4 py-3 font-bold text-gray-600">Perfil</th>
              <th className="text-left px-4 py-3 font-bold text-gray-600">Status</th>
              <th className="text-left px-4 py-3 font-bold text-gray-600">Último Login</th>
              <th className="text-right px-4 py-3 font-bold text-gray-600">Ações</th>
            </tr>
          </thead>
          <tbody>
            {(users as any[])?.map((u: any) => {
              const role = ROLES.find(r => r.value === u.role);
              return (
                <tr key={u.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        {u.role === "ADMIN" ? <Shield className="h-4 w-4 text-primary" /> : <UserIcon className="h-4 w-4 text-primary" />}
                      </div>
                      <span className="font-medium">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{u.email}</td>
                  <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded text-xs font-bold ${role?.color}`}>{role?.label}</span></td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${u.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                      {u.isActive ? "Ativo" : "Inativo"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString("pt-BR") : "Nunca"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => handleToggle(u.id, u.isActive)} className="p-1.5 rounded hover:bg-gray-100">
                        {u.isActive ? <ToggleRight className="h-4 w-4 text-green-600" /> : <ToggleLeft className="h-4 w-4 text-gray-400" />}
                      </button>
                      <button onClick={() => openEdit(u)} className="p-1.5 rounded hover:bg-gray-100"><Pencil className="h-4 w-4 text-gray-500" /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="md:hidden flex flex-col gap-3">
        {(users as any[])?.map((u: any) => {
          const role = ROLES.find(r => r.value === u.role);
          return (
            <div key={u.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    {u.role === "ADMIN" ? <Shield className="h-4 w-4 text-primary" /> : <UserIcon className="h-4 w-4 text-primary" />}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800">{u.name}</h3>
                    <p className="text-xs text-gray-500">{u.email}</p>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded text-xs font-bold ${role?.color}`}>{role?.label}</span>
              </div>
              <div className="flex gap-2 mt-3">
                <button onClick={() => handleToggle(u.id, u.isActive)} className="text-xs border px-3 py-1 rounded font-semibold hover:bg-gray-50">
                  {u.isActive ? "Desativar" : "Ativar"}
                </button>
                <button onClick={() => openEdit(u)} className="text-xs border px-3 py-1 rounded font-semibold hover:bg-gray-50">Editar</button>
              </div>
            </div>
          );
        })}
      </div>
    </AdminLayout>
  );
}
