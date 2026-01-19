import { redirect } from 'next/navigation';

export default function AdminRoot() {
  // Automatically send admin to the approvals page
  redirect('/admin/approvals');
}