import React, { useState } from 'react';
import { useAuth } from '../lib/AuthContext';
import { addMerit } from '../lib/db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Trophy, Plus, Calendar } from 'lucide-react';
import { MERIT_CATEGORIES } from '../constants';
import { format } from 'date-fns';
import { toast } from 'sonner';

export function MeritsList() {
  const { user, merits, selectedStudentId, refreshData } = useAuth();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newMerit, setNewMerit] = useState({
    title: '',
    category: 'academic' as const,
    date: format(new Date(), 'yyyy-MM-dd'),
    description: ''
  });

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId || !user) return;
    
    try {
      await addMerit(user.uid, selectedStudentId, newMerit);
      refreshData();
      setIsAddOpen(false);
      setNewMerit({
        title: '',
        category: 'academic',
        date: format(new Date(), 'yyyy-MM-dd'),
        description: ''
      });
      toast.success('Merit recorded!');
    } catch (error) {
      toast.error('Failed to add merit.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-extrabold text-text-dark">Merits & Achievements</h2>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger render={
            <Button className="bg-emerald-600 hover:bg-emerald-700 rounded-xl">
              <Plus className="h-4 w-4 mr-2" /> Record Merit
            </Button>
          } />
          <DialogContent className="rounded-[24px]">
            <DialogHeader>
              <DialogTitle className="text-xl font-extrabold">Record New Merit</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAdd} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label className="font-bold text-text-dark">Title</Label>
                <Input 
                  placeholder="e.g. Perfect Attendance, Science Fair Winner" 
                  className="rounded-xl"
                  value={newMerit.title}
                  onChange={e => setNewMerit({...newMerit, title: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="font-bold text-text-dark">Category</Label>
                <Select 
                  value={newMerit.category} 
                  onValueChange={(v: any) => setNewMerit({...newMerit, category: v})}
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MERIT_CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="font-bold text-text-dark">Date</Label>
                <Input 
                  type="date" 
                  className="rounded-xl"
                  value={newMerit.date}
                  onChange={e => setNewMerit({...newMerit, date: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="font-bold text-text-dark">Description</Label>
                <Input 
                  placeholder="Optional details..." 
                  className="rounded-xl"
                  value={newMerit.description}
                  onChange={e => setNewMerit({...newMerit, description: e.target.value})}
                />
              </div>
              <Button type="submit" className="w-full bg-emerald-600 rounded-xl font-bold py-6">Save Merit</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {merits.map((merit) => (
          <div key={merit.id} className="vibrant-card hover:shadow-lg transition-all duration-300 group">
            <div className="flex items-start justify-between mb-4">
              <div className="bg-emerald-100 p-3 rounded-2xl group-hover:scale-110 transition-transform">
                <Trophy className="h-6 w-6 text-emerald-600" />
              </div>
              <Badge variant="secondary" className="capitalize rounded-lg font-bold text-[10px] px-2">
                {merit.category}
              </Badge>
            </div>
            <h3 className="font-extrabold text-text-dark text-lg mb-1">{merit.title}</h3>
            <p className="text-sm text-text-light mb-6 font-medium leading-relaxed">{merit.description}</p>
            <div className="flex items-center text-xs text-text-light font-bold">
              <Calendar className="h-3.5 w-3.5 mr-1.5" />
              {format(new Date(merit.date), 'MMMM dd, yyyy')}
            </div>
          </div>
        ))}
        {merits.length === 0 && (
          <div className="col-span-full text-center py-16 bg-white rounded-[24px] border-2 border-dashed border-slate-100">
            <Trophy className="h-16 w-16 text-slate-100 mx-auto mb-4" />
            <p className="text-text-light font-bold">No merits recorded yet. Keep up the great work!</p>
          </div>
        )}
      </div>
    </div>
  );
}
