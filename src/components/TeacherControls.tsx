import React, { useState, useMemo } from 'react';
import { useAuth } from '../lib/AuthContext';
import { addStudent, deleteStudent } from '../lib/db';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Users, Plus, UserCircle, Filter, BookOpen, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const STANDARDS = [
  "1st Standard", "2nd Standard", "3rd Standard", "4th Standard", 
  "5th Standard", "6th Standard", "7th Standard", "8th Standard", 
  "9th Standard", "10th Standard"
];

export function TeacherControls() {
  const { user, profile, managedStudents, selectedStudentId, setSelectedStudentId, refreshData } = useAuth();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [studentName, setStudentName] = useState('');
  const [newStudentStandard, setNewStudentStandard] = useState(STANDARDS[0]);
  const [filterStandard, setFilterStandard] = useState<string | 'all'>('all');

  const [studentToDelete, setStudentToDelete] = useState<{id: string, name: string} | null>(null);

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    try {
      await addStudent(user.uid, studentName, newStudentStandard);
      setStudentName('');
      setIsAddOpen(false);
      toast.success('Student added successfully!');
    } catch (error: any) {
      console.error("Add student error:", error);
      let message = 'Failed to add student details.';
      try {
        const parsed = JSON.parse(error.message);
        if (parsed.error) message = parsed.error;
      } catch (e) {}
      toast.error(message);
    }
  };

  const confirmDelete = async () => {
    if (!studentToDelete) return;
    
    try {
      await deleteStudent(studentToDelete.id);
      if (selectedStudentId === studentToDelete.id) setSelectedStudentId(null);
      toast.success(`${studentToDelete.name} removed from classroom.`);
      setStudentToDelete(null);
    } catch (error: any) {
      console.error("Delete student error:", error);
      toast.error('Failed to delete student.');
    }
  };

  const handleDeleteClick = (e: React.MouseEvent, studentUid: string, name: string) => {
    e.stopPropagation(); 
    setStudentToDelete({ id: studentUid, name: name });
  };

  const filteredStudents = useMemo(() => {
    if (filterStandard === 'all') return managedStudents;
    return managedStudents.filter(s => s.standard === filterStandard);
  }, [managedStudents, filterStandard]);

  return (
    <div className="flex flex-col gap-4 bg-white/50 backdrop-blur-sm p-6 rounded-[24px] border border-slate-100 mb-6 shadow-sm">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-2.5 rounded-2xl text-primary">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-text-light">Teacher Console</p>
            <h3 className="font-extrabold text-text-dark">Classroom Management</h3>
          </div>
        </div>

        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger render={
            <Button className="rounded-xl bg-primary hover:bg-primary/90 h-11 px-6 shadow-md transition-all hover:scale-105">
              <Plus className="h-4 w-4 mr-2" /> Add New Student
            </Button>
          } />
          <DialogContent className="rounded-[24px] sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="text-xl font-extrabold">Register Student</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddStudent} className="space-y-6 pt-4">
              <div className="space-y-2">
                <Label className="font-bold text-text-dark">Student Full Name</Label>
                <Input 
                  placeholder="e.g. Jane Doe" 
                  className="rounded-xl h-12"
                  value={studentName}
                  onChange={e => setStudentName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="font-bold text-text-dark">Standard / Class</Label>
                <Select value={newStudentStandard} onValueChange={setNewStudentStandard}>
                  <SelectTrigger className="rounded-xl h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {STANDARDS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full bg-primary rounded-xl font-bold py-6 text-lg">Create Student Record</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="pt-4 border-t border-slate-100">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
          <div className="space-y-2 w-full md:w-64">
            <Label className="text-[10px] font-extrabold uppercase tracking-widest text-text-light ml-1 flex items-center gap-1">
              <Filter className="h-3 w-3" /> Filter by Class
            </Label>
            <Select value={filterStandard} onValueChange={setFilterStandard}>
              <SelectTrigger className="rounded-xl bg-white border-slate-200 h-11">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-text-light" />
                  <SelectValue placeholder="All Standards" />
                </div>
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="all">All Standards</SelectItem>
                {STANDARDS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {selectedStudentId && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setSelectedStudentId(null)}
              className="rounded-xl text-xs font-bold text-text-light hover:text-primary"
            >
              Clear Selection
            </Button>
          )}
        </div>

        <div className="space-y-2">
          <Label className="text-[10px] font-extrabold uppercase tracking-widest text-text-light ml-1 flex items-center gap-1 mb-2">
            <UserCircle className="h-3 w-3" /> {filterStandard === 'all' ? 'All Students' : `Students in ${filterStandard}`}
          </Label>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {filteredStudents.length > 0 ? (
              filteredStudents.map(student => (
                <div
                  key={student.uid}
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelectedStudentId(student.uid)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelectedStudentId(student.uid);
                    }
                  }}
                  className={`flex flex-col items-center p-3 rounded-2xl border-2 transition-all text-center gap-2 relative group cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                    selectedStudentId === student.uid 
                      ? 'border-primary bg-primary/5 shadow-md scale-105' 
                      : 'border-slate-100 bg-white hover:border-primary/30 hover:bg-slate-50'
                  }`}
                >
                  <button 
                    onClick={(e) => handleDeleteClick(e, student.uid, student.displayName)}
                    className="absolute -top-2 -right-2 bg-rose-500 text-white p-2 rounded-full opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity hover:bg-rose-600 shadow-lg z-10 scale-110 md:scale-100"
                    title="Remove Student"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    selectedStudentId === student.uid ? 'bg-primary text-white' : 'bg-slate-100 text-slate-400'
                  }`}>
                    <UserCircle className="h-6 w-6" />
                  </div>
                  <div className="space-y-0.5">
                    <p className={`text-xs font-extrabold truncate w-full max-w-[100px] ${
                      selectedStudentId === student.uid ? 'text-primary' : 'text-text-dark'
                    }`}>
                      {student.displayName}
                    </p>
                    <p className="text-[9px] font-bold text-text-light uppercase tracking-tighter">
                      {student.standard}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full py-8 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-100">
                <p className="text-sm text-text-light font-medium">No students found in this class.</p>
              </div>
            )}
          </div>
        </div>

        {selectedStudentId && (
          <div className="mt-4 pt-4 border-t border-slate-100 flex justify-end">
            <Button 
              variant="outline" 
              size="sm"
              onClick={(e) => {
                const student = managedStudents.find(s => s.uid === selectedStudentId);
                if (student) handleDeleteClick(e as any, student.uid, student.displayName);
              }}
              className="rounded-xl text-rose-500 hover:bg-rose-50 hover:text-rose-600 font-bold gap-2"
            >
              <Trash2 className="h-4 w-4" /> Remove Selected Student
            </Button>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!studentToDelete} onOpenChange={(open) => !open && setStudentToDelete(null)}>
        <DialogContent className="rounded-[24px] sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-extrabold text-rose-600 flex items-center gap-2">
              <Trash2 className="h-5 w-5" /> Confirm Deletion
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 font-medium text-text-dark">
            Are you sure you want to remove <span className="font-extrabold text-primary">{studentToDelete?.name}</span>? 
            This will permanently delete their profile from your classroom record.
          </div>
          <div className="flex gap-3 pt-2">
            <Button 
              variant="outline" 
              onClick={() => setStudentToDelete(null)}
              className="flex-1 rounded-xl font-bold h-12"
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDelete}
              className="flex-1 rounded-xl font-bold h-12 bg-rose-500 hover:bg-rose-600 text-white"
            >
              Delete Student
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
