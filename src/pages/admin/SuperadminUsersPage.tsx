import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Activity, CalendarDays, Pencil, Plus, ShieldCheck, UserRoundCheck, Users } from "lucide-react";
import api from "@/services/api";
import { useGet } from "@/hooks/useApi";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";

type UserRole = "superadmin" | "admin" | "juri";

interface AssignmentSummary {
  id: string;
  eventId: string;
  eventName: string | null;
  sessionLabel: string | null;
  isActive: boolean;
  createdAt: string;
}

interface UserRow {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  lastLoginAt?: string | null;
  createdAt: string;
  updatedAt?: string;
  assignments: AssignmentSummary[];
}

interface EventOption {
  id: string;
  name: string;
  startDate?: string | null;
  status: string;
}

interface AssignmentRow {
  id: string;
  eventId: string;
  eventName: string | null;
  judgeId: string;
  judgeName: string | null;
  judgeEmail: string | null;
  sessionLabel: string | null;
  isActive: boolean;
  createdAt: string;
}

interface AuditLogRow {
  id: string;
  action: string;
  entityType: string;
  entityId: string | null;
  metadata?: Record<string, unknown> | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  createdAt: string;
  actor?: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
  } | null;
}

const roleColors: Record<UserRole, string> = {
  superadmin: "bg-emerald-100 text-emerald-700",
  admin: "bg-sky-100 text-sky-700",
  juri: "bg-amber-100 text-amber-800",
};

const formatDateTime = (value?: string | null) => {
  if (!value) {
    return "Belum pernah";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Belum pernah";
  }

  return format(date, "dd MMM yyyy HH:mm");
};

const summarizeMetadata = (metadata?: Record<string, unknown> | null) => {
  if (!metadata) {
    return "Tidak ada metadata";
  }

  return Object.entries(metadata)
    .filter(([, value]) => value !== null && value !== undefined && value !== "")
    .slice(0, 3)
    .map(([key, value]) => `${key}: ${String(value)}`)
    .join(" · ") || "Tidak ada metadata";
};

