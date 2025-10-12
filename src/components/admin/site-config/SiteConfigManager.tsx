"use client";

import { useState, useEffect } from "react";
import { 
  SiteConfigData, 
  getSiteConfigurations, 
  createSiteConfig, 
  updateSiteConfig, 
  deleteSiteConfig,
  getConfigCategories,
  initializeDefaultConfigs
} from "@/actions/site-config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Badge from "@/components/ui/badge/Badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter 
} from "@/components/ui/dialog";
import { 
  Settings, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Filter,
  Eye,
  EyeOff,
  Database,
  RefreshCw
} from "lucide-react";
import { toast } from "sonner";

interface SiteConfigManagerProps {
  initialData: SiteConfigData[];
}

export function SiteConfigManager({ initialData }: SiteConfigManagerProps) {
  const [configs, setConfigs] = useState(initialData);
  const [categories, setCategories] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [editingConfig, setEditingConfig] = useState<SiteConfigData | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    key: "",
    value: "",
    description: "",
    category: "general",
    dataType: "string",
    isPublic: false,
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const cats = await getConfigCategories();
      setCategories(cats);
    } catch (error) {
      console.error("Error loading categories:", error);
    }
  };

  const loadConfigurations = async () => {
    setLoading(true);
    try {
      const data = await getSiteConfigurations(categoryFilter || undefined);
      setConfigs(data);
    } catch (error) {
      console.error("Error loading configurations:", error);
      toast.error("Gagal memuat konfigurasi");
    } finally {
      setLoading(false);
    }
  };

  const handleInitializeDefaults = async () => {
    try {
      const result = await initializeDefaultConfigs();
      if (result.success) {
        toast.success("Default configurations initialized");
        loadConfigurations();
        loadCategories();
      } else {
        toast.error("Failed to initialize default configs");
      }
    } catch (error) {
      console.error("Error initializing defaults:", error);
      toast.error("Gagal inisialisasi default configs");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let result;
      if (editingConfig) {
        result = await updateSiteConfig(editingConfig.id, {
          value: formData.value,
          description: formData.description,
          category: formData.category,
          dataType: formData.dataType,
          isPublic: formData.isPublic,
        });
      } else {
        result = await createSiteConfig(formData);
      }

      if (result.success) {
        toast.success(editingConfig ? "Konfigurasi berhasil diupdate" : "Konfigurasi berhasil dibuat");
        setIsDialogOpen(false);
        resetForm();
        loadConfigurations();
        loadCategories();
      } else {
        toast.error(result.error || "Gagal menyimpan konfigurasi");
      }
    } catch (error) {
      console.error("Error saving configuration:", error);
      toast.error("Gagal menyimpan konfigurasi");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (config: SiteConfigData) => {
    setEditingConfig(config);
    setFormData({
      key: config.key,
      value: config.value,
      description: config.description || "",
      category: config.category,
      dataType: config.dataType,
      isPublic: config.isPublic,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string, key: string) => {
    if (!confirm(`Hapus konfigurasi "${key}"? Tindakan ini tidak dapat dibatalkan.`)) {
      return;
    }

    try {
      const result = await deleteSiteConfig(id);
      if (result.success) {
        toast.success("Konfigurasi berhasil dihapus");
        loadConfigurations();
        loadCategories();
      } else {
        toast.error("Gagal menghapus konfigurasi");
      }
    } catch (error) {
      console.error("Error deleting configuration:", error);
      toast.error("Gagal menghapus konfigurasi");
    }
  };

  const resetForm = () => {
    setEditingConfig(null);
    setFormData({
      key: "",
      value: "",
      description: "",
      category: "general",
      dataType: "string",
      isPublic: false,
    });
  };

  const filteredConfigs = configs.filter((config) => {
    const matchesSearch = 
      config.key.toLowerCase().includes(search.toLowerCase()) ||
      config.value.toLowerCase().includes(search.toLowerCase()) ||
      (config.description && config.description.toLowerCase().includes(search.toLowerCase()));
    
    const matchesCategory = !categoryFilter || config.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  const getDataTypeBadge = (dataType: string): "info" | "success" | "primary" | "warning" => {
    const colors = {
      string: "info" as const,
      number: "success" as const,
      boolean: "primary" as const,
      json: "warning" as const,
    };
    return colors[dataType as keyof typeof colors] || "info";
  };

  const formatValue = (value: string, dataType: string) => {
    if (dataType === "json") {
      try {
        return JSON.stringify(JSON.parse(value), null, 2);
      } catch {
        return value;
      }
    }
    return value;
  };

  return (
    <div className="space-y-6">
      {/* Header with actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Configuration Management</h3>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleInitializeDefaults}
            className="flex items-center gap-2"
          >
            <Database className="h-4 w-4" />
            Init Defaults
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={loadConfigurations}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" onClick={resetForm} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white">
                <Plus className="h-4 w-4" />
                Add Config
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingConfig ? "Edit Configuration" : "Add New Configuration"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="key">Key</Label>
                    <Input
                      id="key"
                      value={formData.key}
                      onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                      placeholder="config_key"
                      disabled={!!editingConfig}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData({ ...formData, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General</SelectItem>
                        <SelectItem value="system">System</SelectItem>
                        <SelectItem value="contact">Contact</SelectItem>
                        <SelectItem value="social">Social</SelectItem>
                        <SelectItem value="security">Security</SelectItem>
                        <SelectItem value="appearance">Appearance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dataType">Data Type</Label>
                    <Select
                      value={formData.dataType}
                      onValueChange={(value) => setFormData({ ...formData, dataType: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="string">String</SelectItem>
                        <SelectItem value="number">Number</SelectItem>
                        <SelectItem value="boolean">Boolean</SelectItem>
                        <SelectItem value="json">JSON</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="isPublic" className="flex items-center gap-2">
                      <Switch
                        id="isPublic"
                        checked={formData.isPublic}
                        onCheckedChange={(checked) => setFormData({ ...formData, isPublic: checked })}
                      />
                      Public Configuration
                    </Label>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="value">Value</Label>
                  {formData.dataType === "json" ? (
                    <Textarea
                      id="value"
                      value={formData.value}
                      onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                      placeholder='{"key": "value"}'
                      rows={4}
                      required
                    />
                  ) : (
                    <Input
                      id="value"
                      type={formData.dataType === "number" ? "number" : "text"}
                      value={formData.value}
                      onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                      placeholder="Configuration value"
                      required
                    />
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Description of this configuration"
                    rows={2}
                  />
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? "Saving..." : editingConfig ? "Update" : "Create"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search configurations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Configurations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {loading ? (
          <div className="col-span-full flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            <span className="ml-2">Loading...</span>
          </div>
        ) : filteredConfigs.length === 0 ? (
          <div className="col-span-full text-center py-8 text-muted-foreground">
            {search || categoryFilter ? "No configurations match your filters" : "No configurations found"}
          </div>
        ) : (
          filteredConfigs.map((config) => (
            <Card key={config.id} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-base font-medium">{config.key}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant="light" color={getDataTypeBadge(config.dataType)}>
                        {config.dataType}
                      </Badge>
                      <Badge variant="light" color="light">{config.category}</Badge>
                      {config.isPublic ? (
                        <Eye className="h-4 w-4 text-green-500" />
                      ) : (
                        <EyeOff className="h-4 w-4 text-gray-500" />
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(config)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(config.id, config.key)}
                      className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Value:</div>
                    <div className="text-sm bg-muted p-2 rounded font-mono break-all">
                      {formatValue(config.value, config.dataType)}
                    </div>
                  </div>
                  {config.description && (
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Description:</div>
                      <div className="text-sm text-muted-foreground">{config.description}</div>
                    </div>
                  )}
                  <div className="text-xs text-muted-foreground">
                    Updated: {new Date(config.updatedAt).toLocaleString()}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}