import React, { useEffect, useState } from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableHead, TableRow, Chip, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import api from '../api/client';

export default function WebhooksPage() {
  const [data, setData] = useState<any[]>([]);
  const [source, setSource] = useState('all');

  const load = () => {
    api.get('/webhook', { params: { limit: 100 } }).then((r) => {
      const list = r.data?.data || [];
      setData(source === 'all' ? list : list.filter((w: any) => w.source === source));
    }).catch(() => {});
  };

  useEffect(() => { load(); }, [source]);

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Webhook Events</Typography>
      <FormControl size="small" sx={{ mb: 2, minWidth: 150 }}>
        <InputLabel>Source</InputLabel>
        <Select value={source} label="Source" onChange={(e) => setSource(e.target.value)}>
          <MenuItem value="all">All</MenuItem>
          <MenuItem value="exploreride">ExploreRide</MenuItem>
          <MenuItem value="school">Sekolah</MenuItem>
          <MenuItem value="wedding">Wedding</MenuItem>
          <MenuItem value="gis">GIS Apotek</MenuItem>
        </Select>
      </FormControl>
      <Table size="small">
        <TableHead><TableRow><TableCell>Event</TableCell><TableCell>Source</TableCell><TableCell>App ID</TableCell><TableCell>Status</TableCell><TableCell>Date</TableCell></TableRow></TableHead>
        <TableBody>
          {data.map((w) => (
            <TableRow key={w.id}>
              <TableCell><Chip label={w.event} size="small" color="primary" variant="outlined" /></TableCell>
              <TableCell>{w.source}</TableCell>
              <TableCell>{w.applicationId || '-'}</TableCell>
              <TableCell><Chip label={w.status} size="small" color={w.status === 'processing' ? 'info' : w.status === 'received' ? 'success' : 'error'} /></TableCell>
              <TableCell>{new Date(w.createdAt).toLocaleString()}</TableCell>
            </TableRow>
          ))}
          {data.length === 0 && <TableRow><TableCell colSpan={5} align="center">No webhooks</TableCell></TableRow>}
        </TableBody>
      </Table>
    </Box>
  );
}
