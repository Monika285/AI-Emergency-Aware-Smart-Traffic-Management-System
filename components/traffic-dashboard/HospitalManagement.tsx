'use client';

import React, { useState } from 'react';
import { useTraffic } from '@/context/TrafficContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { AlertCircle, Plus, Trash2, Send, CheckCircle, Clock } from 'lucide-react';

export const HospitalManagement: React.FC = () => {
  const { hospitals, addHospital, deleteHospital, sendSMS, smsHistory } = useTraffic();
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '', location: '', distance: 0 });

  const handleAddHospital = () => {
    if (formData.name && formData.phone && formData.location) {
      addHospital({
        name: formData.name,
        phone: formData.phone,
        location: formData.location,
        distance: formData.distance,
      });
      setFormData({ name: '', phone: '', location: '', distance: 0 });
      setShowAddForm(false);
    }
  };

  const handleSendSMS = (hospitalId: string) => {
    const hospital = hospitals.find((h) => h.id === hospitalId);
    if (hospital) {
      const message = `EMERGENCY ALERT: Accident detected at Park Street Junction. Emergency ambulance dispatched. Response ETA: 5-8 minutes.`;
      sendSMS(hospitalId, message);
      console.log('[v0] SMS sent to:', hospital.phone, 'Message:', message);
    }
  };

  const getSMSStatus = (hospitalId: string) => {
    const records = smsHistory.filter((sms) => sms.hospitalId === hospitalId);
    if (records.length === 0) return null;
    return records[0];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-500/10 rounded-lg border border-red-500/20">
            <AlertCircle className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">Hospital Management & SMS</h2>
            <p className="text-sm text-muted-foreground">Manage emergency hospital contacts and send SMS alerts</p>
          </div>
        </div>
        <Button onClick={() => setShowAddForm(true)} className="gap-2" variant="default">
          <Plus className="w-4 h-4" />
          Add Hospital
        </Button>
      </div>

      {/* Add Hospital Form */}
      {showAddForm && (
        <Card className="p-6 border border-border/50 bg-secondary/20">
          <h3 className="text-lg font-semibold text-foreground mb-4">Add New Hospital</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <Input
              placeholder="Hospital Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="bg-input border-border/50 text-foreground placeholder:text-muted-foreground"
            />
            <Input
              placeholder="Phone Number (e.g., +919876543210 or +14155552671)"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="bg-input border-border/50 text-foreground placeholder:text-muted-foreground"
              type="tel"
            />
            <Input
              placeholder="Location (e.g., 2 km away)"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="bg-input border-border/50 text-foreground placeholder:text-muted-foreground"
            />
            <Input
              type="number"
              placeholder="Distance (km)"
              value={formData.distance || ''}
              onChange={(e) => setFormData({ ...formData, distance: e.target.value ? parseFloat(e.target.value) : 0 })}
              className="bg-input border-border/50 text-foreground placeholder:text-muted-foreground"
            />
          </div>
          <div className="flex gap-3">
            <Button onClick={handleAddHospital} className="flex-1">
              Add Hospital
            </Button>
            <Button onClick={() => setShowAddForm(false)} variant="outline" className="flex-1">
              Cancel
            </Button>
          </div>
        </Card>
      )}

      {/* Hospital List */}
      <div className="grid grid-cols-1 gap-4">
        {hospitals.map((hospital) => {
          const smsStatus = getSMSStatus(hospital.id);
          return (
            <Card
              key={hospital.id}
              className="p-4 border border-border/50 hover:border-cyan-500/30 hover:bg-cyan-500/5 transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="text-lg font-semibold text-foreground">{hospital.name}</h4>
                  <p className="text-sm text-cyan-400 font-mono mt-1">{hospital.phone}</p>
                  <p className="text-xs text-muted-foreground mt-2">{hospital.location}</p>
                </div>

                <div className="flex items-center gap-2">
                  {smsStatus && (
                    <div
                      className={`flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-semibold ${
                        smsStatus.status === 'delivered'
                          ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}
                    >
                      {smsStatus.status === 'delivered' ? (
                        <>
                          <CheckCircle className="w-3 h-3" />
                          Delivered
                        </>
                      ) : (
                        <>
                          <Clock className="w-3 h-3 animate-spin" />
                          Sending...
                        </>
                      )}
                    </div>
                  )}

                  <Button
                    onClick={() => handleSendSMS(hospital.id)}
                    size="sm"
                    className="gap-2"
                    variant={smsStatus?.status === 'delivered' ? 'outline' : 'default'}
                  >
                    <Send className="w-4 h-4" />
                    {smsStatus?.status === 'delivered' ? 'Sent' : 'Send SMS'}
                  </Button>

                  <Button
                    onClick={() => deleteHospital(hospital.id)}
                    size="sm"
                    variant="destructive"
                    className="gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* SMS History */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">SMS History</h3>
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {smsHistory.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No SMS records yet. Send your first emergency alert!
            </div>
          ) : (
            smsHistory.map((sms) => (
              <div
                key={sms.id}
                className="p-3 rounded-lg border border-border/50 bg-secondary/20 hover:bg-secondary/30 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{sms.hospitalName}</p>
                    <p className="text-xs text-cyan-400 font-mono">{sms.timestamp}</p>
                  </div>
                  <div
                    className={`text-xs font-semibold px-2 py-1 rounded ${
                      sms.status === 'delivered'
                        ? 'bg-green-500/10 text-green-400'
                        : sms.status === 'pending'
                          ? 'bg-amber-500/10 text-amber-400'
                          : 'bg-red-500/10 text-red-400'
                    }`}
                  >
                    {sms.status.toUpperCase()}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground break-words mb-1">{sms.message}</p>
                <p className="text-xs text-muted-foreground">{sms.timestamp}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