export default function SuperadminUsersPage() {
  const queryClient = useQueryClient();
  const { data: users = [], isLoading: isLoadingUsers } = useGet<UserRow[]>(["admin-users"], "/admin/users");
  const { data: events = [] } = useGet<EventOption[]>(["events"], "/events");
  const { data: assignments = [] } = useGet<AssignmentRow[]>(["judge-assignments"], "/admin/judge-assignments");
  const { data: auditLogs = [] } = useGet<AuditLogRow[]>(["audit-logs"], "/admin/audit-logs");

  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserRow | null>(null);
  const [userForm, setUserForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "admin" as UserRole,
    isActive: true,
  });

  const [assignmentForm, setAssignmentForm] = useState({
    judgeId: "",
    eventId: "",
    sessionLabel: "",
  });

  const judgeUsers = useMemo(() => users.filter((user) => user.role === "juri"), [users]);

  const invalidateAdminQueries = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["admin-users"] }),
      queryClient.invalidateQueries({ queryKey: ["judge-assignments"] }),
      queryClient.invalidateQueries({ queryKey: ["audit-logs"] }),
    ]);
  };

  const userMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        name: userForm.name,
        email: userForm.email,
        password: userForm.password || undefined,
        role: userForm.role,
        isActive: userForm.isActive,
      };

      if (editingUser) {
        const response = await api.put<UserRow>(`/admin/users/${editingUser.id}`, payload);
        return response.data;
      }

      const response = await api.post<UserRow>("/admin/users", payload);
      return response.data;
    },
    onSuccess: async () => {
      toast.success(editingUser ? "User updated" : "User created");
      setIsUserDialogOpen(false);
      setEditingUser(null);
      setUserForm({
        name: "",
        email: "",
        password: "",
        role: "admin",
        isActive: true,
      });
      await invalidateAdminQueries();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to save user");
    },
  });

  const assignmentMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post<AssignmentRow>("/admin/judge-assignments", assignmentForm);
      return response.data;
    },
    onSuccess: async () => {
      toast.success("Judge assigned to event");
      setAssignmentForm({
        judgeId: "",
        eventId: "",
        sessionLabel: "",
      });
      await invalidateAdminQueries();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to create assignment");
    },
  });

  const toggleAssignmentMutation = useMutation({
    mutationFn: async ({ id, isActive, sessionLabel }: { id: string; isActive: boolean; sessionLabel?: string | null }) => {
      const response = await api.put<AssignmentRow>(`/admin/judge-assignments/${id}`, { isActive, sessionLabel });
      return response.data;
    },
    onSuccess: async (_, variables) => {
      toast.success(variables.isActive ? "Assignment activated" : "Assignment deactivated");
      await invalidateAdminQueries();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to update assignment");
    },
  });

  const openCreateUserDialog = () => {
    setEditingUser(null);
    setUserForm({
      name: "",
      email: "",
      password: "",
      role: "admin",
      isActive: true,
    });
    setIsUserDialogOpen(true);
  };

  const openEditUserDialog = (user: UserRow) => {
    setEditingUser(user);
    setUserForm({
      name: user.name,
      email: user.email,
      password: "",
      role: user.role,
      isActive: user.isActive,
    });
    setIsUserDialogOpen(true);
  };

  const handleSubmitUser = async () => {
    if (!userForm.name || !userForm.email || (!editingUser && !userForm.password)) {
      toast.error("Name, email, and password are required for new users");
      return;
    }

    await userMutation.mutateAsync();
  };

  const handleCreateAssignment = async () => {
    if (!assignmentForm.judgeId || !assignmentForm.eventId) {
      toast.error("Pilih juri dan event terlebih dahulu");
      return;
    }

    await assignmentMutation.mutateAsync();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">Users, Roles, and Judge Assignment</h1>
          <p className="text-sm text-muted-foreground">
            Superadmin mengelola akun operator, penugasan juri per event, dan audit log aktivitas penting.
          </p>
        </div>
        <Button onClick={openCreateUserDialog}>
          <Plus className="mr-2 h-4 w-4" />
          New User
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Users</CardDescription>
            <CardTitle className="text-3xl">{users.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Juri Aktif</CardDescription>
            <CardTitle className="text-3xl">{judgeUsers.filter((user) => user.isActive).length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Assignment Aktif</CardDescription>
            <CardTitle className="text-3xl">{assignments.filter((assignment) => assignment.isActive).length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Audit Events</CardDescription>
            <CardTitle className="text-3xl">{auditLogs.length}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Alert>
        <ShieldCheck className="h-4 w-4" />
        <AlertTitle>RBAC aktif</AlertTitle>
        <AlertDescription>
          Route admin dan juri sekarang protected di backend dan frontend. Juri hanya melihat event yang di-assign, tidak bisa mengubah event atau reorder queue.
        </AlertDescription>
      </Alert>

      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.9fr]">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                User Directory
              </CardTitle>
              <CardDescription>Create, update role, activate, and reset operator accounts.</CardDescription>
            </div>
            <Button variant="outline" onClick={openCreateUserDialog}>
              <Plus className="mr-2 h-4 w-4" />
              Add User
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Judge Assignment</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoadingUsers ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                      Memuat user...
                    </TableCell>
                  </TableRow>
                ) : users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="font-medium">{user.name}</div>
                    </TableCell>
                    <TableCell className="font-mono text-xs">{user.email}</TableCell>
                    <TableCell>
                      <Badge className={roleColors[user.role]}>{user.role}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.isActive ? "default" : "secondary"}>
                        {user.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {user.role === "juri"
                        ? user.assignments.filter((assignment) => assignment.isActive).map((assignment) => assignment.eventName || assignment.eventId).join(", ") || "Belum ada assignment"
                        : "-"}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{formatDateTime(user.lastLoginAt)}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" onClick={() => openEditUserDialog(user)}>
                        <Pencil className="mr-2 h-3.5 w-3.5" />
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserRoundCheck className="h-5 w-5 text-primary" />
              Assign Judge To Event
            </CardTitle>
            <CardDescription>Hubungkan juri ke event atau sesi agar workspace judge hanya menampilkan entry yang relevan.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Judge</Label>
              <Select value={assignmentForm.judgeId} onValueChange={(value) => setAssignmentForm((current) => ({ ...current, judgeId: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih juri" />
                </SelectTrigger>
                <SelectContent>
                  {judgeUsers.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name} · {user.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Event</Label>
              <Select value={assignmentForm.eventId} onValueChange={(value) => setAssignmentForm((current) => ({ ...current, eventId: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih event" />
                </SelectTrigger>
                <SelectContent>
                  {events.map((event) => (
                    <SelectItem key={event.id} value={event.id}>
                      {event.name} · {event.status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sessionLabel">Session Label</Label>
              <Input
                id="sessionLabel"
                placeholder="Contoh: Morning Session / Hall A"
                value={assignmentForm.sessionLabel}
                onChange={(event) => setAssignmentForm((current) => ({ ...current, sessionLabel: event.target.value }))}
              />
            </div>

            <Button className="w-full" onClick={handleCreateAssignment} disabled={assignmentMutation.isPending}>
              {assignmentMutation.isPending ? "Menyimpan..." : "Create Assignment"}
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-primary" />
              Active Judge Assignments
            </CardTitle>
            <CardDescription>Aktif/nonaktifkan assignment tanpa menghapus histori audit.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Judge</TableHead>
                  <TableHead>Event</TableHead>
                  <TableHead>Session</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assignments.map((assignment) => (
                  <TableRow key={assignment.id}>
                    <TableCell>
                      <div className="font-medium">{assignment.judgeName}</div>
                      <div className="text-xs text-muted-foreground">{assignment.judgeEmail}</div>
                    </TableCell>
                    <TableCell>{assignment.eventName || assignment.eventId}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{assignment.sessionLabel || "General"}</TableCell>
                    <TableCell>
                      <Badge variant={assignment.isActive ? "default" : "secondary"}>
                        {assignment.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{formatDateTime(assignment.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleAssignmentMutation.mutate({ id: assignment.id, isActive: !assignment.isActive, sessionLabel: assignment.sessionLabel })}
                      >
                        {assignment.isActive ? "Deactivate" : "Activate"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Recent Audit Log
            </CardTitle>
            <CardDescription>Login, update user, assignment juri, dan submit score direkam di sini.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {auditLogs.slice(0, 12).map((log) => (
              <div key={log.id} className="rounded-2xl border p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{log.action}</Badge>
                    <span className="text-xs text-muted-foreground">{log.entityType}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{formatDateTime(log.createdAt)}</span>
                </div>
                <div className="mt-2 text-sm font-medium">
                  {log.actor ? `${log.actor.name} (${log.actor.role})` : "System"}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{summarizeMetadata(log.metadata)}</p>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  {log.ipAddress || "IP tidak tersedia"}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{editingUser ? "Edit User" : "Create User"}</DialogTitle>
            <DialogDescription>
              Superadmin dapat membuat akun baru, mengubah role, menonaktifkan user, atau reset password.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="userName">Name</Label>
              <Input id="userName" value={userForm.name} onChange={(event) => setUserForm((current) => ({ ...current, name: event.target.value }))} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="userEmail">Email</Label>
              <Input id="userEmail" type="email" value={userForm.email} onChange={(event) => setUserForm((current) => ({ ...current, email: event.target.value }))} />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Role</Label>
                <Select value={userForm.role} onValueChange={(value: UserRole) => setUserForm((current) => ({ ...current, role: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="superadmin">superadmin</SelectItem>
                    <SelectItem value="admin">admin</SelectItem>
                    <SelectItem value="juri">juri</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between rounded-xl border px-4 py-3">
                <div>
                  <div className="text-sm font-medium">Status</div>
                  <div className="text-xs text-muted-foreground">Aktifkan atau nonaktifkan akses login</div>
                </div>
                <Switch checked={userForm.isActive} onCheckedChange={(checked) => setUserForm((current) => ({ ...current, isActive: checked }))} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="userPassword">{editingUser ? "Reset Password (optional)" : "Password"}</Label>
              <Input
                id="userPassword"
                type="password"
                value={userForm.password}
                onChange={(event) => setUserForm((current) => ({ ...current, password: event.target.value }))}
                placeholder={editingUser ? "Kosongkan jika tidak diganti" : "Minimal untuk akun baru"}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUserDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmitUser} disabled={userMutation.isPending}>
              {userMutation.isPending ? "Saving..." : editingUser ? "Save Changes" : "Create User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
