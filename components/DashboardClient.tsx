"use client";
import { useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Trash2, Pencil, X } from 'lucide-react'; // Ajout de Pencil et X
import TransactionForm from './TransactionForm';
import { deleteTransaction, updateTransaction } from '../app/actions'; // Ajout de updateTransaction

const COLORS = ['#6366f1', '#10b981', '#f43f5e', '#f59e0b', '#8b5cf6', '#0ea5e9', '#64748b'];

export default function DashboardClient({ initialTransactions }: { initialTransactions: any[] }) {
  const [timeFilter, setTimeFilter] = useState('month');
  
  // --- ÉTATS POUR LA POP-UP D'ÉDITION ---
  const [editingTransaction, setEditingTransaction] = useState<any | null>(null);
  const [editLabel, setEditLabel] = useState('');
  const [editAmount, setEditAmount] = useState('');
  const [editType, setEditType] = useState('expense');
  const [editCategory, setEditCategory] = useState('');
  const [editDate, setEditDate] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const expenseCategories = ['Alimentation', 'Logement', 'Transports', 'Loisirs', 'Santé', 'Shopping', 'Autre'];
  const incomeCategories = ['Salaire', 'Remboursement', 'Cadeau', 'Autre'];
  const currentEditCategories = editType === 'expense' ? expenseCategories : incomeCategories;

  // Fonction pour ouvrir la pop-up et pré-remplir les champs
  const openEditModal = (transaction: any) => {
    setEditingTransaction(transaction);
    setEditLabel(transaction.label);
    setEditAmount(transaction.amount.toString());
    setEditType(transaction.type);
    setEditCategory(transaction.category);
    // Formatage de la date pour le champ input type="date"
    setEditDate(new Date(transaction.date).toISOString().split('T')[0]);
  };

  // Fonction pour valider la modification
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTransaction) return;

    setIsUpdating(true);
    await updateTransaction(editingTransaction.id, {
      label: editLabel,
      amount: parseFloat(editAmount),
      type: editType,
      category: editCategory,
      date: new Date(editDate)
    });
    
    setIsUpdating(false);
    setEditingTransaction(null); // Ferme la pop-up
  };

  const filteredTransactions = initialTransactions.filter((t) => {
    const tDate = new Date(t.date);
    const now = new Date();
    if (timeFilter === 'month') return tDate.getMonth() === now.getMonth() && tDate.getFullYear() === now.getFullYear();
    if (timeFilter === '6months') {
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(now.getMonth() - 6);
      return tDate >= sixMonthsAgo;
    }
    if (timeFilter === 'year') return tDate.getFullYear() === now.getFullYear();
    return true;
  });

  const totalIncomes = filteredTransactions.filter((t) => t.type === 'income').reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpenses = filteredTransactions.filter((t) => t.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0);
  const balance = totalIncomes - totalExpenses;

  const expensesByCategory = filteredTransactions
    .filter((t) => t.type === 'expense')
    .reduce((acc: any, curr: any) => {
      acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
      return acc;
    }, {});

  const pieData = Object.keys(expensesByCategory)
    .map((key) => ({ name: key, value: expensesByCategory[key] }))
    .sort((a, b) => b.value - a.value);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount);
  };

  return (
    <div className="max-w-6xl mx-auto relative">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-slate-800">Tableau de Bord 💸</h1>
        <div className="flex bg-white rounded-lg p-1 shadow-sm border border-slate-200">
          <button onClick={() => setTimeFilter('month')} className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${timeFilter === 'month' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}>Ce mois</button>
          <button onClick={() => setTimeFilter('6months')} className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${timeFilter === '6months' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}>6 mois</button>
          <button onClick={() => setTimeFilter('year')} className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${timeFilter === 'year' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}>Cette année</button>
          <button onClick={() => setTimeFilter('all')} className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${timeFilter === 'all' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}>Tout</button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="p-6 bg-white rounded-2xl shadow-sm border border-slate-100">
          <h2 className="text-sm font-medium text-slate-500 mb-2">Solde sur la période</h2>
          <p className={`text-3xl font-bold ${balance >= 0 ? 'text-indigo-600' : 'text-rose-600'}`}>{formatCurrency(balance)}</p>
        </div>
        <div className="p-6 bg-white rounded-2xl shadow-sm border border-slate-100">
          <h2 className="text-sm font-medium text-slate-500 mb-2">Revenus</h2>
          <p className="text-2xl font-bold text-emerald-500">+ {formatCurrency(totalIncomes)}</p>
        </div>
        <div className="p-6 bg-white rounded-2xl shadow-sm border border-slate-100">
          <h2 className="text-sm font-medium text-slate-500 mb-2">Dépenses</h2>
          <p className="text-2xl font-bold text-rose-500">- {formatCurrency(totalExpenses)}</p>
        </div>
      </div>

      <TransactionForm />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <h2 className="text-xl font-semibold text-slate-800 mb-6">Répartition des dépenses</h2>
          {pieData.length === 0 ? (
            <div className="h-[300px] flex items-center justify-center text-slate-400 italic text-sm">Aucune dépense sur cette période</div>
          ) : (
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={5} dataKey="value">
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => formatCurrency(value)} />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <h2 className="text-xl font-semibold text-slate-800 mb-4">Historique</h2>
          {filteredTransactions.length === 0 ? (
            <p className="text-slate-500 text-sm italic">Aucune transaction pour le moment.</p>
          ) : (
            <ul className="divide-y divide-slate-100 max-h-[400px] overflow-y-auto pr-2">
              {filteredTransactions.map((transaction: any) => (
                <li key={transaction.id} className="py-4 flex justify-between items-center group">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-full ${transaction.type === 'income' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                      {transaction.category.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-slate-800">{transaction.label}</p>
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <span>{new Date(transaction.date).toLocaleDateString('fr-FR')}</span>
                        <span>•</span>
                        <span>{transaction.category}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <span className={`font-bold ${transaction.type === 'income' ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {transaction.type === 'income' ? '+' : '-'} {formatCurrency(transaction.amount)}
                    </span>
                    
                    {/* Boutons d'édition et suppression */}
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => openEditModal(transaction)}
                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="Modifier"
                      >
                        <Pencil size={18} />
                      </button>
                      <button 
                        onClick={async () => {
                          if (window.confirm('Es-tu sûr de vouloir supprimer cette transaction ?')) {
                            await deleteTransaction(transaction.id);
                          }
                        }}
                        className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* --- LA FENÊTRE POP-UP (MODAL) --- */}
      {editingTransaction && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <h2 className="text-xl font-semibold text-slate-800">Modifier la transaction</h2>
              <button onClick={() => setEditingTransaction(null)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleUpdate} className="p-6 flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Libellé</label>
                <input type="text" value={editLabel} onChange={(e) => setEditLabel(e.target.value)} required className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 text-slate-900 bg-white" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Montant (€)</label>
                  <input type="number" step="0.01" value={editAmount} onChange={(e) => setEditAmount(e.target.value)} required className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 text-slate-900 bg-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                  <input type="date" value={editDate} onChange={(e) => setEditDate(e.target.value)} required className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 text-slate-900 bg-white" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                  <select value={editType} onChange={(e) => { setEditType(e.target.value); setEditCategory(e.target.value === 'expense' ? 'Alimentation' : 'Salaire'); }} className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 text-slate-900 bg-white">
                    <option value="expense">Dépense</option>
                    <option value="income">Revenu</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Catégorie</label>
                  <select value={editCategory} onChange={(e) => setEditCategory(e.target.value)} className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 text-slate-900 bg-white">
                    {currentEditCategories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div className="mt-4 flex gap-3 justify-end">
                <button type="button" onClick={() => setEditingTransaction(null)} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-50 rounded-lg transition-colors">Annuler</button>
                <button type="submit" disabled={isUpdating} className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:bg-indigo-400">
                  {isUpdating ? 'Mise à jour...' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}