import React, { useEffect, useState } from 'react';
import { Box, Typography, Tabs, Tab, Table, TableBody, TableCell, TableHead, TableRow, Chip, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import api from '../api/client';

export default function LogsPage() {
  const [tab, setTab] = useState(0);
  const [data, setData] = useState<any[]>([]);
  const [level, setLevel] = useState('all');

  const load = () => {
    const endpoint = tab === 0 ? '/system/logs' : '/system/api-logs';
    api.get(endpoint, { params: { level: level === 'all' ? undefined : level, limit: 100 } }).then((r) => setData(r.data?.data || [])).catch(() => {});
  };

  useEffect(() => { load(); }, [tab, level]);

  const levelColor = (l: string) => l === 'error' ? 'error' : l === 'warn' ? 'warning' : l === 'info' ? 'info' : 'default';

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Logs</Typography>
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label="System Logs" /><Tab label="API Logs" />
      </Tabs>
      {tab === 0 && (
        <FormControl size="small" sx={{ mb: 2, minWidth: 120 }}>
          <InputLabel>Level</InputLabel><Select value={level} label="Level" onChange={(e) => setLevel(e.target.value)}>
            <MenuItem value="all">All</MenuItem><MenuItem value="error">Error</MenuItem><MenuItem value="warn">Warning</MenuItem><MenuItem value="info">Info</MenuItem>
          </Select></FormControl>
      )}
      <Table size="small">
        <TableHead><TableRow>
          {tab === 0 ? <><TableCell>Level</TableCell><TableCell>Module</TableCell><TableCell>Message</TableCell><TableCell>Date</TableCell></> : <><TableCell>Method</TableCell><TableCell>Path</TableCell><TableCell>Status</TableCell><TableCell>Duration</TableCell><TableCell>Date</TableCell></>}
        </TableRow></TableHead>
        <TableBody>
          {data.map((l) => tab === 0 ? (
            <TableRow key={l.id}>
              <TableCell><Chip label={l.level} size="small" color={levelColor(l.level) as any} /></TableCell>
              <TableCell>{l.module}</TableCell>
              <TableCell sx={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.message}</TableCell>
              <TableCell>{new Date(l.createdAt).toLocaleString()}</TableCell>
            </TableRow>
          ) : (
            <TableRow key={l.id}>
              <TableCell><Chip label={l.method} size="small" variant="outlined" /></TableCell>
              <TableCell>{l.path}</TableCell>
              <TableCell><Chip label={l.statusCode} size="small" color={l.statusCode >= 400 ? 'error' : 'success'} /></TableCell>
              <TableCell>{l.duration}ms</TableCell>
              <TableCell>{new Date(l.createdAt).toLocaleString()}</TableCell>
            </TableRow>
          ))}
          {data.length === 0 && <TableRow><TableCell colSpan={tab === 0 ? 4 : 5} align="center">No logs</TableCell></TableRow>}
        </TableBody>
      </Table>
    </Box>
  );
}
