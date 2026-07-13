import React, { useEffect, useState } from 'react';
import { Grid, Card, CardContent, Typography, Table, TableBody, TableCell, TableHead, TableRow, Chip, Box } from '@mui/material';
import { Dashboard as DashIcon, WhatsApp, Apps, Today } from '@mui/icons-material';
import api from '../api/client';

interface Stats {
  database: { tables: Record<string, number>; totalRecords: number };
  today: { messages: number; emails: number; webhooks: number };
  memory: { heapUsed: number; heapTotal: number };
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [metrics, setMetrics] = useState<any>(null);

  useEffect(() => {
    api.get('/system/stats').then((r) => setStats(r.data)).catch(() => {});
    api.get('/system/metrics').then((r) => setMetrics(r.data)).catch(() => {});
  }, []);

  const statCards = [
    { label: 'Apps', value: stats?.database?.tables?.applications || 0, icon: <Apps />, color: '#1976d2' },
    { label: 'Pesan Hari Ini', value: stats?.today?.messages || 0, icon: <WhatsApp />, color: '#388e3c' },
    { label: 'Webhook Hari Ini', value: stats?.today?.webhooks || 0, icon: <Today />, color: '#f57c00' },
    { label: 'Total Records', value: stats?.database?.totalRecords || 0, icon: <DashIcon />, color: '#7b1fa2' },
  ];

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Dashboard</Typography>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {statCards.map((card) => (
          <Grid item xs={12} sm={6} md={3} key={card.label}>
            <Card>
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ color: card.color }}>{card.icon}</Box>
                <Box>
                  <Typography variant="h4">{card.value}</Typography>
                  <Typography variant="body2" color="text.secondary">{card.label}</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      {metrics && (
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="subtitle1" gutterBottom>System</Typography>
            <Typography variant="body2">Uptime: {Math.floor(metrics.uptime / 60)} min · Node {metrics.version} · Memory: {metrics.memory?.heapUsedMB}MB / {metrics.memory?.heapTotalMB}MB</Typography>
            <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
              <Chip label={`DB: ${metrics.services?.database}`} color={metrics.services?.database === 'up' ? 'success' : 'error'} size="small" />
              <Chip label={`Redis: ${metrics.services?.redis}`} color={metrics.services?.redis === 'up' ? 'success' : 'error'} size="small" />
            </Box>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}
