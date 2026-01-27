"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Search, MapPin, MoreHorizontal, Filter, 
  Smartphone, Loader2, AlertCircle 
} from "lucide-react";

export default function RestaurantDirectory() {
  const router = useRouter();
  
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // SECURITY GUARD & DATA FETCH
  useEffect(() => {
    const token = localStorage.getItem('token');

    // 1. Check Token Existence
    if (!token) {
      router.push('/auth');
      return;
    }

    try {
      // 2. Decode & Verify Role
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));

      const decodedToken = JSON.parse(jsonPayload);
      const role = (decodedToken.role || "").toUpperCase();

      if (role !== "ADMIN") {
        console.warn("Unauthorized Access: User is not Admin");
        router.push('/deals'); // Kick to deal creation page
        return;
      }

      // 3. Fetch Data (Using our Next.js API Bypass)
      const fetchData = async () => {
        try {
          // Calls the Postgres DB directly via Next.js API
          const response = await fetch('/api/admin/restaurants');
          if (!response.ok) throw new Error("Failed to fetch");
          const data = await response.json();
          setRestaurants(data || []);
        } catch (err) {
          console.error("Failed to load directory", err);
        } finally {
          setLoading(false);
        }
      };

      fetchData();

    } catch (e) {
      localStorage.removeItem('token');
      router.push('/auth');
    }
  }, [router]);

  // Filter Logic
  const filtered = restaurants.filter(r => {
    // Handle Postgres lowercase keys (id, name, city)
    const name = (r.name || r.Name || "").toLowerCase();
    const location = (r.city || r.City || "").toLowerCase();
    const search = searchTerm.toLowerCase();
    return name.includes(search) || location.includes(search);
  });

  const openPreview = (id: string | number) => {
    window.open(`/preview?id=${id}`, "_blank");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FB]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-[#471396]" />
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Verifying Admin Access...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FB] font-sans pb-20">
      
      <div className="max-w-7xl mx-auto px-8 py-12">
        {/* Page Header */}
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Restaurants</h1>
            <p className="text-slate-500 text-sm mt-1">Manage all registered establishments.</p>
          </div>
          
          <div className="flex gap-3">
            {/* Search Input */}
            <div className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-xl border border-slate-200 shadow-sm">
              <Search size={16} className="text-slate-400" />
              <input 
                type="text" 
                placeholder="Search restaurants..." 
                className="bg-transparent text-sm font-medium outline-none w-48 placeholder:text-slate-300" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            {/* Filter Button */}
            <button className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50">
              <Filter size={18} />
            </button>
          </div>
        </div>

        {/* Directory Table */}
        <div className="bg-white rounded-[1.5rem] border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 border-b border-slate-200 text-xs font-bold text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Restaurant Name</th>
                <th className="px-6 py-4">Location</th>
                <th className="px-6 py-4">Owner ID</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((r) => (
                <tr key={r.id || r.ID} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900">{r.name || r.Name}</div>
                    <div className="text-xs text-slate-400 font-medium font-mono">ID: {r.id || r.ID}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-slate-600 text-sm">
                      <MapPin size={14} className="text-slate-300" /> {r.city || r.City || "Unknown"}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-700 font-mono text-xs">
                    {(r.owner_id || r.OwnerID || "N/A").substring(0, 8)}...
                  </td>
                  <td className="px-6 py-4">
                    {(() => {
                      const status = (r.status || r.Status || "Unknown").toLowerCase();
                      return (
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                          status === 'active' ? 'bg-green-100 text-green-700' :
                          status === 'pending' ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {status}
                        </span>
                      );
                    })()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => openPreview(r.id || r.ID)}
                        className="p-2 text-slate-400 hover:text-[#2e0561] hover:bg-purple-50 rounded-lg transition-colors" 
                        title="Preview Mobile App"
                      >
                        <Smartphone size={16} />
                      </button>
                      <button className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">
                        <MoreHorizontal size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filtered.length === 0 && (
            <div className="p-12 text-center text-slate-400 text-sm flex flex-col items-center gap-2">
              <AlertCircle size={24} className="opacity-50" />
              <span>No restaurants found matching your search.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}