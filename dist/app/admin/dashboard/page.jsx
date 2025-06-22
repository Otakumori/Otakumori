'use strict';
'use client';
var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (!desc || ('get' in desc ? !m.__esModule : desc.writable || desc.configurable)) {
          desc = {
            enumerable: true,
            get: function () {
              return m[k];
            },
          };
        }
        Object.defineProperty(o, k2, desc);
      }
    : function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
      });
var __setModuleDefault =
  (this && this.__setModuleDefault) ||
  (Object.create
    ? function (o, v) {
        Object.defineProperty(o, 'default', { enumerable: true, value: v });
      }
    : function (o, v) {
        o['default'] = v;
      });
var __importStar =
  (this && this.__importStar) ||
  (function () {
    var ownKeys = function (o) {
      ownKeys =
        Object.getOwnPropertyNames ||
        function (o) {
          var ar = [];
          for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
          return ar;
        };
      return ownKeys(o);
    };
    return function (mod) {
      if (mod && mod.__esModule) return mod;
      var result = {};
      if (mod != null)
        for (var k = ownKeys(mod), i = 0; i < k.length; i++)
          if (k[i] !== 'default') __createBinding(result, mod, k[i]);
      __setModuleDefault(result, mod);
      return result;
    };
  })();
Object.defineProperty(exports, '__esModule', { value: true });
exports.default = AdminDashboard;
const react_1 = __importStar(require('react'));
const card_1 = require('../../components/ui/card');
const button_1 = require('../../components/ui/button');
const input_1 = require('../../components/ui/input');
const badge_1 = require('../../components/ui/badge');
const tabs_1 = require('../../components/ui/tabs');
const lucide_react_1 = require('lucide-react');
// Placeholder data
const users = [
  { id: 1, name: 'Adi', email: 'adi@otakumori.com', role: 'admin', status: 'active' },
  { id: 2, name: 'User1', email: 'user1@email.com', role: 'user', status: 'banned' },
];
const sales = [
  { id: 1, item: 'Petal Pin', amount: 12.99, date: '2024-06-18' },
  { id: 2, item: 'Blossom Hoodie', amount: 49.99, date: '2024-06-17' },
];
const echoes = [
  { id: 1, content: 'I love this site!', user: 'User1', flagged: false },
  { id: 2, content: 'NSFW echo', user: 'User2', flagged: true },
];
const blogPosts = [
  { id: 1, title: 'Welcome to Otaku-mori', date: '2024-06-10', published: true },
  { id: 2, title: 'Sakura Storm Event', date: '2024-06-15', published: false },
];
const shopItems = [
  { id: 1, name: 'Petal Pin', price: 12.99, stock: 100 },
  { id: 2, name: 'Blossom Hoodie', price: 49.99, stock: 20 },
];
// Modal components
function UserModal({ open, onClose, onSave, user }) {
  const [form, setForm] = (0, react_1.useState)(
    user || { name: '', email: '', role: 'user', status: 'active' }
  );
  (0, react_1.useEffect)(() => {
    setForm(user || { name: '', email: '', role: 'user', status: 'active' });
  }, [user, open]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="relative w-full max-w-md rounded-xl border border-pink-400/30 bg-[#2d2233] p-8 shadow-lg">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-xl text-pink-200 hover:text-pink-400"
        >
          ×
        </button>
        <h2 className="font-cormorant-garamond mb-6 text-2xl text-pink-200">
          {user ? 'Edit User' : 'Add User'}
        </h2>
        <form
          onSubmit={e => {
            e.preventDefault();
            onSave(form);
          }}
          className="flex flex-col gap-4"
        >
          <input
            className="rounded bg-pink-400/10 px-2 py-1 text-pink-100"
            placeholder="Name"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            required
          />
          <input
            className="rounded bg-pink-400/10 px-2 py-1 text-pink-100"
            placeholder="Email"
            value={form.email}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            required
            type="email"
          />
          <select
            className="rounded bg-pink-400/10 px-2 py-1 text-pink-100"
            value={form.role}
            onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
          <select
            className="rounded bg-pink-400/10 px-2 py-1 text-pink-100"
            value={form.status}
            onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
          >
            <option value="active">Active</option>
            <option value="banned">Banned</option>
          </select>
          <div className="mt-4 flex gap-2">
            <button
              type="submit"
              className="rounded bg-pink-400/30 px-4 py-2 font-bold text-pink-100 transition hover:bg-pink-400/50"
            >
              Save
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded bg-pink-400/20 px-4 py-2 font-bold text-pink-100 transition hover:bg-pink-400/40"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
function BlogModal({ open, onClose, onSave, post }) {
  const [form, setForm] = (0, react_1.useState)(post || { title: '', date: '', published: false });
  (0, react_1.useEffect)(() => {
    setForm(post || { title: '', date: '', published: false });
  }, [post, open]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="relative w-full max-w-md rounded-xl border border-pink-400/30 bg-[#2d2233] p-8 shadow-lg">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-xl text-pink-200 hover:text-pink-400"
        >
          ×
        </button>
        <h2 className="font-cormorant-garamond mb-6 text-2xl text-pink-200">
          {post ? 'Edit Post' : 'Add Post'}
        </h2>
        <form
          onSubmit={e => {
            e.preventDefault();
            onSave(form);
          }}
          className="flex flex-col gap-4"
        >
          <input
            className="rounded bg-pink-400/10 px-2 py-1 text-pink-100"
            placeholder="Title"
            value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            required
          />
          <input
            className="rounded bg-pink-400/10 px-2 py-1 text-pink-100"
            placeholder="Date"
            value={form.date}
            onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
            required
            type="date"
          />
          <label className="flex items-center gap-2 text-pink-100">
            <input
              type="checkbox"
              checked={form.published}
              onChange={e => setForm(f => ({ ...f, published: e.target.checked }))}
            />{' '}
            Published
          </label>
          <div className="mt-4 flex gap-2">
            <button
              type="submit"
              className="rounded bg-pink-400/30 px-4 py-2 font-bold text-pink-100 transition hover:bg-pink-400/50"
            >
              Save
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded bg-pink-400/20 px-4 py-2 font-bold text-pink-100 transition hover:bg-pink-400/40"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
function ShopModal({ open, onClose, onSave, item }) {
  const [form, setForm] = (0, react_1.useState)(item || { name: '', price: 0, stock: 0 });
  (0, react_1.useEffect)(() => {
    setForm(item || { name: '', price: 0, stock: 0 });
  }, [item, open]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="relative w-full max-w-md rounded-xl border border-pink-400/30 bg-[#2d2233] p-8 shadow-lg">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-xl text-pink-200 hover:text-pink-400"
        >
          ×
        </button>
        <h2 className="font-cormorant-garamond mb-6 text-2xl text-pink-200">
          {item ? 'Edit Item' : 'Add Item'}
        </h2>
        <form
          onSubmit={e => {
            e.preventDefault();
            onSave(form);
          }}
          className="flex flex-col gap-4"
        >
          <input
            className="rounded bg-pink-400/10 px-2 py-1 text-pink-100"
            placeholder="Name"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            required
          />
          <input
            className="rounded bg-pink-400/10 px-2 py-1 text-pink-100"
            placeholder="Price"
            value={form.price}
            onChange={e => setForm(f => ({ ...f, price: parseFloat(e.target.value) }))}
            required
            type="number"
            min={0}
            step={0.01}
          />
          <input
            className="rounded bg-pink-400/10 px-2 py-1 text-pink-100"
            placeholder="Stock"
            value={form.stock}
            onChange={e => setForm(f => ({ ...f, stock: parseInt(e.target.value) }))}
            required
            type="number"
            min={0}
          />
          <div className="mt-4 flex gap-2">
            <button
              type="submit"
              className="rounded bg-pink-400/30 px-4 py-2 font-bold text-pink-100 transition hover:bg-pink-400/50"
            >
              Save
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded bg-pink-400/20 px-4 py-2 font-bold text-pink-100 transition hover:bg-pink-400/40"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
function AdminDashboard() {
  const [selectedTab, setSelectedTab] = (0, react_1.useState)('users');
  const [users, setUsers] = (0, react_1.useState)([]);
  const [products, setProducts] = (0, react_1.useState)([]);
  const [flaggedContent, setFlaggedContent] = (0, react_1.useState)([]);
  const [blogPosts, setBlogPosts] = (0, react_1.useState)([]);
  const [selectedItems, setSelectedItems] = (0, react_1.useState)([]);
  const [searchTerm, setSearchTerm] = (0, react_1.useState)('');
  const [filterStatus, setFilterStatus] = (0, react_1.useState)('all');
  const [loading, setLoading] = (0, react_1.useState)(true);
  // Mock data loading
  (0, react_1.useEffect)(() => {
    const loadData = async () => {
      try {
        // Simulate API calls
        const mockUsers = [
          {
            id: '1',
            username: 'SakuraFan',
            email: 'sakura@example.com',
            role: 'user',
            status: 'active',
            joinDate: '2024-01-15',
            lastActive: '2024-01-21',
          },
          {
            id: '2',
            username: 'OtakuMaster',
            email: 'otaku@example.com',
            role: 'moderator',
            status: 'active',
            joinDate: '2024-01-10',
            lastActive: '2024-01-21',
          },
          {
            id: '3',
            username: 'AnimeLover',
            email: 'anime@example.com',
            role: 'user',
            status: 'banned',
            joinDate: '2024-01-05',
            lastActive: '2024-01-20',
          },
        ];
        const mockProducts = [
          {
            id: '1',
            name: 'Cherry Blossom Hoodie',
            price: 45.99,
            category: 'Clothing',
            stock: 25,
            status: 'active',
            salesCount: 12,
            revenue: 551.88,
          },
          {
            id: '2',
            name: 'Anime Figure',
            price: 89.99,
            category: 'Figures',
            stock: 8,
            status: 'active',
            salesCount: 5,
            revenue: 449.95,
          },
          {
            id: '3',
            name: 'Gaming Mouse Pad',
            price: 29.99,
            category: 'Gaming',
            stock: 0,
            status: 'out_of_stock',
            salesCount: 20,
            revenue: 599.8,
          },
        ];
        const mockFlagged = [
          {
            id: '1',
            type: 'echo',
            content: 'Flagged echo message...',
            authorName: 'SakuraFan',
            reason: 'inappropriate_content',
            status: 'pending',
            severity: 'medium',
            createdAt: '2024-01-21',
          },
          {
            id: '2',
            type: 'comment',
            content: 'Flagged comment...',
            authorName: 'OtakuMaster',
            reason: 'spam',
            status: 'reviewed',
            severity: 'low',
            createdAt: '2024-01-20',
          },
        ];
        const mockBlogs = [
          {
            id: '1',
            title: 'Top Anime of 2024',
            author: 'AdminUser',
            status: 'published',
            publishDate: '2024-01-20',
            views: 1250,
          },
          {
            id: '2',
            title: 'Community Guidelines',
            author: 'ModUser',
            status: 'draft',
            publishDate: '2024-01-19',
            views: 0,
          },
        ];
        setUsers(mockUsers);
        setProducts(mockProducts);
        setFlaggedContent(mockFlagged);
        setBlogPosts(mockBlogs);
        setLoading(false);
      } catch (error) {
        console.error('Error loading data:', error);
        setLoading(false);
      }
    };
    loadData();
  }, []);
  const handleBulkAction = async action => {
    if (selectedItems.length === 0) return;
    try {
      // In real implementation, call API for bulk actions
      console.log(`Performing ${action} on ${selectedItems.length} items:`, selectedItems);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      // Update local state based on action
      switch (action) {
        case 'delete':
          setUsers(users.filter(user => !selectedItems.includes(user.id)));
          break;
        case 'ban':
          setUsers(
            users.map(user =>
              selectedItems.includes(user.id) ? { ...user, status: 'banned' } : user
            )
          );
          break;
        case 'activate':
          setUsers(
            users.map(user =>
              selectedItems.includes(user.id) ? { ...user, status: 'active' } : user
            )
          );
          break;
      }
      setSelectedItems([]);
    } catch (error) {
      console.error('Error performing bulk action:', error);
    }
  };
  const filteredUsers = users.filter(user => {
    const matchesSearch =
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || user.status === filterStatus;
    return matchesSearch && matchesFilter;
  });
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-32 w-32 animate-spin rounded-full border-b-2 border-pink-500"></div>
      </div>
    );
  }
  return (
    <div className="container mx-auto space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
        <div className="flex gap-2">
          <button_1.Button variant="outline">
            <lucide_react_1.TrendingUp className="mr-2 h-4 w-4" />
            Analytics
          </button_1.Button>
          <button_1.Button variant="outline">
            <lucide_react_1.Package className="mr-2 h-4 w-4" />
            Export Data
          </button_1.Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <card_1.Card>
          <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <card_1.CardTitle className="text-sm font-medium">Total Users</card_1.CardTitle>
            <lucide_react_1.Users className="text-muted-foreground h-4 w-4" />
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
            <p className="text-muted-foreground text-xs">
              +{users.filter(u => u.status === 'active').length} active
            </p>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <card_1.CardTitle className="text-sm font-medium">Total Revenue</card_1.CardTitle>
            <lucide_react_1.DollarSign className="text-muted-foreground h-4 w-4" />
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold">
              ${products.reduce((sum, p) => sum + p.revenue, 0).toFixed(2)}
            </div>
            <p className="text-muted-foreground text-xs">{products.length} products</p>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <card_1.CardTitle className="text-sm font-medium">Flagged Content</card_1.CardTitle>
            <lucide_react_1.AlertTriangle className="text-muted-foreground h-4 w-4" />
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold">{flaggedContent.length}</div>
            <p className="text-muted-foreground text-xs">
              {flaggedContent.filter(f => f.status === 'pending').length} pending
            </p>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <card_1.CardTitle className="text-sm font-medium">Blog Posts</card_1.CardTitle>
            <lucide_react_1.FileText className="text-muted-foreground h-4 w-4" />
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold">{blogPosts.length}</div>
            <p className="text-muted-foreground text-xs">
              {blogPosts.filter(b => b.status === 'published').length} published
            </p>
          </card_1.CardContent>
        </card_1.Card>
      </div>

      {/* Main Content Tabs */}
      <tabs_1.Tabs defaultValue="users" className="space-y-4">
        <tabs_1.TabsList>
          <tabs_1.TabsTrigger value="users" className="flex items-center gap-2">
            <lucide_react_1.Users className="h-4 w-4" />
            Users
          </tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="shop" className="flex items-center gap-2">
            <lucide_react_1.ShoppingCart className="h-4 w-4" />
            Shop
          </tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="moderation" className="flex items-center gap-2">
            <lucide_react_1.Shield className="h-4 w-4" />
            Moderation
          </tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="blog" className="flex items-center gap-2">
            <lucide_react_1.FileText className="h-4 w-4" />
            Blog
          </tabs_1.TabsTrigger>
        </tabs_1.TabsList>

        {/* Users Tab */}
        <tabs_1.TabsContent value="users" className="space-y-4">
          <card_1.Card>
            <card_1.CardHeader>
              <div className="flex items-center justify-between">
                <card_1.CardTitle>User Management</card_1.CardTitle>
                <div className="flex gap-2">
                  <button_1.Button variant="outline" size="sm">
                    <lucide_react_1.Edit className="mr-2 h-4 w-4" />
                    Add User
                  </button_1.Button>
                </div>
              </div>
            </card_1.CardHeader>
            <card_1.CardContent>
              {/* Search and Filter */}
              <div className="mb-4 flex gap-4">
                <div className="relative flex-1">
                  <lucide_react_1.Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                  <input_1.Input
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <select
                  value={filterStatus}
                  onChange={e => setFilterStatus(e.target.value)}
                  className="rounded-md border px-3 py-2"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="banned">Banned</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              {/* Bulk Actions */}
              {selectedItems.length > 0 && (
                <div className="mb-4 flex gap-2 rounded-md bg-gray-50 p-3 dark:bg-gray-800">
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    {selectedItems.length} items selected
                  </span>
                  <button_1.Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkAction('activate')}
                  >
                    <lucide_react_1.CheckCircle className="mr-1 h-4 w-4" />
                    Activate
                  </button_1.Button>
                  <button_1.Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkAction('ban')}
                  >
                    <lucide_react_1.Ban className="mr-1 h-4 w-4" />
                    Ban
                  </button_1.Button>
                  <button_1.Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkAction('delete')}
                    className="text-red-600 hover:text-red-700"
                  >
                    <lucide_react_1.Trash2 className="mr-1 h-4 w-4" />
                    Delete
                  </button_1.Button>
                </div>
              )}

              {/* Users Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="p-2 text-left">
                        <input
                          type="checkbox"
                          onChange={e => {
                            if (e.target.checked) {
                              setSelectedItems(filteredUsers.map(u => u.id));
                            } else {
                              setSelectedItems([]);
                            }
                          }}
                          checked={
                            selectedItems.length === filteredUsers.length &&
                            filteredUsers.length > 0
                          }
                        />
                      </th>
                      <th className="p-2 text-left">User</th>
                      <th className="p-2 text-left">Role</th>
                      <th className="p-2 text-left">Status</th>
                      <th className="p-2 text-left">Join Date</th>
                      <th className="p-2 text-left">Last Active</th>
                      <th className="p-2 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map(user => (
                      <tr
                        key={user.id}
                        className="border-b hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        <td className="p-2">
                          <input
                            type="checkbox"
                            checked={selectedItems.includes(user.id)}
                            onChange={e => {
                              if (e.target.checked) {
                                setSelectedItems([...selectedItems, user.id]);
                              } else {
                                setSelectedItems(selectedItems.filter(id => id !== user.id));
                              }
                            }}
                          />
                        </td>
                        <td className="p-2">
                          <div>
                            <div className="font-medium">{user.username}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </td>
                        <td className="p-2">
                          <badge_1.Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                            {user.role}
                          </badge_1.Badge>
                        </td>
                        <td className="p-2">
                          <badge_1.Badge
                            variant={
                              user.status === 'active'
                                ? 'default'
                                : user.status === 'banned'
                                  ? 'destructive'
                                  : 'secondary'
                            }
                          >
                            {user.status}
                          </badge_1.Badge>
                        </td>
                        <td className="p-2 text-sm">{user.joinDate}</td>
                        <td className="p-2 text-sm">{user.lastActive}</td>
                        <td className="p-2">
                          <div className="flex gap-1">
                            <button_1.Button variant="ghost" size="sm">
                              <lucide_react_1.Eye className="h-4 w-4" />
                            </button_1.Button>
                            <button_1.Button variant="ghost" size="sm">
                              <lucide_react_1.Edit className="h-4 w-4" />
                            </button_1.Button>
                            <button_1.Button variant="ghost" size="sm">
                              <lucide_react_1.Ban className="h-4 w-4" />
                            </button_1.Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>

        {/* Shop Tab */}
        <tabs_1.TabsContent value="shop" className="space-y-4">
          <card_1.Card>
            <card_1.CardHeader>
              <div className="flex items-center justify-between">
                <card_1.CardTitle>Shop Management</card_1.CardTitle>
                <button_1.Button>
                  <lucide_react_1.Package className="mr-2 h-4 w-4" />
                  Add Product
                </button_1.Button>
              </div>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="p-2 text-left">Product</th>
                      <th className="p-2 text-left">Price</th>
                      <th className="p-2 text-left">Stock</th>
                      <th className="p-2 text-left">Status</th>
                      <th className="p-2 text-left">Sales</th>
                      <th className="p-2 text-left">Revenue</th>
                      <th className="p-2 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map(product => (
                      <tr
                        key={product.id}
                        className="border-b hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        <td className="p-2">
                          <div>
                            <div className="font-medium">{product.name}</div>
                            <div className="text-sm text-gray-500">{product.category}</div>
                          </div>
                        </td>
                        <td className="p-2">${product.price}</td>
                        <td className="p-2">
                          <badge_1.Badge
                            variant={
                              product.stock > 10
                                ? 'default'
                                : product.stock > 0
                                  ? 'secondary'
                                  : 'destructive'
                            }
                          >
                            {product.stock}
                          </badge_1.Badge>
                        </td>
                        <td className="p-2">
                          <badge_1.Badge
                            variant={product.status === 'active' ? 'default' : 'secondary'}
                          >
                            {product.status}
                          </badge_1.Badge>
                        </td>
                        <td className="p-2">{product.salesCount}</td>
                        <td className="p-2">${product.revenue.toFixed(2)}</td>
                        <td className="p-2">
                          <div className="flex gap-1">
                            <button_1.Button variant="ghost" size="sm">
                              <lucide_react_1.Edit className="h-4 w-4" />
                            </button_1.Button>
                            <button_1.Button variant="ghost" size="sm">
                              <lucide_react_1.Eye className="h-4 w-4" />
                            </button_1.Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>

        {/* Moderation Tab */}
        <tabs_1.TabsContent value="moderation" className="space-y-4">
          <card_1.Card>
            <card_1.CardHeader>
              <div className="flex items-center justify-between">
                <card_1.CardTitle>Content Moderation</card_1.CardTitle>
                <button_1.Button variant="outline">
                  <lucide_react_1.MessageSquare className="mr-2 h-4 w-4" />
                  View Reports
                </button_1.Button>
              </div>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="p-2 text-left">Content</th>
                      <th className="p-2 text-left">Author</th>
                      <th className="p-2 text-left">Reason</th>
                      <th className="p-2 text-left">Severity</th>
                      <th className="p-2 text-left">Status</th>
                      <th className="p-2 text-left">Date</th>
                      <th className="p-2 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {flaggedContent.map(content => (
                      <tr
                        key={content.id}
                        className="border-b hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        <td className="p-2">
                          <div>
                            <div className="font-medium">{content.type}</div>
                            <div className="max-w-xs truncate text-sm text-gray-500">
                              {content.content}
                            </div>
                          </div>
                        </td>
                        <td className="p-2">{content.authorName}</td>
                        <td className="p-2">{content.reason}</td>
                        <td className="p-2">
                          <badge_1.Badge
                            variant={
                              content.severity === 'high'
                                ? 'destructive'
                                : content.severity === 'medium'
                                  ? 'secondary'
                                  : 'default'
                            }
                          >
                            {content.severity}
                          </badge_1.Badge>
                        </td>
                        <td className="p-2">
                          <badge_1.Badge
                            variant={content.status === 'pending' ? 'secondary' : 'default'}
                          >
                            {content.status}
                          </badge_1.Badge>
                        </td>
                        <td className="p-2 text-sm">{content.createdAt}</td>
                        <td className="p-2">
                          <div className="flex gap-1">
                            <button_1.Button variant="ghost" size="sm">
                              <lucide_react_1.Eye className="h-4 w-4" />
                            </button_1.Button>
                            <button_1.Button variant="ghost" size="sm">
                              <lucide_react_1.CheckCircle className="h-4 w-4" />
                            </button_1.Button>
                            <button_1.Button variant="ghost" size="sm">
                              <lucide_react_1.Ban className="h-4 w-4" />
                            </button_1.Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>

        {/* Blog Tab */}
        <tabs_1.TabsContent value="blog" className="space-y-4">
          <card_1.Card>
            <card_1.CardHeader>
              <div className="flex items-center justify-between">
                <card_1.CardTitle>Blog Management</card_1.CardTitle>
                <button_1.Button>
                  <lucide_react_1.FileText className="mr-2 h-4 w-4" />
                  New Post
                </button_1.Button>
              </div>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="p-2 text-left">Title</th>
                      <th className="p-2 text-left">Author</th>
                      <th className="p-2 text-left">Status</th>
                      <th className="p-2 text-left">Publish Date</th>
                      <th className="p-2 text-left">Views</th>
                      <th className="p-2 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {blogPosts.map(post => (
                      <tr
                        key={post.id}
                        className="border-b hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        <td className="p-2 font-medium">{post.title}</td>
                        <td className="p-2">{post.author}</td>
                        <td className="p-2">
                          <badge_1.Badge
                            variant={post.status === 'published' ? 'default' : 'secondary'}
                          >
                            {post.status}
                          </badge_1.Badge>
                        </td>
                        <td className="p-2 text-sm">{post.publishDate}</td>
                        <td className="p-2">{post.views}</td>
                        <td className="p-2">
                          <div className="flex gap-1">
                            <button_1.Button variant="ghost" size="sm">
                              <lucide_react_1.Edit className="h-4 w-4" />
                            </button_1.Button>
                            <button_1.Button variant="ghost" size="sm">
                              <lucide_react_1.Eye className="h-4 w-4" />
                            </button_1.Button>
                            <button_1.Button variant="ghost" size="sm">
                              <lucide_react_1.Trash2 className="h-4 w-4" />
                            </button_1.Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>
      </tabs_1.Tabs>
    </div>
  );
}
