// Página inicial — redireciona para o dashboard ou login
import { redirect } from 'next/navigation';

export default function Home() {
  redirect('/login');
}
