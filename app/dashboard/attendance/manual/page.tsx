"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import debounce from "lodash.debounce";

type StudentDetails = {
  student_id: string;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  mobile_no: string;
  attendance?: any[]; // same as your class-based response by chanupa
};

export default function AllStudentsAttendance() {
  const [searchTerm, setSearchTerm] = useState("");
  const [allStudents, setAllStudents] = useState<StudentDetails[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);

  const [selectedStudent, setSelectedStudent] = useState<StudentDetails | null>(null);
  const [loadingStudentDetails, setLoadingStudentDetails] = useState(false);

  // Fetch students based on search
  const fetchAllStudents = async (query: string) => {
    const token = localStorage.getItem("token");
    if (!token || !query.trim()) {
      setAllStudents([]);
      return;
    }

    setLoadingStudents(true);
    try {
      const res = await fetch(`https://lms.mathlab.lk/api/v1/search-students/?search_query=${query}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to fetch students");

      const data: StudentDetails[] = await res.json();
      setAllStudents(data);
    } catch (error) {
      toast.error("Error fetching students");
      console.error(error);
    } finally {
      setLoadingStudents(false);
    }
  };

  const debouncedFetch = useCallback(debounce(fetchAllStudents, 500), []);

  useEffect(() => {
    debouncedFetch(searchTerm);
  }, [searchTerm, debouncedFetch]);

  // Fetch individual student details (enrolled classes + attendance)
  const fetchStudentDetails = async (studentId: string) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    setLoadingStudentDetails(true);
    try {
      const res = await fetch(`https://lms.mathlab.lk/api/v1/individual-student-details/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify({ student_id: studentId }),
      });

      if (!res.ok) throw new Error("Failed to fetch student details");

      const data: StudentDetails = await res.json();
      setSelectedStudent(data);
    } catch (error) {
      toast.error("Error loading student details");
      console.error(error);
    } finally {
      setLoadingStudentDetails(false);
    }
  };

  const closeStudentDetails = () => setSelectedStudent(null);

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="p-4 space-y-4">
      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search students by name, username, or ID..."
          className="pl-9"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loadingStudents ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, idx) => (
            <Skeleton key={idx} className="h-12 w-full" />
          ))}
        </div>
      ) : allStudents.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Username</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Mobile</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {allStudents.map((student) => (
              <TableRow key={student.student_id}>
                <TableCell>{student.student_id}</TableCell>
                <TableCell>{`${student.first_name} ${student.last_name}`}</TableCell>
                <TableCell>{student.username}</TableCell>
                <TableCell>{student.email}</TableCell>
                <TableCell>{student.mobile_no}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button size="sm" onClick={() => fetchStudentDetails(student.student_id)}>
                    View
                  </Button>
                  <Button size="sm" disabled>
                    Classes
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <p>No students found.</p>
      )}

      {/* Student Details Dialog */}
      <Dialog open={!!selectedStudent} onOpenChange={closeStudentDetails}>
        <DialogContent className="max-w-4xl min-w-3xl max-h-[90vh] overflow-y-auto">
          {loadingStudentDetails ? (
            <div className="space-y-4">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
            </div>
          ) : selectedStudent ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg">
                <h3 className="text-lg font-semibold col-span-full mb-2 text-center">
                  Personal Information
                </h3>
                <p><strong>Student ID:</strong> {selectedStudent.student_id}</p>
                <p><strong>Email:</strong> {selectedStudent.email}</p>
                <p><strong>Name:</strong> {selectedStudent.first_name} {selectedStudent.last_name}</p>
                <p><strong>Mobile:</strong> {selectedStudent.mobile_no}</p>
              </div>

              {/* Attendance per class */}
              {selectedStudent.attendance && selectedStudent.attendance.length > 0 && (
                <div className="p-4 border rounded-lg space-y-4">
                  {selectedStudent.attendance.map((classItem, idx) => (
                    <div key={idx}>
                      <h4 className="font-medium mb-2">{classItem.class_name}</h4>
                      <div className="grid grid-cols-3 gap-4 text-center mb-2">
                        <div className="p-2 bg-blue-50 rounded">
                          <p className="text-sm">Total Classes</p>
                          <p className="text-xl font-bold">{classItem.current_month.weeks.length + classItem.previous_month.weeks.length}</p>
                        </div>
                        <div className="p-2 bg-green-50 rounded">
                          <p className="text-sm">Attended</p>
                          <p className="text-xl font-bold">
                            {[
                              ...classItem.current_month.weeks,
                              ...classItem.previous_month.weeks,
                            ].filter(w => w.attendance).length}
                          </p>
                        </div>
                        <div className="p-2 bg-purple-50 rounded">
                          <p className="text-sm">Attendance %</p>
                          <p className="text-xl font-bold">
                            {Math.round(
                              ([
                                ...classItem.current_month.weeks,
                                ...classItem.previous_month.weeks,
                              ].filter(w => w.attendance).length /
                                (classItem.current_month.weeks.length + classItem.previous_month.weeks.length)) *
                                100
                            )}
                            %
                          </p>
                        </div>
                      </div>

                      {/* Detailed weeks */}
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Session</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {[...classItem.current_month.weeks, ...classItem.previous_month.weeks].map((week, wIdx) => (
                            <TableRow key={wIdx}>
                              <TableCell>{formatDate(week.date_time)}</TableCell>
                              <TableCell>{week.week_name}</TableCell>
                              <TableCell>
                                <span className={`px-2 py-1 rounded-full text-xs ${
                                  week.attendance ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                                }`}>
                                  {week.attendance ? "Present" : "Absent"}
                                </span>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <p>No details available.</p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
