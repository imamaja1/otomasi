import React, { useEffect, useState, useCallback } from 'react';
import { Box, Typography, Tabs, Tab, Table, TableBody, TableCell, TableHead, TableRow, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Chip, IconButton } from '@mui/material';
import { QrCode as QrIcon, Delete, Send, Refresh } from '@mui/icons-material';
import api from '../api/client';

export default function WhatsAppPage() {
  const [tab, setTab] = useState(0);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [qrOpen, setQrOpen] = useState(false);
  const [qrAccount, setQrAccount] = useState<any>(null);
  const [sendOpen, setSendOpen] = useState(false);
  const [sendAccount, setSendAccount] = useState<any>(null);
  const [sendTo, setSendTo] = useState('');
  const [sendMsg, setSendMsg] = useState('');

  const load = useCallback(() => {
    api.get('/whatsapp/accounts').then((r) => setAccounts(r.data)).catch(() => {});
  }, []);

  useEffect(() => { load(); }, [load]);

  const addAccount = async () => {
    try { await api.post('/whatsapp/accounts', { phoneNumber }); setShowAdd(false); setPhoneNumber(''); load(); } catch (e: any) { alert(e.response?.data?.error || 'Error'); }
  };

  const deleteAccount = async (id: number) => {
    if (!confirm('Deactivate this account?')) return;
    await api.delete(`/whatsapp/accounts/${id}`);
    load();
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
        <Box><IconButton onClick={load}><Refresh /></IconButton><Button variant="contained" onClick={() => setShowAdd(true)} sx={{ ml: 1 }}>Tambah Akun</Button></Box>
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
                  <IconButton onClick={() => { setQrAccount(a); setQrOpen(true); }} title="QR"><QrIcon /></IconButton>
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
        <DialogContent><TextField label="Phone Number" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} fullWidth margin="normal" placeholder="628xxx" /></DialogContent>
        <DialogActions><Button onClick={() => setShowAdd(false)}>Cancel</Button><Button variant="contained" onClick={addAccount}>Create</Button></DialogActions>
      </Dialog>

      <Dialog open={qrOpen} onClose={() => setQrOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>QR Code — {qrAccount?.phoneNumber}</DialogTitle>
        <DialogContent sx={{ textAlign: 'center' }}>
          {qrAccount && <img src={`/api/v1/whatsapp/accounts/${qrAccount.id}/qr-image`} alt="QR" style={{ maxWidth: '100%' }} />}
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
