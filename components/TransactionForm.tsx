"use client";
import { useState } from 'react';
import { createTransaction } from '../app/actions';

export default function TransactionForm() {
  const [label, setLabel] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('expense');
  
  // NOUVEAU : États pour la catégorie et la date
  const [category, setCategory] = useState('Alimentation');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]); // Date du jour par défaut
  const [loading, setLoading] = useState(false);

  // Listes de catégories selon le type
  const expenseCategories = ['Alimentation', 'Logement', 'Transports', 'Loisirs', 'Santé', 'Shopping', 'Autre'];
  const incomeCategories = ['Salaire', 'Remboursement', 'Cadeau', 'Autre'];
  const currentCategories = type === 'expense' ? expenseCategories : incomeCategories;

  // Change la catégorie par défaut quand on bascule entre dépense et revenu
  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newType = e.target.value;
    setType(newType);
    setCategory(newType === 'expense' ? 'Alimentation' : 'Salaire');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!label || !amount || !date || !category) return;

    setLoading(true);

    // On envoie maintenant les 5 informations exigées par la base de données
    await createTransaction({
      label,
      amount: parseFloat(amount),
      type,
      category,
      date: new Date(date) // Transforme la chaîne du calendrier HTML en vrai objet Date
    });

    // On vide le formulaire une fois terminé (sauf la date qu'on peut garder)
    setLabel('');
    setAmount('');
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-8">
      <h2 className="text-xl font-semibold text-slate-800 mb-4">Ajouter une transaction</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <input
          type="text"
          placeholder="Libellé (ex: Monoprix)"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          className="lg:col-span-2 p-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 text-slate-900 bg-white placeholder-slate-400"
          required
        />
        
        <input
          type="number"
          step="0.01"
          placeholder="Montant (€)"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="p-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 text-slate-900 bg-white placeholder-slate-400"
          required
        />

        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="p-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 text-slate-900 bg-white"
          required
        />

        <select
          value={type}
          onChange={handleTypeChange}
          className="p-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 text-slate-900 bg-white"
        >
          <option value="expense">Dépense</option>
          <option value="income">Revenu</option>
        </select>

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="p-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 text-slate-900 bg-white"
        >
          {currentCategories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        
        <button
          type="submit"
          disabled={loading}
          className="lg:col-span-6 mt-2 bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:bg-indigo-400"
        >
          {loading ? 'Ajout...' : 'Ajouter'}
        </button>
      </div>
    </form>
  );
}