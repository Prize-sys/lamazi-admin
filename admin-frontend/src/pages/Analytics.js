import React, { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Sidebar from '../components/Sidebar';
import { adminAPI } from '../api';

const REVENUE = [
  {month:'Jan',value:4000},{month:'Feb',value:4500},{month:'Mar',value:4200},{month:'Apr',value:4800},
  {month:'May',value:5100},{month:'Jun',value:5400},{month:'Jul',value:4900},{month:'Aug',value:5600},
  {month:'Sep',value:5200},{month:'Oct',value:5800},{month:'Nov',value:6100},{month:'Dec',value:6400}
];
const BOOKINGS = [
  {month:'Jan',value:40},{month:'Feb',value:42},{month:'Mar',value:45},{month:'Apr',value:48},
  {month:'May',value:44},{month:'Jun',value:50},{month:'Jul',value:48},{month:'Aug',value:52},
  {month:'Sep',value:55},{month:'Oct',value:60},{month:'Nov',value:58},{month:'Dec',value:65}
];
const USER_GROWTH = [
  {month:'Jan',clients:28,therapists:4},{month:'Mar',clients:35,therapists:6},{month:'May',clients:44,therapists:7},
  {month:'Jul',clients:54,therapists:8},{month:'Sep',clients:64,therapists:10},{month:'Nov',clients:74,therapists:12},{month:'Dec',clients:80,therapists:13}
];
const SPECIALTY = [
  {name:'Anxiety',value:29,color:'#6366F1'},{name:'Depression',value:22,color:'#EC4899'},
  {name:'Couples Therapy',value:15,color:'#F59E0B'},{name:'Trauma',value:12,color:'#10B981'},
  {name:'Teen Support',value:8,color:'#3B82F6'},{name:'Other',value:14,color:'#8B5CF6'}
];
const COMPLETION = [{name:'Completed',value:94,color:'#10B981'},{name:'Cancelled',value:2.2,color:'#EF4444'},{name:'No-show',value:1.4,color:'#F59E0B'},{name:'Rescheduled',value:2.4,color:'#6366F1'}];
const TOP_THERAPISTS = [
  {rank:1,name:'Dr. Sarah Johnson',sessions:127,rating:4.9,revenue:10160},
  {rank:2,name:'Dr. Emily Rodriguez',sessions:156,rating:5.0,revenue:17160},
  {rank:3,name:'Michael Chen',sessions:93,rating:4.8,revenue:8835},
  {rank:4,name:'Dr. Priya Patel',sessions:142,rating:4.9,revenue:12070},
  {rank:5,name:'Amanda Foster',sessions:98,rating:4.8,revenue:6860},
];
const RANK_COLORS = ['#F59E0B','#6B7280','#CD7F32','#6366F1','#10B981'];

export default function Analytics() {
  const [loading, setLoading] = useState(true);

  useEffect(() => { setTimeout(() => setLoading(false), 500); }, []);

  return (
    <div className="layout">
      <Sidebar />
      <main className="main">
        <div className="top-bar">
          <h2 style={{ fontSize: 16, fontWeight: 700 }}>Analytics</h2>
        </div>
        <div className="page-content">
          <div className="section-title">Analytics & Reports</div>
          <div className="section-sub">Platform performance and insights</div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 24 }}>
            {[
              {label:'Avg Session Rating',value:'4.8/5',change:'+0.2'},{label:'Client Retention',value:'87%',change:'+5%'},
              {label:'Booking Conversion',value:'73%',change:'+3%'},{label:'Response Time',value:'2.4h',change:'-0.6h'}
            ].map(({label,value,change}) => (
              <div key={label} className="card stat-card">
                <div style={{fontSize:13,color:'var(--gray-500)',marginBottom:8}}>{label}</div>
                <div style={{fontSize:22,fontWeight:700,fontFamily:'Space Grotesk,sans-serif'}}>{value}</div>
                <div style={{fontSize:12,fontWeight:700,color:'#16A34A',marginTop:4}}>↗ {change}</div>
              </div>
            ))}
          </div>

          {loading ? <div className="spinner" /> : (<>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div className="card" style={{ padding: 20 }}>
                <h3 style={{ fontWeight: 700, fontSize: 14, marginBottom: 16 }}>Revenue Trend (12 Months)</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={REVENUE}><CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                    <XAxis dataKey="month" tick={{fontSize:11}} axisLine={false} tickLine={false}/>
                    <YAxis tick={{fontSize:11}} axisLine={false} tickLine={false}/>
                    <Tooltip formatter={v => ['$'+v,'Revenue']}/>
                    <Line type="monotone" dataKey="value" stroke="#10B981" strokeWidth={2.5} dot={{r:3}}/>
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="card" style={{ padding: 20 }}>
                <h3 style={{ fontWeight: 700, fontSize: 14, marginBottom: 16 }}>Bookings Trend (12 Months)</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={BOOKINGS}><CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                    <XAxis dataKey="month" tick={{fontSize:11}} axisLine={false} tickLine={false}/>
                    <YAxis tick={{fontSize:11}} axisLine={false} tickLine={false}/>
                    <Tooltip/><Bar dataKey="value" fill="#3B82F6" radius={[4,4,0,0]}/>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="card" style={{ padding: 20, marginBottom: 16 }}>
              <h3 style={{ fontWeight: 700, fontSize: 14, marginBottom: 16 }}>User Growth</h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={USER_GROWTH}><CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6"/>
                  <XAxis dataKey="month" tick={{fontSize:11}} axisLine={false} tickLine={false}/>
                  <YAxis tick={{fontSize:11}} axisLine={false} tickLine={false}/>
                  <Tooltip/><Legend/>
                  <Line type="monotone" dataKey="clients" stroke="#2563EB" strokeWidth={2} dot={{r:3}} name="Clients"/>
                  <Line type="monotone" dataKey="therapists" stroke="#8B5CF6" strokeWidth={2} dot={{r:3}} name="Therapists"/>
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              {[{title:'Sessions by Specialty',data:SPECIALTY},{title:'Session Completion Rate',data:COMPLETION}].map(({title,data}) => (
                <div key={title} className="card" style={{ padding: 20 }}>
                  <h3 style={{ fontWeight: 700, fontSize: 14, marginBottom: 16 }}>{title}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                    <PieChart width={160} height={160}>
                      <Pie data={data} cx={75} cy={75} innerRadius={40} outerRadius={70} dataKey="value">
                        {data.map((d,i) => <Cell key={i} fill={d.color}/>)}
                      </Pie>
                      <Tooltip formatter={v => [v+'%']}/>
                    </PieChart>
                    <div style={{ flex: 1 }}>
                      {data.map(d => (
                        <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                          <div style={{ width: 10, height: 10, borderRadius: 2, background: d.color, flexShrink: 0 }}/>
                          <span style={{ fontSize: 12, flex: 1 }}>{d.name}</span>
                          <span style={{ fontSize: 12, fontWeight: 700 }}>{d.value}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="card" style={{ padding: 20 }}>
              <h3 style={{ fontWeight: 700, fontSize: 14, marginBottom: 16 }}>Top Performing Therapists</h3>
              <table>
                <thead><tr><th>Rank</th><th>Therapist</th><th>Sessions</th><th>Rating</th><th>Revenue</th></tr></thead>
                <tbody>
                  {TOP_THERAPISTS.map(t => (
                    <tr key={t.rank}>
                      <td><div style={{ width: 28, height: 28, borderRadius: 14, background: RANK_COLORS[t.rank-1], color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700 }}>{t.rank}</div></td>
                      <td style={{ fontWeight: 600, fontSize: 13 }}>{t.name}</td>
                      <td style={{ fontSize: 13 }}>{t.sessions}</td>
                      <td style={{ fontSize: 13 }}>{t.rating} ⭐</td>
                      <td style={{ fontWeight: 700, fontSize: 13 }}>${t.revenue.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>)}
        </div>
      </main>
    </div>
  );
}
