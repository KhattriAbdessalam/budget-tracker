import DashboardClient from '../components/DashboardClient';
import { getTransactions } from './actions';

export default async function Dashboard() {
  // Le serveur récupère toutes les transactions depuis Supabase
  const transactions = await getTransactions();

  return (
    <main className="p-8 bg-slate-50 min-h-screen font-sans">
      {/* Il passe les données au composant client qui gère les graphiques */}
      <DashboardClient initialTransactions={transactions} />
    </main>
  );
}