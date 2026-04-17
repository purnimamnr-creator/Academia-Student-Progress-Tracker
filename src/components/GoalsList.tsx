import React, { useState } from 'react';
import { useAuth } from '../lib/AuthContext';
import { addGoal, updateGoal } from '../lib/db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Target, Plus, CheckCircle2, Clock } from 'lucide-react';
import { GOAL_UNITS } from '../constants';
import { format } from 'date-fns';
import { toast } from 'sonner';

export function GoalsList() {
  const { user, goals, selectedStudentId, refreshData } = useAuth();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newGoal, setNewGoal] = useState({
    title: '',
    targetValue: '',
    unit: GOAL_UNITS[0],
    targetDate: format(new Date(), 'yyyy-MM-dd'),
  });

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId || !user) return;
    
    try {
      await addGoal(user.uid, selectedStudentId, {
        title: newGoal.title,
        targetValue: Number(newGoal.targetValue),
        currentValue: 0,
        unit: newGoal.unit,
        targetDate: newGoal.targetDate,
        status: 'in-progress'
      });
      refreshData();
      setIsAddOpen(false);
      setNewGoal({
        title: '',
        targetValue: '',
        unit: GOAL_UNITS[0],
        targetDate: format(new Date(), 'yyyy-MM-dd'),
      });
      toast.success('Goal set!');
    } catch (error) {
      toast.error('Failed to set goal.');
    }
  };

  const handleComplete = async (id: string) => {
    try {
      await updateGoal(id, { status: 'completed', currentValue: 100 });
      refreshData();
      toast.success('Goal achieved! Great job!');
    } catch (error) {
      toast.error('Failed to update goal.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-extrabold text-text-dark">Academic Goals</h2>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger render={
            <Button className="bg-accent-2 hover:bg-accent-2/90 rounded-xl">
              <Plus className="h-4 w-4 mr-2" /> Set New Goal
            </Button>
          } />
          <DialogContent className="rounded-[24px]">
            <DialogHeader>
              <DialogTitle className="text-xl font-extrabold">Set Academic Goal</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAdd} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label className="font-bold text-text-dark">Goal Title</Label>
                <Input 
                  placeholder="e.g. Achieve 90% in Math Exam" 
                  className="rounded-xl"
                  value={newGoal.title}
                  onChange={e => setNewGoal({...newGoal, title: e.target.value})}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-bold text-text-dark">Target Value</Label>
                  <Input 
                    type="number" 
                    className="rounded-xl"
                    value={newGoal.targetValue}
                    onChange={e => setNewGoal({...newGoal, targetValue: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold text-text-dark">Unit</Label>
                  <Select 
                    value={newGoal.unit} 
                    onValueChange={(v) => setNewGoal({...newGoal, unit: v})}
                  >
                    <SelectTrigger className="rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {GOAL_UNITS.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="font-bold text-text-dark">Target Date</Label>
                <Input 
                  type="date" 
                  className="rounded-xl"
                  value={newGoal.targetDate}
                  onChange={e => setNewGoal({...newGoal, targetDate: e.target.value})}
                  required
                />
              </div>
              <Button type="submit" className="w-full bg-accent-2 rounded-xl font-bold py-6">Set Goal</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {goals.map((goal) => {
          const progress = (goal.currentValue / goal.targetValue) * 100;
          const isCompleted = goal.status === 'completed';

          return (
            <div key={goal.id} className="vibrant-card">
              <div className="flex items-start justify-between mb-6">
                <div className={`p-3 rounded-2xl ${isCompleted ? 'bg-green-100 text-green-600' : 'bg-pink-100 text-pink-600'}`}>
                  <Target className="h-6 w-6" />
                </div>
                <Badge variant={isCompleted ? 'default' : 'secondary'} className={`rounded-lg font-bold text-[10px] ${isCompleted ? 'bg-green-600' : ''}`}>
                  {isCompleted ? 'Completed' : 'In Progress'}
                </Badge>
              </div>
              
              <h3 className="font-extrabold text-text-dark text-lg mb-4">{goal.title}</h3>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm font-bold text-text-dark">
                  <span>Progress</span>
                  <span>{progress.toFixed(0)}%</span>
                </div>
                <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${isCompleted ? 'bg-green-500' : 'bg-accent-2'}`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-text-light font-bold">
                  <span>{goal.currentValue} / {goal.targetValue} {goal.unit}</span>
                  <span>Due {format(new Date(goal.targetDate), 'MMM dd, yyyy')}</span>
                </div>
              </div>

              {!isCompleted && (
                <Button 
                  className="w-full bg-primary rounded-xl font-bold py-4"
                  onClick={() => handleComplete(goal.id)}
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" /> Mark Complete
                </Button>
              )}
            </div>
          );
        })}
        {goals.length === 0 && (
          <div className="col-span-full text-center py-16 bg-white rounded-[24px] border-2 border-dashed border-slate-100">
            <Target className="h-16 w-16 text-slate-100 mx-auto mb-4" />
            <p className="text-text-light font-bold">No goals set yet. What do you want to achieve this term?</p>
          </div>
        )}
      </div>
    </div>
  );
}
