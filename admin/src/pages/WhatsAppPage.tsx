import React, { useEffect, useState, useCallback } from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableHead, TableRow, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Chip, IconButton, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { QrCode as QrIcon, Delete, Send, Refresh } from '@mui/icons-material';
import api from '../api/client';

export default function WhatsAppPage() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [appSelect, setAppSelect] = useState('');
  const [availableApps, setAvailableApps] = useState<any[]>([]);
  const [qrOpen, setQrOpen] = useState(false);
  const [qrAccount, setQrAccount] = useState<any>(null);
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [qrError, setQrError] = useState('');
  const [sendOpen, setSendOpen] = useState(false);
  const [sendAccount, setSendAccount] = useState<any>(null);
  const [sendTo, setSendTo] = useState('');
  const [sendMsg, setSendMsg] = useState('');

  const load = useCallback(() => {
    api.get('/whatsapp/accounts').then((r) => {
      const list = Array.isArray(r.data) ? r.data : (r.data?.value || r.data?.data || []);
      setAccounts(list);
    }).catch(() => {});
  }, []);

  useEffect(() => { load(); }, [load]);

  const openAdd = async () => {
    setShowAdd(true);
    setPhoneNumber('');
    setAppSelect('');
    try {
      const [appsRes, accountsRes] = await Promise.all([
        api.get('/auth/applications'),
        api.get('/whatsapp/accounts'),
      ]);
      const allApps = appsRes.data;
      const usedAppIds = new Set((accountsRes.data || []).map((a: any) => a.applicationId));
      setAvailableApps(allApps.filter((app: any) => !usedAppIds.has(app.id)));
    } catch {}
  };

  const addAccount = async () => {
    try {
      await api.post('/whatsapp/accounts', { phoneNumber, applicationId: parseInt(appSelect) });
      setShowAdd(false);
      setPhoneNumber('');
      load();
    } catch (e: any) {
      alert(e.response?.data?.error || 'Error');
    }
  };

  const deleteAccount = async (id: number) => {
    if (!confirm('Deactivate this account?')) return;
    await api.delete(`/whatsapp/accounts/${id}`);
    load();
  };

  const openQr = async (account: any) => {
    setQrAccount(account);
    setQrOpen(true);
    setQrDataUrl('');
    setQrError('');
    try {
      const res = await api.get(`/whatsapp/accounts/${account.id}/qr-image`, { responseType: 'arraybuffer' });
      const blob = new Blob([res.data], { type: 'image/png' });
      setQrDataUrl(URL.createObjectURL(blob));
    } catch (err: any) {
      setQrError(err.response?.status === 404 ? 'QR not available. Restart server or wait for QR generation.' : 'Failed to load QR.');
    }
  };

  const sendMessage = async () => {
    await api.post(`/whatsapp/accounts/${sendAccount?.id}/send`, { to: sendTo, message: sendMsg });
    setSendOpen(false);
    setSendTo('');
    setSendMsg('');
    alert('Message sent!');
  };

  const statusColor = (s: string) => s === 'ready' ? 'success' : s === 'error' ? 'error' : s === 'awaiting_scan' ? 'warning' : 'default';

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography variant="h5">WhatsApp</Typography>
        <Box><IconButton onClick={load}><Refresh /></IconButton><Button variant="contained" onClick={openAdd} sx={{ ml: 1 }}>Tambah Akun</Button></Box>
      </Box>

      <Table>
        <TableHead><TableRow><TableCell>ID</TableCell><TableCell>Nomor</TableCell><TableCell>Status</TableCell><TableCell>Aplikasi</TableCell><TableCell>Actions</TableCell></TableRow></TableHead>
        <TableBody>
          {accounts.map((a) => {
            const st = (a.isActive === false ? 'deactivated' : 'idle');
            return (
              <TableRow key={a.id}>
                <TableCell>{a.id}</TableCell>
                <TableCell>{a.phoneNumber}</TableCell>
                <TableCell><Chip label={st} color={statusColor(st) as any} size="small" /></TableCell>
                <TableCell>{a.applicationId}</TableCell>
                <TableCell>
                  <IconButton onClick={() => openQr(a)} title="QR"><QrIcon /></IconButton>
                  <IconButton onClick={() => { setSendAccount(a); setSendOpen(true); }} title="Kirim"><Send /></IconButton>
                  <IconButton onClick={() => deleteAccount(a.id)} title="Hapus"><Delete /></IconButton>
                </TableCell>
              </TableRow>
            );
          })}
          {accounts.length === 0 && <TableRow><TableCell colSpan={5} align="center">No accounts yet</TableCell></TableRow>}
        </TableBody>
      </Table>

      <Dialog open={showAdd} onClose={() => setShowAdd(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Tambah WhatsApp Account</DialogTitle>
        <DialogContent>
          <TextField label="Phone Number" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} fullWidth margin="normal" placeholder="628xxx" />
          <FormControl fullWidth margin="normal">
            <InputLabel>Application</InputLabel>
            <Select value={appSelect} label="Application" onChange={(e) => setAppSelect(e.target.value)}>
              {availableApps.map((app) => (
                <MenuItem key={app.id} value={app.id}>{app.name} (ID: {app.id})</MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions><Button onClick={() => setShowAdd(false)}>Cancel</Button><Button variant="contained" onClick={addAccount} disabled={!appSelect || !phoneNumber}>Create</Button></DialogActions>
      </Dialog>

      <Dialog open={qrOpen} onClose={() => setQrOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>QR Code — {qrAccount?.phoneNumber}</DialogTitle>
        <DialogContent sx={{ textAlign: 'center' }}>
          {qrDataUrl ? <img src={qrDataUrl} alt="QR" style={{ maxWidth: '100%' }} /> : qrError ? <Typography color="error">{qrError}</Typography> : 'Loading...'}
        </DialogContent>
        <DialogActions><Button onClick={() => setQrOpen(false)}>Close</Button></DialogActions>
      </Dialog>

      <Dialog open={sendOpen} onClose={() => setSendOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Kirim Pesan — {sendAccount?.phoneNumber}</DialogTitle>
        <DialogContent>
          <TextField label="To" value={sendTo} onChange={(e) => setSendTo(e.target.value)} fullWidth margin="normal" placeholder="628xxx" />
          <TextField label="Message" value={sendMsg} onChange={(e) => setSendMsg(e.target.value)} fullWidth margin="normal" multiline rows={3} />
        </DialogContent>
        <DialogActions><Button onClick={() => setSendOpen(false)}>Cancel</Button><Button variant="contained" onClick={sendMessage}>Send</Button></DialogActions>
      </Dialog>
    </Box>
  );
}
