import { redirect } from 'next/navigation';

export default function Home() {
  // Redirect to signup as the landing page
  redirect('/signup');
}
