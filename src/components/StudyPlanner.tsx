import React, { useState } from 'react';
import { useAuth } from '../lib/AuthContext';
import { addSession, deleteSession } from '../lib/db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Calendar as CalendarIcon, Clock, Plus, Trash2, BookOpen } from 'lucide-react';
import { SUBJECTS } from '../constants';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export function StudyPlanner() {
  const { sessions, selectedStudentId } = useAuth();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  const [newSession, setNewSession] = useState({
    title: '',
    subject: SUBJECTS[0],
    startTime: '16:00',
    endTime: '17:00',
    reminderSet: true
  });

  const [sortBy, setSortBy] = useState<'date' | 'subject'>('date');

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId || !date) return;
    
    const start = new Date(date);
    const [sH, sM] = newSession.startTime.split(':');
    start.setHours(parseInt(sH), parseInt(sM));

    const end = new Date(date);
    const [eH, eM] = newSession.endTime.split(':');
    end.setHours(parseInt(eH), parseInt(eM));

    try {
      await addSession(selectedStudentId, {
        title: newSession.title,
        subject: newSession.subject,
        start: start.toISOString(),
        end: end.toISOString(),
        reminderSet: newSession.reminderSet
      });
      setIsAddOpen(false);
      toast.success('Study session scheduled!');
    } catch (error) {
      toast.error('Failed to schedule session.');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteSession(id);
      toast.success('Session removed.');
    } catch (error) {
      toast.error('Failed to remove.');
    }
  };

  const sortedSessions = [...sessions].sort((a, b) => {
    if (sortBy === 'date') {
      return new Date(a.start).getTime() - new Date(b.start).getTime();
    } else {
      return a.subject.localeCompare(b.subject);
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-extrabold text-text-dark">Study Calendar</h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-card px-3 py-1.5 rounded-xl border border-slate-200">
            <span className="text-xs font-bold text-text-light uppercase tracking-wider">Sort by:</span>
            <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
              <SelectTrigger className="h-8 border-none bg-transparent font-bold text-text-dark focus:ring-0 w-[100px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="date">Date</SelectItem>
                <SelectItem value="subject">Subject</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger render={
              <Button className="bg-primary hover:bg-primary/90 rounded-xl">
                <Plus className="h-4 w-4 mr-2" /> Schedule Session
              </Button>
            } />
            <DialogContent className="rounded-[24px]">
              <DialogHeader>
                <DialogTitle className="text-xl font-extrabold">Schedule Study Session</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAdd} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label className="font-bold text-text-dark">Session Title</Label>
                  <Input 
                    placeholder="e.g. Math Revision - Algebra" 
                    className="rounded-xl"
                    value={newSession.title}
                    onChange={e => setNewSession({...newSession, title: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold text-text-dark">Subject</Label>
                  <Select value={newSession.subject} onValueChange={v => setNewSession({...newSession, subject: v})}>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SUBJECTS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="font-bold text-text-dark">Date</Label>
                  <Popover>
                    <PopoverTrigger render={
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal rounded-xl",
                          !date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP") : <span>Pick a date</span>}
                      </Button>
                    } />
                    <PopoverContent className="w-auto p-0 rounded-[24px]">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="font-bold text-text-dark">Start Time</Label>
                    <Input 
                      type="time" 
                      className="rounded-xl"
                      value={newSession.startTime}
                      onChange={e => setNewSession({...newSession, startTime: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold text-text-dark">End Time</Label>
                    <Input 
                      type="time" 
                      className="rounded-xl"
                      value={newSession.endTime}
                      onChange={e => setNewSession({...newSession, endTime: e.target.value})}
                      required
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full bg-primary rounded-xl font-bold py-6">Schedule</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 vibrant-card">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-md"
          />
        </div>

        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-lg font-extrabold text-text-dark mb-4">Upcoming Sessions</h3>
          <div className="space-y-4">
            {sortedSessions.length > 0 ? (
              sortedSessions.map((session) => (
                <div key={session.id} className="vibrant-card flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <div className="bg-indigo-100 p-3 rounded-2xl text-primary">
                      <BookOpen className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-text-dark">{session.title}</h4>
                      <div className="flex items-center gap-3 text-xs text-text-light mt-1 font-bold">
                        <span className="flex items-center gap-1">
                          <CalendarIcon className="h-3.5 w-3.5" />
                          {format(new Date(session.start), 'MMM dd')}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {format(new Date(session.start), 'HH:mm')} - {format(new Date(session.end), 'HH:mm')}
                        </span>
                        <Badge variant="secondary" className="rounded-lg font-bold text-[10px] px-2">{session.subject}</Badge>
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(session.id)} className="text-text-light hover:text-rose-500 hover:bg-rose-50 rounded-xl">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))
            ) : (
              <div className="text-center py-16 bg-white rounded-[24px] border-2 border-dashed border-slate-100">
                <CalendarIcon className="h-16 w-16 text-slate-100 mx-auto mb-4" />
                <p className="text-text-light font-bold">No study sessions scheduled. Plan your success!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
