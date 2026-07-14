import React, { useEffect, useState } from 'react';
import { Box, Typography, Tabs, Tab, Table, TableBody, TableCell, TableHead, TableRow, Chip, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import api from '../api/client';

export default function MessagesPage() {
  const [tab, setTab] = useState(0);
  const [data, setData] = useState<any[]>([]);
  const [filter, setFilter] = useState('all');

  const load = () => {
    const endpoint = tab === 0 ? '/whatsapp/messages' : '/email/messages';
    api.get(endpoint, { params: { status: filter === 'all' ? undefined : filter } }).then((r) => setData(r.data?.data || [])).catch(() => {});
  };

  useEffect(() => { load(); }, [tab, filter]);

  const statusColor = (s: string) => s === 'sent' ? 'success' : s === 'failed' ? 'error' : s === 'pending' ? 'warning' : s === 'queued' ? 'info' : 'default';

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Pesan</Typography>
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label="WhatsApp" /><Tab label="Email" />
      </Tabs>
      <FormControl size="small" sx={{ mb: 2, minWidth: 120 }}>
        <InputLabel>Status</InputLabel>
        <Select value={filter} label="Status" onChange={(e) => setFilter(e.target.value)}>
          <MenuItem value="all">All</MenuItem>
          <MenuItem value="sent">Sent</MenuItem>
          <MenuItem value="pending">Pending</MenuItem>
          <MenuItem value="failed">Failed</MenuItem>
        </Select>
      </FormControl>
      <Table size="small">
        <TableHead><TableRow><TableCell>To</TableCell><TableCell>Message</TableCell><TableCell>Status</TableCell><TableCell>Error</TableCell><TableCell>Date</TableCell></TableRow></TableHead>
        <TableBody>
          {data.map((m) => (
            <TableRow key={m.id}>
              <TableCell>{m.toNumber || m.to}</TableCell>
              <TableCell sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.message || m.body}</TableCell>
              <TableCell><Chip label={m.status} color={statusColor(m.status) as any} size="small" /></TableCell>
              <TableCell sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'error.main', fontSize: 12 }}>{m.error || '-'}</TableCell>
              <TableCell>{new Date(m.createdAt).toLocaleString()}</TableCell>
            </TableRow>
          ))}
          {data.length === 0 && <TableRow><TableCell colSpan={5} align="center">No messages</TableCell></TableRow>}
        </TableBody>
      </Table>
    </Box>
  );
}
