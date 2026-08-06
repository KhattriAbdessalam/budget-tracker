"use client"

import { useRef } from 'react'
import { addRecurringTransaction } from '@/app/actions'

export default function RecurringForm() {
  const formRef = useRef<HTMLFormElement>(null)

  const handleSubmit = async (formData: FormData) => {
    const result = await addRecurringTransaction(formData)
    if (result?.success) {
      formRef.current?.reset() // On vide le formulaire après succès
      alert('Transaction récurrente ajoutée !')
    }
  }

  return (
    <form ref={formRef} action={handleSubmit} className="max-w-md p-6 bg-white rounded-lg shadow-md space-y-4 text-gray-800">
      <h2 className="text-xl font-bold mb-4">Nouvelle transaction récurrente</h2>

      <div>
        <label className="block text-sm font-medium mb-1">Description (ex: Box Internet, Salaire)</label>
        <input type="text" name="description" required className="w-full border p-2 rounded" />
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium mb-1">Montant</label>
          <input type="number" name="amount" step="0.01" required className="w-full border p-2 rounded" />
        </div>
        
        <div className="flex-1">
          <label className="block text-sm font-medium mb-1">Type</label>
          <select name="type" className="w-full border p-2 rounded">
            <option value="EXPENSE">Prélèvement</option>
            <option value="INCOME">Revenu</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Jour du mois (1 - 31)</label>
        <input type="number" name="dayOfMonth" min="1" max="31" required className="w-full border p-2 rounded" />
      </div>

      <button type="submit" className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded hover:bg-blue-700 transition">
        Enregistrer
      </button>
    </form>
  )
}