"use client";

import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card } from "@/components/ui/card";
import type { MonthlyPointsPoint, MonthlyMembersPoint } from "@/types";

const tooltipStyle = {
  background: "#1f1c24",
  border: "1px solid #2a2830",
  borderRadius: 8,
  fontSize: 12.5,
  color: "#f3efe4",
};

export function PointsChart({ data }: { data: MonthlyPointsPoint[] }) {
  return (
    <Card className="p-5">
      <h3 className="font-display text-lg text-ivory">Monthly Points Added &amp; Redeemed</h3>
      <div className="mt-4 h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="added" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#c9a24d" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#c9a24d" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="redeemed" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#c06a45" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#c06a45" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#211f27" vertical={false} />
            <XAxis dataKey="month" stroke="#6b6772" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#6b6772" fontSize={12} tickLine={false} axisLine={false} width={40} />
            <Tooltip contentStyle={tooltipStyle} />
            <Area type="monotone" dataKey="added" name="Added" stroke="#e8c874" fill="url(#added)" strokeWidth={2} />
            <Area type="monotone" dataKey="redeemed" name="Redeemed" stroke="#c06a45" fill="url(#redeemed)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-3 flex items-center gap-5 text-[12px] text-mist">
        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-gold-bright" /> Points added</span>
        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-rust" /> Points redeemed</span>
      </div>
    </Card>
  );
}

export function NewMembersChart({ data }: { data: MonthlyMembersPoint[] }) {
  return (
    <Card className="p-5">
      <h3 className="font-display text-lg text-ivory">New Members</h3>
      <div className="mt-4 h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#211f27" vertical={false} />
            <XAxis dataKey="month" stroke="#6b6772" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#6b6772" fontSize={12} tickLine={false} axisLine={false} width={30} allowDecimals={false} />
            <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(201,162,77,0.06)" }} />
            <Bar dataKey="members" name="New members" fill="#c9a24d" radius={[5, 5, 0, 0]} maxBarSize={36} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
