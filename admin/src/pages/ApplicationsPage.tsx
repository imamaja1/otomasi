import React, { useEffect, useState } from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableHead, TableRow, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Chip, IconButton, Collapse } from '@mui/material';
import { Add, Key, Refresh, KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material';
import api from '../api/client';

export default function ApplicationsPage() {
  const [apps, setApps] = useState<any[]>([]);
  const [showRegister, setShowRegister] = useState(false);
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [expanded, setExpanded] = useState<number | null>(null);
  const [keyModal, setKeyModal] = useState(false);
  const [keyApp, setKeyApp] = useState<any>(null);
  const [keyName, setKeyName] = useState('');
  const [generatedKey, setGeneratedKey] = useState('');

  const load = async () => {
    try { const r = await api.get('/auth/applications'); setApps(r.data); } catch {}
  };

  useEffect(() => { load(); }, []);

  const register = async () => {
    await api.post('/auth/register', { name, description: desc });
    setShowRegister(false); setName(''); setDesc(''); load();
  };

  const generateKey = async () => {
    const r = await api.post('/auth/api-key', { applicationId: keyApp.id, name: keyName, permissions: ['whatsapp', 'email', 'notification', 'webhook', 'ai', 'recommend'] });
    setGeneratedKey(r.data.key);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography variant="h5">Aplikasi</Typography>
        <Box><IconButton onClick={load}><Refresh /></IconButton><Button variant="contained" startIcon={<Add />} onClick={() => setShowRegister(true)}>Register App</Button></Box>
      </Box>

      <Table>
        <TableHead><TableRow><TableCell /><TableCell>Name</TableCell><TableCell>Status</TableCell><TableCell>Created</TableCell><TableCell>Actions</TableCell></TableRow></TableHead>
        <TableBody>
          {apps.map((app) => (
            <React.Fragment key={app.id}>
              <TableRow hover>
                <TableCell>
                  <IconButton size="small" onClick={() => setExpanded(expanded === app.id ? null : app.id)}>{expanded === app.id ? <KeyboardArrowUp /> : <KeyboardArrowDown />}</IconButton>
                </TableCell>
                <TableCell><strong>{app.name}</strong></TableCell>
                <TableCell><Chip label={app.isActive ? 'Active' : 'Inactive'} color={app.isActive ? 'success' : 'error'} size="small" /></TableCell>
                <TableCell>{new Date(app.createdAt).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Button size="small" startIcon={<Key />} onClick={() => { setKeyApp(app); setKeyName(''); setGeneratedKey(''); setKeyModal(true); }}>Generate Key</Button>
                </TableCell>
              </TableRow>
              <TableRow><TableCell colSpan={5} sx={{ p: 0 }}><Collapse in={expanded === app.id}><Box sx={{ p: 2, bgcolor: 'grey.50' }}><Typography variant="body2" color="text.secondary">{app.description || 'No description'}</Typography></Box></Collapse></TableCell></TableRow>
            </React.Fragment>
          ))}
          {apps.length === 0 && <TableRow><TableCell colSpan={5} align="center">No applications</TableCell></TableRow>}
        </TableBody>
      </Table>

      <Dialog open={showRegister} onClose={() => setShowRegister(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Register Application</DialogTitle>
        <DialogContent>
          <TextField label="Name" value={name} onChange={(e) => setName(e.target.value)} fullWidth margin="normal" />
          <TextField label="Description" value={desc} onChange={(e) => setDesc(e.target.value)} fullWidth margin="normal" multiline rows={2} />
        </DialogContent>
        <DialogActions><Button onClick={() => setShowRegister(false)}>Cancel</Button><Button variant="contained" onClick={register}>Register</Button></DialogActions>
      </Dialog>

      <Dialog open={keyModal} onClose={() => setKeyModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Generate API Key — {keyApp?.name}</DialogTitle>
        <DialogContent>
          {generatedKey ? (
            <Box sx={{ p: 2, bgcolor: 'warning.light', borderRadius: 1, mt: 1 }}>
              <Typography variant="body2" color="warning.dark">Save this key now! It won't be shown again.</Typography>
              <TextField value={generatedKey} fullWidth margin="normal" InputProps={{ readOnly: true }} sx={{ fontFamily: 'monospace' }} />
            </Box>
          ) : (
            <>
              <TextField label="Key Name" value={keyName} onChange={(e) => setKeyName(e.target.value)} fullWidth margin="normal" placeholder="production-key" />
              <Button variant="contained" onClick={generateKey} fullWidth sx={{ mt: 1 }}>Generate</Button>
            </>
          )}
        </DialogContent>
        <DialogActions><Button onClick={() => { setKeyModal(false); load(); }}>Close</Button></DialogActions>
      </Dialog>
    </Box>
  );
}
