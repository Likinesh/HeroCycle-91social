"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/PageHeader";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardOverview() {
  const [stats, setStats] = useState({ parts: 0, configurations: 0, categories: 0 });
  const [recentConfigs, setRecentConfigs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [partsRes, configsRes, catRes] = await Promise.all([
          api.get("/parts"),
          api.get("/configurations"),
          api.get("/categories")
        ]);
        
        setStats({
          parts: partsRes.data.data.length,
          configurations: configsRes.data.data.length,
          categories: catRes.data.data.length
        });

        // Top 5 most recent configurations
        const sortedConfigs = configsRes.data.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setRecentConfigs(sortedConfigs.slice(0, 5));
      } catch (err) {
        console.error("Failed to fetch dashboard data", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

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
