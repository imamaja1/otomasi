import React, { useEffect, useState } from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableHead, TableRow, Chip } from '@mui/material';
import api from '../api/client';

export default function AiPage() {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    api.get('/ai/list').then((r) => setData(r.data?.data || [])).catch(() => {});
  }, []);

  return (
    <Box>
      <Typography variant="h5" gutterBottom>AI Requests</Typography>
      <Table size="small">
        <TableHead><TableRow><TableCell>Type</TableCell><TableCell>Model</TableCell><TableCell>Input</TableCell><TableCell>Date</TableCell></TableRow></TableHead>
        <TableBody>
          {data.map((a) => (
            <TableRow key={a.id}>
              <TableCell><Chip label={a.type} size="small" /></TableCell>
              <TableCell>{a.model || '-'}</TableCell>
              <TableCell sx={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{JSON.stringify(a.input)}</TableCell>
              <TableCell>{new Date(a.createdAt).toLocaleString()}</TableCell>
            </TableRow>
          ))}
          {data.length === 0 && <TableRow><TableCell colSpan={4} align="center">No AI requests</TableCell></TableRow>}
        </TableBody>
      </Table>
    </Box>
  );
}
