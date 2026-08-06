"use server";

import { prisma } from '../lib/prisma';
import { revalidatePath } from 'next/cache';

export async function getTransactions() {
  return await prisma.transaction.findMany({
    orderBy: {
      date: 'desc', // On trie désormais par la date réelle de la transaction, pas par la date de création
    },
  });
}

// On ajoute category et date dans les données attendues
export async function createTransaction(data: { 
  label: string; 
  amount: number; 
  type: string; 
  category: string; 
  date: Date 
}) {
  await prisma.transaction.create({
    data: {
      label: data.label,
      amount: data.amount,
      type: data.type,
      category: data.category,
      date: data.date,
    },
  });
  
  revalidatePath('/');
}

// Fonction pour supprimer une transaction
export async function deleteTransaction(id: string) {
  await prisma.transaction.delete({
    where: { 
      id: id 
    },
  });
  
  // On rafraîchit l'affichage après la suppression
  revalidatePath('/');
}

// Fonction pour modifier une transaction existante
export async function updateTransaction(
  id: string, 
  data: { label: string; amount: number; type: string; category: string; date: Date }
) {
  await prisma.transaction.update({
    where: { 
      id: id 
    },
    data: {
      label: data.label,
      amount: data.amount,
      type: data.type,
      category: data.category,
      date: data.date,
    },
  });
  
  // On rafraîchit l'affichage après la modification
  revalidatePath('/');
}

// --- NOUVELLE FONCTION : TRANSACTIONS RÉCURRENTES ---

export async function addRecurringTransaction(formData: FormData) {
  const description = formData.get('description') as string;
  const amount = parseFloat(formData.get('amount') as string);
  const type = formData.get('type') as string;
  const dayOfMonth = parseInt(formData.get('dayOfMonth') as string, 10);
  
  // Remplacer par l'ID de l'utilisateur connecté
  const userId = "id-temporaire-utilisateur"; 

  try {
    await prisma.recurringTransaction.create({
      data: {
        description,
        // On rend le montant négatif si c'est un prélèvement, positif si c'est un revenu
        amount: type === 'EXPENSE' ? -Math.abs(amount) : Math.abs(amount),
        type,
        dayOfMonth,
        userId,
      }
    });

    // Rafraîchir la page pour afficher les nouvelles données
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "Erreur lors de l'ajout de la transaction récurrente" };
  }
}