"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import { useToast } from "@/components/Toast";
import { useLang } from "@/components/LanguageContext";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Chip from "@mui/material/Chip";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import Alert from "@mui/material/Alert";

interface User {
  id: number;
  username: string;
  role: string;
  created_at: string;
  updated_at: string;
}

export default function AdminUsersPage() {
  const { t } = useLang();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const { showToast, toastElement } = useToast();
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form, setForm] = useState({ username: "", password: "", role: "user" });
  const [error, setError] = useState("");
  const router = useRouter();

  function formatDate(iso: string): string {
    const d = new Date(iso);
    const y = d.getFullYear();
    const mo = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    let h = d.getHours();
    const ampm = h >= 12 ? "PM" : "AM";
    h = h % 12 || 12;
    const mi = String(d.getMinutes()).padStart(2, "0");
    return `${y}-${mo}-${day} ${String(h).padStart(2, "0")}:${mi} ${ampm}`;
  }

  const fetchUsers = useCallback(async () => {
    const res = await fetch("/api/admin/users");
    if (res.ok) { setUsers(await res.json()); }
    else if (res.status === 401) { router.push("/login"); }
    else if (res.status === 403) { showToast(t.adminNoPermission); router.push("/"); }
    setLoading(false);
  }, [router, showToast, t]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  function openCreate() {
    setEditingUser(null);
    setForm({ username: "", password: "", role: "user" });
    setError("");
    setShowModal(true);
  }

  function openEdit(user: User) {
    setEditingUser(user);
    setForm({ username: user.username, password: "", role: user.role });
    setError("");
    setShowModal(true);
  }

  async function handleSave() {
    setError("");
    const method = editingUser ? "PUT" : "POST";
    const body = editingUser ? { id: editingUser.id, ...form } : { ...form };

    if (!editingUser && !form.password) { setError(t.adminPasswordRequired); return; }

    const res = await fetch("/api/admin/users", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const data = await res.json();
    if (res.ok) { setShowModal(false); fetchUsers(); }
    else { setError(data.error || "操作失败"); }
  }

  async function handleDelete(user: User) {
    if (user.username === "admin") { showToast(t.adminCannotDeleteAdmin); return; }
    if (!confirm(t.adminConfirmDelete(user.username))) return;
    const res = await fetch("/api/admin/users", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: user.id }) });
    if (res.ok) { fetchUsers(); }
  }

  if (loading) {
    return <Box sx={{ p: 4, textAlign: "center" }}><Typography variant="body2" sx={{ color: "text.secondary" }}>{t.adminLoading}</Typography></Box>;
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default", overflowX: "clip" }}>
      <SiteHeader />
      <Container maxWidth={false} disableGutters sx={{ pt: { xs: 9, md: 10 }, pb: 4, px: { xs: 1.5, sm: 3, md: "60px" } }}>
        <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 3 }}>
          <Button
            onClick={openCreate}
            variant="contained"
            startIcon={<AddIcon />}
            sx={{
              borderRadius: "6px",
              textTransform: "none",
              fontWeight: 600,
              bgcolor: "#111827",
              color: "#ffffff",
              px: 2.5,
              "&:hover": {
                bgcolor: "#374151",
              },
            }}
          >
            {t.adminNewUser}
          </Button>
        </Box>

        <TableContainer component={Paper} variant="outlined" className="table-responsive-scroll">
          <Table size="small" sx={{ minWidth: 520 }}>
            <TableHead>
              <TableRow sx={{ bgcolor: "grey.50" }}>
                <TableCell sx={{ fontWeight: 600, color: "grey.600", whiteSpace: "nowrap" }}>{t.adminColId}</TableCell>
                <TableCell sx={{ fontWeight: 600, color: "grey.600" }}>{t.adminColUsername}</TableCell>
                <TableCell sx={{ fontWeight: 600, color: "grey.600" }}>{t.adminColRole}</TableCell>
                <TableCell sx={{ display: { xs: "none", md: "table-cell" }, fontWeight: 600, color: "grey.600", whiteSpace: "nowrap" }}>Joined Date</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, color: "grey.600" }}>{t.adminColActions}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell sx={{ fontSize: "0.8125rem", color: "text.secondary" }}>{user.id}</TableCell>
                  <TableCell sx={{ fontSize: "0.8125rem", fontWeight: 600, wordBreak: "break-all" }}>{user.username}</TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          flexShrink: 0,
                          bgcolor: user.role === "admin" ? "#EF4444" : "#9CA3AF",
                        }}
                      />
                      <Typography sx={{ fontSize: "0.8125rem", color: "#374151" }}>
                        {user.role === "admin" ? t.adminRoleAdmin : t.adminRoleUser}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ display: { xs: "none", md: "table-cell" }, fontSize: "0.8125rem", color: "text.secondary", whiteSpace: "nowrap" }}>{formatDate(user.created_at)}</TableCell>
                  <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
                    <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 0.5 }}>
                      <Tooltip title={t.adminEdit}>
                        <IconButton onClick={() => openEdit(user)} size="small"
                          sx={{ color: "text.secondary", "&:hover": { color: "primary.main" } }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={t.adminDelete}>
                        <span>
                          <IconButton onClick={() => handleDelete(user)} size="small"
                            disabled={user.username === "admin"}
                            sx={{
                              color: "text.secondary",
                              "&:hover": { color: "error.main" },
                              "&.Mui-disabled": { color: "action.disabled" },
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Container>

      {toastElement}

      <Dialog
          open={showModal}
          onClose={() => setShowModal(false)}
          maxWidth="xs"
          fullWidth
          slotProps={{ paper: { sx: { borderRadius: 3, p: { xs: 3, sm: 4 } } } }}
        >
          <DialogTitle sx={{ fontWeight: 700, fontSize: "1.25rem", pt: 0, pb: 2, mb: 1 }}>
            {editingUser ? t.adminEditTitle : t.adminNewUser}
          </DialogTitle>
          <DialogContent sx={{ pt: "16px !important", pb: 1.5, overflow: "visible" }}>
            <Stack spacing={3} sx={{ overflow: "visible", pt: 1 }}>
              <TextField label={t.adminColUsername} value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} disabled={!!editingUser} fullWidth size="small" />
              <TextField
                type="password"
                label={`${t.adminLabelPassword} ${editingUser ? t.adminPasswordHint : ""}`}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder={editingUser ? t.adminPasswordPlaceholder : ""}
                fullWidth
                size="small"
              />
              <TextField select label={t.adminLabelRole} value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} fullWidth size="small">
                <MenuItem value="user">{t.adminRoleUser}</MenuItem>
                <MenuItem value="admin">{t.adminRoleAdmin}</MenuItem>
              </TextField>
              {error && <Alert severity="error" variant="outlined" sx={{ fontSize: "0.8125rem" }}>{error}</Alert>}
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 0, pb: 0 }}>
            <Button onClick={() => setShowModal(false)} variant="outlined" sx={{ textTransform: "none" }}>{t.adminCancel}</Button>
            <Button onClick={handleSave} variant="contained" sx={{ textTransform: "none" }}>{editingUser ? t.adminSave : t.adminCreate}</Button>
          </DialogActions>
        </Dialog>
    </Box>
  );
}
