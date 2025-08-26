/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
import { isAdmin } from "@/app/lib/authz";
import AdminSoapstones from "./ui";

export default async function AdminSoapstonesPage() {
  if (!(await isAdmin())) return <div className="p-6">Access denied. Admin role required.</div>;
  return <AdminSoapstones />;
}
