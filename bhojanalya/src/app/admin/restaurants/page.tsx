"use client";

import { useState } from "react";
import { Search, MapPin, MoreHorizontal, Filter, Smartphone } from "lucide-react";

// Mock Restaurants Data
const RESTAURANTS = [
  { id: 1, name: "Royal Spice Bistro", location: "Gurugram, Sector 29", owner: "Rajesh Kumar", status: "Active", rating: 4.8 },
  { id: 2, name: "Pizza Haven", location: "Delhi, CP", owner: "Amit Singh", status: "Active", rating: 4.5 },
  { id: 3, name: "Burger Point", location: "Noida, Sector 18", owner: "Sneha Gupta", status: "Pending", rating: 0.0 },
  { id: 4, name: "The Curry House", location: "Gurugram, DLF", owner: "Vikram Malhotra", status: "Suspended", rating: 3.9 },
  { id: 5, name: "Tandoori Nights", location: "Chandigarh, Sector 17", owner: "Priya Sharma", status: "Active", rating: 4.7 },
];

export default function RestaurantDirectory() {
  const [searchTerm, setSearchTerm] = useState("");

  const filtered = RESTAURANTS.filter(r => 
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openPreview = () => window.open("/preview", "_blank");

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
                <th className="px-6 py-4">Owner</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900">{r.name}</div>
                    <div className="text-xs text-slate-400 font-medium">ID: #{r.id.toString().padStart(4, '0')}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-slate-600 text-sm">
                      <MapPin size={14} className="text-slate-300" /> {r.location}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-700">{r.owner}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                      r.status === 'Active' ? 'bg-green-100 text-green-700' :
                      r.status === 'Pending' ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={openPreview}
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
            <div className="p-12 text-center text-slate-400 text-sm">No restaurants found matching your search.</div>
          )}
        </div>
      </div>
    </div>
  );
}