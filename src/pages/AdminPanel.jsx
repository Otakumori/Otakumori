export default function AdminPanel() {
  return (
    <div className="bg-gray-900 p-8 text-white">
      <h2 className="text-xl font-bold">Admin Dashboard</h2>
      <ul className="mt-4 space-y-2">
        <li>
          <a href="/admin/products">Manage Products</a>
        </li>
        <li>
          <a href="/admin/blog">Manage Blog Posts</a>
        </li>
        <li>
          <a href="/admin/users">User Management</a>
        </li>
        <li>
          <a href="/admin/analytics">Analytics Dashboard</a>
        </li>
      </ul>
    </div>
  );
}
