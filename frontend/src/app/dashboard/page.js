"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/PageHeader";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardOverview() {
  const { data: partsRes, isLoading: partsLoading } = useQuery({ queryKey: ['parts'], queryFn: () => api.get("/parts").then(res => res.data.data) });
  const { data: configsRes, isLoading: configsLoading } = useQuery({ queryKey: ['configurations'], queryFn: () => api.get("/configurations").then(res => res.data.data) });
  const { data: catRes, isLoading: catLoading } = useQuery({ queryKey: ['categories'], queryFn: () => api.get("/categories").then(res => res.data.data) });

  const loading = partsLoading || configsLoading || catLoading;

  const stats = {
    parts: partsRes ? partsRes.length : 0,
    configurations: configsRes ? configsRes.length : 0,
    categories: catRes ? catRes.length : 0
  };

  const recentConfigs = configsRes 
    ? [...configsRes].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5)
    : [];

  return (
    <>
      <PageHeader 
        title="Command Center" 
        actionButton={
          <div className="flex gap-3">
            <Link href="/dashboard/parts">
              <Button variant="secondary">📦 Add Part</Button>
            </Link>
            <Link href="/dashboard/configurations">
              <Button>⚡ Build Configuration</Button>
            </Link>
          </div>
        } 
      />

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Configurations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-primary">{loading ? "-" : stats.configurations}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Parts Inventory</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{loading ? "-" : stats.parts}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Active Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{loading ? "-" : stats.categories}</div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Configurations */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium tracking-tight">Recent Builds</h2>
          <Link href="/dashboard/configurations" className="text-sm text-primary hover:underline font-medium">
            View All →
          </Link>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Creator</TableHead>
                <TableHead>Date Built</TableHead>
                <TableHead className="text-right">Total Price</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={4} className="h-24 text-center">Loading...</TableCell></TableRow>
              ) : recentConfigs.length === 0 ? (
                <TableRow><TableCell colSpan={4} className="h-24 text-center">No configurations built yet.</TableCell></TableRow>
              ) : (
                recentConfigs.map((config) => (
                  <TableRow key={config.id}>
                    <TableCell>
                      <p className="font-medium">{config.name}</p>
                      {config.description && <p className="text-xs text-muted-foreground mt-0.5">{config.description}</p>}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{config.creator?.name || "Unknown"}</TableCell>
                    <TableCell className="text-muted-foreground">{new Date(config.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right font-medium text-primary">
                      ₹{(config.totalPrice / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  );
}
