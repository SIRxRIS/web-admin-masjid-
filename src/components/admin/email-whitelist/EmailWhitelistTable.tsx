"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Badge from "@/components/ui/badge/Badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Switch from "@/components/form/switch/Switch";
import { 
  Plus, 
  Search, 
  Mail, 
  Edit, 
  Trash2, 
  UserCheck, 
  UserX,
  Filter
} from "lucide-react";
import { EmailWhitelistData, EmailWhitelistFormData, jabatanOptions, roleOptions } from "@/lib/schema/email-whitelist";
import { Jabatan, Role } from "@prisma/client";
import Swal from "sweetalert2";

interface EmailWhitelistTableProps {
  initialData: EmailWhitelistData[];
  onCreateEmailWhitelist: (data: EmailWhitelistFormData) => Promise<EmailWhitelistData>;
  onUpdateEmailWhitelist: (id: string, data: EmailWhitelistFormData) => Promise<EmailWhitelistData>;
  onDeleteEmailWhitelist: (id: string) => Promise<boolean>;
  onToggleEmailWhitelistStatus: (id: string, status: boolean) => Promise<boolean>;
}

const EmailWhitelistTable: React.FC<EmailWhitelistTableProps> = ({
  initialData,
  onCreateEmailWhitelist,
  onUpdateEmailWhitelist,
  onDeleteEmailWhitelist,
  onToggleEmailWhitelistStatus
}) => {
  const [emailList, setEmailList] = useState<EmailWhitelistData[]>(initialData);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<EmailWhitelistData | null>(null);
  const [formData, setFormData] = useState<EmailWhitelistFormData>({
    nama: "",
    email: "",
    isActive: true,
    jabatan: Jabatan.PENGURUS,
    role: Role.KETUA
  });

  // Update local state when initialData changes
  useEffect(() => {
    setEmailList(initialData);
  }, [initialData]);

  // Filter email list
  const filteredEmailList = emailList.filter(item => {
    const matchesSearch = item.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === "all" || item.role === filterRole;
    const matchesStatus = filterStatus === "all" || 
                         (filterStatus === "active" && item.isActive) ||
                         (filterStatus === "inactive" && !item.isActive);
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  // Reload data helper
  const reloadData = () => {
    // Trigger a page refresh to get fresh data from server
    window.location.reload();
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (editingItem) {
        await onUpdateEmailWhitelist(editingItem.id!, formData);
        await Swal.fire({ title: "Berhasil", text: "Data whitelist email berhasil diperbarui.", icon: "success" });
      } else {
        await onCreateEmailWhitelist(formData);
        await Swal.fire({ title: "Berhasil", text: "Email whitelist baru berhasil ditambahkan.", icon: "success" });
      }
      
      // Reset form
      setFormData({
        nama: "",
        email: "",
        isActive: true,
        jabatan: Jabatan.PENGURUS,
        role: Role.KETUA
      });
      setShowForm(false);
      setEditingItem(null);
      reloadData();
    } catch (error) {
      console.error("Error saving email whitelist:", error);
      await Swal.fire({ title: "Gagal", text: "Terjadi kesalahan saat menyimpan data whitelist email.", icon: "error" });
    } finally {
      setLoading(false);
    }
  };

  // Handle edit
  const handleEdit = (item: EmailWhitelistData) => {
    setEditingItem(item);
    setFormData({
      nama: item.nama,
      email: item.email,
      isActive: item.isActive,
      jabatan: item.jabatan,
      role: item.role
    });
    setShowForm(true);
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: "Hapus Data?",
      text: "Tindakan ini tidak dapat dibatalkan.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Ya, hapus",
      cancelButtonText: "Batal",
    });

    if (result.isConfirmed) {
      try {
        setLoading(true);
        const success = await onDeleteEmailWhitelist(id);
        if (success) {
          await Swal.fire({
            title: "Terhapus",
            text: "Data whitelist email berhasil dihapus.",
            icon: "success",
          });
          reloadData();
        }
      } catch (error) {
        console.error("Error deleting email whitelist:", error);
        await Swal.fire({
          title: "Gagal",
          text: "Terjadi kesalahan saat menghapus data.",
          icon: "error",
        });
      } finally {
        setLoading(false);
      }
    }
  };

  // Handle toggle status
  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      setLoading(true);
      const success = await onToggleEmailWhitelistStatus(id, !currentStatus);
      if (success) {
        await Swal.fire({ title: "Berhasil", text: `Status email berhasil ${!currentStatus ? "diaktifkan" : "dinonaktifkan"}.`, icon: "success", timer: 1500, showConfirmButton: false });
        reloadData();
      }
    } catch (error) {
      console.error("Error toggling status:", error);
      await Swal.fire({ title: "Gagal", text: "Terjadi kesalahan saat mengubah status email.", icon: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Tambah, Filter dan Pencarian */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Filter className="h-5 w-5 mr-2" />
              Tambah, Filter dan Pencarian
            </div>
            <Button onClick={() => setShowForm(true)} disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Tambah Email
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Cari nama atau email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Select value={filterRole} onValueChange={setFilterRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Semua Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Role</SelectItem>
                  {roleOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Semua Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="active">Aktif</SelectItem>
                  <SelectItem value="inactive">Tidak Aktif</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button variant="outline" onClick={() => {
                setSearchTerm("");
                setFilterRole("all");
                setFilterStatus("all");
              }}>
                Reset Filter
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingItem ? "Edit Email Whitelist" : "Tambah Email Whitelist"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nama">Nama</Label>
                  <Input
                    id="nama"
                    value={formData.nama}
                    onChange={(e) => setFormData({...formData, nama: e.target.value})}
                    required
                    disabled={loading}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                    disabled={loading}
                  />
                </div>
                <div>
                  <Label htmlFor="jabatan">Jabatan</Label>
                  <Select 
                    value={formData.jabatan} 
                    onValueChange={(value) => setFormData({...formData, jabatan: value as Jabatan})}
                    disabled={loading}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {jabatanOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="role">Role</Label>
                  <Select 
                    value={formData.role} 
                    onValueChange={(value) => setFormData({...formData, role: value as Role})}
                    disabled={loading}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {roleOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  label="Aktif"
                  defaultChecked={formData.isActive}
                  onChange={(checked) => setFormData({...formData, isActive: checked})}
                  disabled={loading}
                />
              </div>
              <div className="flex space-x-2">
                <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white">
                  {loading ? "Loading..." : (editingItem ? "Update" : "Tambah")}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setShowForm(false);
                    setEditingItem(null);
                    setFormData({
                      nama: "",
                      email: "",
                      isActive: true,
                      jabatan: Jabatan.PENGURUS,
                      role: Role.KETUA
                    });
                  }}
                  disabled={loading}
                >
                  Batal
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Email List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center">
              <Mail className="h-5 w-5 mr-2" />
              Daftar Email ({filteredEmailList.length})
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : filteredEmailList.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Tidak ada data email whitelist
            </div>
          ) : (
            <div className="space-y-4">
              {filteredEmailList.map((item) => (
                <div key={item.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div>
                          <h3 className="font-semibold">{item.nama}</h3>
                          <p className="text-sm text-gray-600">{item.email}</p>
                        </div>
                        <Badge 
                          variant="light" 
                          color={item.isActive ? "success" : "light"}
                        >
                          {item.isActive ? "Aktif" : "Tidak Aktif"}
                        </Badge>
                      </div>
                      <div className="mt-2 flex space-x-4 text-sm text-gray-500">
                        <span>Jabatan: {jabatanOptions.find(j => j.value === item.jabatan)?.label}</span>
                        <span>Role: {roleOptions.find(r => r.value === item.role)?.label}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleToggleStatus(item.id!, item.isActive)}
                        disabled={loading}
                      >
                        {item.isActive ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(item)}
                        disabled={loading}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(item.id!)}
                        disabled={loading}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailWhitelistTable;