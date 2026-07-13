import React, { useEffect, useState } from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableHead, TableRow, Chip, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import api from '../api/client';

export default function NotificationsPage() {
  const [data, setData] = useState<any[]>([]);
  const [channel, setChannel] = useState('all');

  const load = () => {
    api.get('/notification/list', { params: { limit: 100 } }).then((r) => {
      const list = r.data?.data || [];
      setData(channel === 'all' ? list : list.filter((n: any) => n.channel === channel));
    }).catch(() => {});
  };

  useEffect(() => { load(); }, [channel]);

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Notifikasi</Typography>
      <FormControl size="small" sx={{ mb: 2, minWidth: 120 }}>
        <InputLabel>Channel</InputLabel>
        <Select value={channel} label="Channel" onChange={(e) => setChannel(e.target.value)}>
          <MenuItem value="all">All</MenuItem>
          <MenuItem value="whatsapp">WhatsApp</MenuItem>
          <MenuItem value="email">Email</MenuItem>
        </Select>
      </FormControl>
      <Table size="small">
        <TableHead><TableRow><TableCell>Channel</TableCell><TableCell>Recipient</TableCell><TableCell>Title</TableCell><TableCell>Status</TableCell><TableCell>Date</TableCell></TableRow></TableHead>
        <TableBody>
          {data.map((n) => (
            <TableRow key={n.id}>
              <TableCell><Chip label={n.channel} size="small" color={n.channel === 'whatsapp' ? 'success' : 'primary'} /></TableCell>
              <TableCell>{n.recipient}</TableCell>
              <TableCell>{n.title}</TableCell>
              <TableCell><Chip label={n.status} size="small" color={n.status === 'sent' ? 'success' : 'warning'} /></TableCell>
              <TableCell>{new Date(n.createdAt).toLocaleString()}</TableCell>
            </TableRow>
          ))}
          {data.length === 0 && <TableRow><TableCell colSpan={5} align="center">No notifications</TableCell></TableRow>}
        </TableBody>
      </Table>
    </Box>
  );
}
