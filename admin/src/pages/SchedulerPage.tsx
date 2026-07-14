import React, { useEffect, useState } from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableHead, TableRow, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Select, MenuItem, FormControl, InputLabel, Chip, IconButton } from '@mui/material';
import { Add, Delete, Refresh } from '@mui/icons-material';
import api from '../api/client';

export default function SchedulerPage() {
  const [data, setData] = useState<any[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState('');
  const [cron, setCron] = useState('');
  const [jobType, setJobType] = useState('notification');
  const [jobData, setJobData] = useState('{}');

  const load = async () => {
    try { const r = await api.get('/scheduler/list'); setData(r.data?.data || r.data || []); } catch {}
  };

  useEffect(() => { load(); }, []);

  const addSchedule = async () => {
    try {
      JSON.parse(jobData);
      await api.post('/scheduler', { name, cronExpression: cron, jobType, jobData: JSON.parse(jobData) });
      setShowAdd(false); setName(''); setCron(''); setJobData('{}'); load();
    } catch (e: any) { alert(e.response?.data?.error || 'Invalid JSON in jobData'); }
  };

  const deleteSchedule = async (id: number) => {
    if (!confirm('Delete this schedule?')) return;
    await api.delete(`/scheduler/${id}`);
    load();
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography variant="h5">Scheduler</Typography>
        <Box><IconButton onClick={load}><Refresh /></IconButton><Button variant="contained" startIcon={<Add />} onClick={() => setShowAdd(true)}>Tambah Cron</Button></Box>
      </Box>
      <Table size="small">
        <TableHead><TableRow><TableCell>Name</TableCell><TableCell>Cron</TableCell><TableCell>Type</TableCell><TableCell>Active</TableCell><TableCell>Last Run</TableCell><TableCell></TableCell></TableRow></TableHead>
        <TableBody>
          {data.map((s) => (
            <TableRow key={s.id}>
              <TableCell>{s.name}</TableCell>
              <TableCell><Chip label={s.cronExpression} size="small" variant="outlined" /></TableCell>
              <TableCell><Chip label={s.jobType} size="small" color="primary" /></TableCell>
              <TableCell><Chip label={s.isActive ? 'Yes' : 'No'} size="small" color={s.isActive ? 'success' : 'default'} /></TableCell>
              <TableCell>{s.lastRunAt ? new Date(s.lastRunAt).toLocaleString() : '-'}</TableCell>
              <TableCell><IconButton size="small" onClick={() => deleteSchedule(s.id)}><Delete fontSize="small" /></IconButton></TableCell>
            </TableRow>
          ))}
          {data.length === 0 && <TableRow><TableCell colSpan={6} align="center">No schedules</TableCell></TableRow>}
        </TableBody>
      </Table>

      <Dialog open={showAdd} onClose={() => setShowAdd(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Tambah Schedule</DialogTitle>
        <DialogContent>
          <TextField label="Name" value={name} onChange={(e) => setName(e.target.value)} fullWidth margin="normal" />
          <TextField label="Cron Expression" value={cron} onChange={(e) => setCron(e.target.value)} fullWidth margin="normal" placeholder="0 8 * * *" />
          <FormControl fullWidth margin="normal"><InputLabel>Job Type</InputLabel><Select value={jobType} label="Job Type" onChange={(e) => setJobType(e.target.value)}>
            <MenuItem value="notification">Notification</MenuItem><MenuItem value="whatsapp">WhatsApp</MenuItem><MenuItem value="email">Email</MenuItem>
          </Select></FormControl>
          <TextField label="Job Data (JSON)" value={jobData} onChange={(e) => setJobData(e.target.value)} fullWidth margin="normal" multiline rows={3} />
        </DialogContent>
        <DialogActions><Button onClick={() => setShowAdd(false)}>Cancel</Button><Button variant="contained" onClick={addSchedule}>Create</Button></DialogActions>
      </Dialog>
    </Box>
  );
}
