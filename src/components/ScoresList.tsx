import React, { useState } from 'react';
import { useAuth } from '../lib/AuthContext';
import { addScore, deleteScore } from '../lib/db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, TrendingUp } from 'lucide-react';
import { SUBJECTS } from '../constants';
import { format } from 'date-fns';
import { toast } from 'sonner';

export function ScoresList() {
  const { user, scores, selectedStudentId, refreshData } = useAuth();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newScore, setNewScore] = useState({
    subject: '',
    score: '',
    maxScore: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    type: 'test' as const,
    notes: ''
  });

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId || !user) return;
    
    try {
      await addScore(user.uid, selectedStudentId, {
        subject: newScore.subject,
        score: Number(newScore.score),
        maxScore: Number(newScore.maxScore),
        date: newScore.date,
        type: newScore.type,
        notes: newScore.notes
      });
      refreshData();
      setIsAddOpen(false);
      setNewScore({
        subject: '',
        score: '',
        maxScore: '',
        date: format(new Date(), 'yyyy-MM-dd'),
        type: 'test',
        notes: ''
      });
      toast.success('Score added successfully!');
    } catch (error) {
      toast.error('Failed to add score.');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteScore(id);
      refreshData();
      toast.success('Score deleted.');
    } catch (error) {
      toast.error('Failed to delete.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-extrabold text-text-dark">Academic Scores</h2>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger render={
            <Button className="bg-primary hover:bg-primary/90 rounded-xl">
              <Plus className="h-4 w-4 mr-2" /> Add Score
            </Button>
          } />
          <DialogContent className="rounded-[24px]">
            <DialogHeader>
              <DialogTitle className="text-xl font-extrabold">Add New Score</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAdd} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label className="font-bold text-text-dark">Subject</Label>
                <Select 
                  value={newScore.subject} 
                  onValueChange={(v) => setNewScore({...newScore, subject: v})}
                  required
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {SUBJECTS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-bold text-text-dark">Score</Label>
                  <Input 
                    type="number" 
                    className="rounded-xl"
                    value={newScore.score} 
                    onChange={e => setNewScore({...newScore, score: e.target.value})} 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold text-text-dark">Max Score</Label>
                  <Input 
                    type="number" 
                    className="rounded-xl"
                    value={newScore.maxScore} 
                    onChange={e => setNewScore({...newScore, maxScore: e.target.value})} 
                    required 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="font-bold text-text-dark">Date</Label>
                <Input 
                  type="date" 
                  className="rounded-xl"
                  value={newScore.date} 
                  onChange={e => setNewScore({...newScore, date: e.target.value})} 
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label className="font-bold text-text-dark">Type</Label>
                <Select 
                  value={newScore.type} 
                  onValueChange={(v: any) => setNewScore({...newScore, type: v})}
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="test">Test</SelectItem>
                    <SelectItem value="assignment">Assignment</SelectItem>
                    <SelectItem value="exam">Exam</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full bg-primary rounded-xl font-bold py-6">Save Score</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="vibrant-card overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-slate-100">
                <TableHead className="text-text-light font-extrabold uppercase text-[11px] tracking-wider whitespace-nowrap">Date</TableHead>
                <TableHead className="text-text-light font-extrabold uppercase text-[11px] tracking-wider whitespace-nowrap">Subject</TableHead>
                <TableHead className="text-text-light font-extrabold uppercase text-[11px] tracking-wider whitespace-nowrap">Type</TableHead>
                <TableHead className="text-text-light font-extrabold uppercase text-[11px] tracking-wider whitespace-nowrap">Score</TableHead>
                <TableHead className="text-text-light font-extrabold uppercase text-[11px] tracking-wider whitespace-nowrap">Percentage</TableHead>
                <TableHead className="text-right text-text-light font-extrabold uppercase text-[11px] tracking-wider whitespace-nowrap">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {scores.map((score) => {
                const percentage = (score.score / score.maxScore) * 100;
                const scoreClass = percentage >= 90 ? 'bg-green-100 text-green-800' : percentage >= 80 ? 'bg-yellow-100 text-yellow-800' : 'bg-slate-100 text-slate-800';
                return (
                  <TableRow key={score.id} className="border-slate-50 hover:bg-slate-50/50">
                    <TableCell className="font-bold text-text-dark whitespace-nowrap">{format(new Date(score.date), 'MMM dd, yyyy')}</TableCell>
                    <TableCell className="font-medium text-text-dark whitespace-nowrap">{score.subject}</TableCell>
                    <TableCell className="whitespace-nowrap">
                      <Badge variant="secondary" className="capitalize rounded-lg font-bold text-[10px]">{score.type}</Badge>
                    </TableCell>
                    <TableCell className="font-medium text-text-dark whitespace-nowrap">{score.score} / {score.maxScore}</TableCell>
                    <TableCell className="whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-lg font-extrabold text-xs ${scoreClass}`}>
                        {percentage.toFixed(0)}%
                      </span>
                    </TableCell>
                    <TableCell className="text-right whitespace-nowrap">
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(score.id)} className="text-text-light hover:text-rose-500 hover:bg-rose-50">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
              {scores.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-text-light font-medium">
                    No scores recorded yet. Start by adding your first test score!
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
