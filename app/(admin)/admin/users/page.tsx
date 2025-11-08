"use client";

import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { VerifiedBadge } from "@/components/verified-badge";
import {
  Search,
  MoreVertical,
  Ban,
  CheckCircle,
  Shield,
  Eye,
  CheckCircle2,
  XCircle,
} from "lucide-react";

interface User {
  id: string;
  username: string;
  imageUrl: string;
  role: string;
  isStreamer: boolean;
  isBanned: boolean;
  isPrime: boolean;
  isVerified: boolean;
  verifiedAt: string | null;
  createdAt: string;
  _count: {
    following: number;
    followedBy: number;
  };
  stream?: {
    isLive: boolean;
  };
}

// Componente de menú personalizado
const ActionsMenu = ({
  user,
  onBan,
  onUnban,
  onChangeRole,
  onViewDetails,
  onVerify,
}: {
  user: User;
  onBan: () => void;
  onUnban: () => void;
  onChangeRole: () => void;
  onViewDetails: () => void;
  onVerify: () => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={menuRef}>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
      >
        <MoreVertical className="h-4 w-4" />
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg z-50 border border-gray-200 dark:border-gray-700">
          <div className="py-1">
            <button
              onClick={() => {
                onViewDetails();
                setIsOpen(false);
              }}
              className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
            >
              <Eye className="h-4 w-4" />
              Ver detalles
            </button>

            {/* ✅ NUEVA OPCIÓN: Verificar/Desverificar */}
            <button
              onClick={() => {
                onVerify();
                setIsOpen(false);
              }}
              className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 text-cyan-600 dark:text-cyan-400"
            >
              {user.isVerified ? (
                <>
                  <XCircle className="h-4 w-4" />
                  Quitar verificación
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Verificar usuario
                </>
              )}
            </button>
            
            <button
              onClick={() => {
                onChangeRole();
                setIsOpen(false);
              }}
              className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
            >
              <Shield className="h-4 w-4" />
              Cambiar role
            </button>

            {user.isBanned ? (
              <button
                onClick={() => {
                  onUnban();
                  setIsOpen(false);
                }}
                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
              >
                <CheckCircle className="h-4 w-4" />
                Desbanear
              </button>
            ) : (
              <button
                onClick={() => {
                  onBan();
                  setIsOpen(false);
                }}
                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 text-red-600"
              >
                <Ban className="h-4 w-4" />
                Banear usuario
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Modals
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showBanModal, setShowBanModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false); // ✅ NUEVO
  
  // Form states
  const [banReason, setBanReason] = useState("");
  const [banDuration, setBanDuration] = useState<string>("");
  const [newRole, setNewRole] = useState<string>("");
  const [verifyReason, setVerifyReason] = useState(""); // ✅ NUEVO

  useEffect(() => {
    loadUsers();
  }, [page]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/users?page=${page}&limit=50`);
      const data = await response.json();
      setUsers(data.users);
      setTotalPages(data.pages);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadUsers();
      return;
    }

    try {
      const response = await fetch(`/api/admin/users/search?q=${searchQuery}`);
      const data = await response.json();
      setUsers(data.users);
    } catch (error) {
      console.error('Error searching users:', error);
    }
  };

  const handleBanUser = async () => {
    if (!selectedUser || !banReason.trim()) return;

    try {
      await fetch('/api/admin/users/ban', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedUser.id,
          reason: banReason,
          duration: banDuration ? parseInt(banDuration) : undefined,
        }),
      });

      setShowBanModal(false);
      setBanReason("");
      setBanDuration("");
      loadUsers();
    } catch (error) {
      console.error('Error banning user:', error);
    }
  };

  const handleUnbanUser = async (userId: string) => {
    try {
      await fetch('/api/admin/users/unban', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, reason: "Unbanned by admin" }),
      });
      loadUsers();
    } catch (error) {
      console.error('Error unbanning user:', error);
    }
  };

  const handleChangeRole = async () => {
    if (!selectedUser || !newRole) return;

    try {
      await fetch('/api/admin/users/role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedUser.id,
          role: newRole,
          reason: `Role changed to ${newRole}`,
        }),
      });

      setShowRoleModal(false);
      setNewRole("");
      loadUsers();
    } catch (error) {
      console.error('Error changing role:', error);
    }
  };

  // ✅ NUEVA FUNCIÓN: Verificar/Desverificar Usuario
  const handleVerifyUser = async () => {
    if (!selectedUser) return;

    try {
      const isVerifying = !selectedUser.isVerified;
      
      await fetch('/api/admin/users/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedUser.id,
          isVerified: isVerifying,
          reason: verifyReason || `Usuario ${isVerifying ? 'verificado' : 'desverificado'}`,
        }),
      });

      setShowVerifyModal(false);
      setVerifyReason("");
      loadUsers();
    } catch (error) {
      console.error('Error verifying user:', error);
    }
  };

  const getRoleBadge = (role: string) => {
    const badges = {
      USER: { variant: "secondary" as const, label: "Usuario" },
      STREAMER: { variant: "default" as const, label: "Streamer" },
      MODERATOR: { variant: "outline" as const, label: "Moderador" },
      ADMIN: { variant: "destructive" as const, label: "Admin" },
      SUPER_ADMIN: { variant: "destructive" as const, label: "Super Admin" },
    };
    
    const badge = badges[role as keyof typeof badges] || badges.USER;
    return <Badge variant={badge.variant}>{badge.label}</Badge>;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-cyan-400 bg-clip-text text-transparent">
            Gestión de Usuarios
          </h1>
          <p className="text-muted-foreground">
            Administra todos los usuarios de la plataforma
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <Card className="p-4 border-cyan-500/20">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar usuarios por nombre..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="pl-10 border-cyan-500/30 focus:ring-cyan-500/50 focus:border-cyan-500"
            />
          </div>
          <Button 
            onClick={handleSearch}
            className="bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-500 hover:to-cyan-600 text-white shadow-lg shadow-cyan-500/30"
          >
            Buscar
          </Button>
        </div>
      </Card>

      {/* Users Table */}
      <Card className="border-cyan-500/20">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Usuario</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Seguidores</TableHead>
              <TableHead>Registrado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  Cargando...
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No se encontraron usuarios
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <img
                        src={user.imageUrl}
                        alt={user.username}
                        className="w-10 h-10 rounded-full"
                      />
                      <div>
                        <div className="font-medium flex items-center gap-2">
                          {user.username}
                          {/* ✅ MOSTRAR BADGE DE VERIFICADO */}
                          {user.isVerified && <VerifiedBadge size="sm" />}
                        </div>
                        <div className="text-xs text-muted-foreground flex items-center gap-2">
                          {user.isStreamer && (
                            <Badge variant="outline" className="text-xs">
                              Streamer
                            </Badge>
                          )}
                          {user.isPrime && (
                            <Badge variant="secondary" className="text-xs">
                              Prime
                            </Badge>
                          )}
                          {user.stream?.isLive && (
                            <Badge variant="destructive" className="text-xs">
                              EN VIVO
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getRoleBadge(user.role)}</TableCell>
                  <TableCell>
                    {user.isBanned ? (
                      <Badge variant="destructive">Baneado</Badge>
                    ) : (
                      <Badge variant="outline" className="text-green-600">
                        Activo
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>{user._count.followedBy}</TableCell>
                  <TableCell>
                    {new Date(user.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <ActionsMenu
                      user={user}
                      onBan={() => {
                        setSelectedUser(user);
                        setShowBanModal(true);
                      }}
                      onUnban={() => handleUnbanUser(user.id)}
                      onChangeRole={() => {
                        setSelectedUser(user);
                        setNewRole(user.role);
                        setShowRoleModal(true);
                      }}
                      onViewDetails={() => {
                        setSelectedUser(user);
                        setShowDetailModal(true);
                      }}
                      onVerify={() => {
                        setSelectedUser(user);
                        setShowVerifyModal(true);
                      }}
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        <div className="flex items-center justify-between p-4 border-t border-cyan-500/20">
          <div className="text-sm text-muted-foreground">
            Página {page} de {totalPages}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="hover:bg-cyan-500/10 hover:border-cyan-500/50"
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="hover:bg-cyan-500/10 hover:border-cyan-500/50"
            >
              Siguiente
            </Button>
          </div>
        </div>
      </Card>

      {/* ✅ NUEVO MODAL: Verificar Usuario */}
      <Dialog open={showVerifyModal} onOpenChange={setShowVerifyModal}>
        <DialogContent className="border-cyan-500/20">
          <DialogHeader>
            <DialogTitle className="text-cyan-600 dark:text-cyan-400">
              {selectedUser?.isVerified ? 'Quitar Verificación' : 'Verificar Usuario'}
            </DialogTitle>
            <DialogDescription>
              {selectedUser?.isVerified 
                ? `Vas a quitar la verificación de ${selectedUser?.username}`
                : `Vas a verificar a ${selectedUser?.username}`
              }
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">
                Razón {selectedUser?.isVerified ? 'de la remoción' : 'de la verificación'}
              </label>
              <Textarea
                value={verifyReason}
                onChange={(e) => setVerifyReason(e.target.value)}
                placeholder="Explica la razón (opcional)..."
                rows={3}
                className="border-cyan-500/30 focus:ring-cyan-500/50 focus:border-cyan-500"
              />
            </div>
            {!selectedUser?.isVerified && (
              <div className="p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
                <p className="text-xs text-cyan-700 dark:text-cyan-400 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  El usuario recibirá el badge de verificado en su perfil
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowVerifyModal(false)}
              className="hover:bg-cyan-500/10"
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleVerifyUser}
              className="bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-500 hover:to-cyan-600 text-white shadow-lg shadow-cyan-500/30"
            >
              {selectedUser?.isVerified ? 'Quitar Verificación' : 'Verificar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Ban Modal */}
      <Dialog open={showBanModal} onOpenChange={setShowBanModal}>
        <DialogContent className="border-cyan-500/20">
          <DialogHeader>
            <DialogTitle>Banear Usuario</DialogTitle>
            <DialogDescription>
              Banear a {selectedUser?.username}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Razón del ban</label>
              <Textarea
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
                placeholder="Explica la razón del ban..."
                rows={3}
                className="border-cyan-500/30 focus:ring-cyan-500/50 focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Duración (minutos)</label>
              <Input
                type="number"
                value={banDuration}
                onChange={(e) => setBanDuration(e.target.value)}
                placeholder="Dejar vacío para ban permanente"
                className="border-cyan-500/30 focus:ring-cyan-500/50 focus:border-cyan-500"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBanModal(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleBanUser}>
              Banear
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Role Modal */}
      <Dialog open={showRoleModal} onOpenChange={setShowRoleModal}>
        <DialogContent className="border-cyan-500/20">
          <DialogHeader>
            <DialogTitle>Cambiar Role</DialogTitle>
            <DialogDescription>
              Cambiar el role de {selectedUser?.username}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Select value={newRole} onValueChange={setNewRole}>
              <SelectTrigger className="border-cyan-500/30 focus:ring-cyan-500/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USER">Usuario</SelectItem>
                <SelectItem value="STREAMER">Streamer</SelectItem>
                <SelectItem value="MODERATOR">Moderador</SelectItem>
                <SelectItem value="ADMIN">Admin</SelectItem>
                <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRoleModal(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleChangeRole}
              className="bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-500 hover:to-cyan-600 text-white"
            >
              Cambiar Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail Modal */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="border-cyan-500/20">
          <DialogHeader>
            <DialogTitle className="text-cyan-600 dark:text-cyan-400">
              Detalles del Usuario
            </DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <img
                  src={selectedUser.imageUrl}
                  alt={selectedUser.username}
                  className="w-16 h-16 rounded-full border-2 border-cyan-500/30"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-lg">{selectedUser.username}</h3>
                    {selectedUser.isVerified && <VerifiedBadge />}
                  </div>
                  {getRoleBadge(selectedUser.role)}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="p-3 bg-cyan-500/5 rounded-lg border border-cyan-500/20">
                  <p className="text-muted-foreground">Seguidores</p>
                  <p className="font-semibold text-cyan-600 dark:text-cyan-400">
                    {selectedUser._count.followedBy}
                  </p>
                </div>
                <div className="p-3 bg-cyan-500/5 rounded-lg border border-cyan-500/20">
                  <p className="text-muted-foreground">Siguiendo</p>
                  <p className="font-semibold text-cyan-600 dark:text-cyan-400">
                    {selectedUser._count.following}
                  </p>
                </div>
                <div className="p-3 bg-cyan-500/5 rounded-lg border border-cyan-500/20">
                  <p className="text-muted-foreground">Estado</p>
                  <p className="font-semibold">
                    {selectedUser.isBanned ? "Baneado" : "Activo"}
                  </p>
                </div>
                <div className="p-3 bg-cyan-500/5 rounded-lg border border-cyan-500/20">
                  <p className="text-muted-foreground">Verificado</p>
                  <p className="font-semibold flex items-center gap-1">
                    {selectedUser.isVerified ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 text-cyan-500" />
                        Sí
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4 text-gray-400" />
                        No
                      </>
                    )}
                  </p>
                </div>
              </div>

              {selectedUser.verifiedAt && (
                <div className="p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
                  <p className="text-xs text-cyan-700 dark:text-cyan-400">
                    Verificado el {new Date(selectedUser.verifiedAt).toLocaleDateString('es-ES', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              )}

              <div className="p-3 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground">Registrado</p>
                <p className="font-semibold">
                  {new Date(selectedUser.createdAt).toLocaleDateString('es-ES', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </p>
              </div>

              {/* Botón rápido de verificación */}
              <Button
                onClick={() => {
                  setShowDetailModal(false);
                  setShowVerifyModal(true);
                }}
                variant="outline"
                className="w-full border-cyan-500/30 hover:bg-cyan-500/10 hover:border-cyan-500/50 text-cyan-600 dark:text-cyan-400"
              >
                {selectedUser.isVerified ? (
                  <>
                    <XCircle className="h-4 w-4 mr-2" />
                    Quitar Verificación
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Verificar Usuario
                  </>
                )}
              </Button>
            </div>
          )}
          <DialogFooter>
            <Button 
              onClick={() => setShowDetailModal(false)}
              className="bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-500 hover:to-cyan-600 text-white"
            >
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}