"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Search, X } from "lucide-react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type ClassType = {
  id: string;
  class_name: string;
  subject: string;
  exam_type: string;
  thumbnail: string;
};

type MonthType = {
  id: string;
  name: string;
  thumbnail?: string;
};

type WeekType = {
  id: string;
  title: string;
  class_date_time: string;
  thumbnail: string;
};

type StudentType = {
  student_id: string;
  username: string;
  first_name: string;
  last_name: string;
  email?: string;
  school?: string;
  dob?: string;
  new_exam_type?: number;
  new_batch?: number;
  shy?: string;
  enrollment_type?: string;
  district?: string;
  address?: string;
  mobile_no?: string;
  present?: boolean;
};

type TabType = "qr" | "manual";

export default function AttendancePage() {
  const [classList, setClassList] = useState<ClassType[]>([]);
  const [selectedClass, setSelectedClass] = useState<ClassType | null>(null);

  const [months, setMonths] = useState<MonthType[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<MonthType | null>(null);

  const [weeks, setWeeks] = useState<WeekType[]>([]);
  const [selectedWeek, setSelectedWeek] = useState<WeekType | null>(null);

  const [activeTab, setActiveTab] = useState<TabType>("manual");
  const [searchTerm, setSearchTerm] = useState("");

  const [students, setStudents] = useState<StudentType[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<StudentType | null>(null);

  const [loadingClasses, setLoadingClasses] = useState<boolean>(true);
  const [loadingMonths, setLoadingMonths] = useState<boolean>(false);
  const [loadingWeeks, setLoadingWeeks] = useState<boolean>(false);
  const [loadingStudents, setLoadingStudents] = useState<boolean>(false);

  // Check if a week is the current week (Sri Lanka timezone)
  const isCurrentWeek = (weekDate: string) => {
    try {
      const now = new Date();
      const sriLankaOffset = 330 * 60 * 1000;
      const sriLankaTime = new Date(now.getTime() + sriLankaOffset);
      
      const weekDay = new Date(weekDate);
      const weekDaySriLanka = new Date(weekDay.getTime() + sriLankaOffset);
      
      return (
        sriLankaTime.getFullYear() === weekDaySriLanka.getFullYear() &&
        sriLankaTime.getMonth() === weekDaySriLanka.getMonth() &&
        sriLankaTime.getDate() === weekDaySriLanka.getDate()
      );
    } catch (error) {
      console.error("Error parsing date:", error);
      return false;
    }
  };

  // Fetch classes on mount
  useEffect(() => {
    const fetchClasses = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("No token found. Please log in again.");
        setLoadingClasses(false);
        return;
      }

      try {
        const res = await fetch("https://lms.mathlab.lk/api/v1/classes/", {
          headers: {
            Authorization: `Token ${token}`,
          },
        });

        if (!res.ok) throw new Error("Failed to fetch classes");

        const data: ClassType[] = await res.json();
        setClassList(data);
      } catch (error) {
        toast.error("Error loading class data");
      } finally {
        setLoadingClasses(false);
      }
    };

    fetchClasses();
  }, []);

  // Fetch months when a class is selected
  useEffect(() => {
    if (!selectedClass) return;

    const fetchMonths = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("No token found. Please log in again.");
        setLoadingMonths(false);
        return;
      }

      setLoadingMonths(true);
      try {
        const res = await fetch("https://lms.mathlab.lk/api/v1/months/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${token}`,
          },
          body: JSON.stringify({ class_id: selectedClass.id }),
        });

        if (!res.ok) throw new Error("Failed to fetch months");

        const data: MonthType[] = await res.json();
        setMonths(data);
      } catch (error) {
        toast.error("Error loading months");
      } finally {
        setLoadingMonths(false);
      }
    };

    fetchMonths();
  }, [selectedClass]);

  // Fetch weeks when a month is selected
  useEffect(() => {
    if (!selectedMonth) return;

    const fetchWeeks = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("No token found. Please log in again.");
        setLoadingWeeks(false);
        return;
      }

      setLoadingWeeks(true);
      try {
        const res = await fetch("https://lms.mathlab.lk/api/v1/weeks/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${token}`,
          },
          body: JSON.stringify({ month_id: selectedMonth.id }),
        });

        if (!res.ok) throw new Error("Failed to fetch weeks");

        const data: WeekType[] = await res.json();
        setWeeks(data);
      } catch (error) {
        toast.error("Error loading weeks");
      } finally {
        setLoadingWeeks(false);
      }
    };

    fetchWeeks();
  }, [selectedMonth]);

  // Fetch students when a week is selected
  useEffect(() => {
    if (!selectedWeek) return;

    const fetchStudents = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("No token found. Please log in again.");
        setLoadingStudents(false);
        return;
      }

      setLoadingStudents(true);
      try {
        const res = await fetch("https://lms.mathlab.lk/api/v1/get-students-for-week/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${token}`,
          },
          body: JSON.stringify({ week_id: selectedWeek.id }),
        });

        if (!res.ok) throw new Error("Failed to fetch students");

        const data: StudentType[] = await res.json();
        const studentsWithAttendance = data.map(student => ({
          ...student,
          present: false
        }));
        setStudents(studentsWithAttendance);
      } catch (error) {
        toast.error("Error loading student data");
      } finally {
        setLoadingStudents(false);
      }
    };

    fetchStudents();
  }, [selectedWeek]);

  // Filter students based on search
  const filteredStudents = students.filter(
    (student) =>
      student.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.student_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${student.first_name} ${student.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleAttendance = (studentId: string) => {
    setStudents((prev) =>
      prev.map((student) =>
        student.student_id === studentId ? { ...student, present: !student.present } : student
      )
    );
  };

  const openStudentDetails = (student: StudentType) => {
    setSelectedStudent(student);
  };

  const closeStudentDetails = () => {
    setSelectedStudent(null);
  };

  // --- 1. CLASS SELECT ---
  if (!selectedClass) {
    return (
      <div className="p-4">
        <h2 className="text-xl font-bold mb-4">Active Classes</h2>
        {loadingClasses ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 6 }).map((_, idx) => (
              <Skeleton key={idx} className="h-44 w-full rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {classList.map((classItem) => (
              <Card
                key={classItem.id}
                className="overflow-hidden p-0 transition-all duration-300 transform hover:scale-105 hover:shadow-lg cursor-pointer"
                onClick={() => {
                  setSelectedClass(classItem);
                  setSelectedMonth(null);
                  setSelectedWeek(null);
                }}
              >
                <div className="relative h-36 w-full">
                  <Image
                    src={classItem.thumbnail}
                    alt={classItem.class_name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
                  />
                </div>
                <CardHeader className="px-4 py-3">
                  <CardTitle className="text-sm">{classItem.class_name}</CardTitle>
                  <CardDescription className="text-xs">{classItem.subject}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  }

  // --- 2. MONTH SELECT ---
  if (!selectedMonth) {
    return (
      <div className="p-4">
        <Button variant="outline" onClick={() => setSelectedClass(null)} className="mb-4">
          <ChevronLeft className="mr-2 h-4 w-4" /> Back to Classes
        </Button>
        <h2 className="text-xl font-bold mb-4">Select Month</h2>

        {loadingMonths ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 3 }).map((_, idx) => (
              <Skeleton key={idx} className="h-44 w-full rounded-xl" />
            ))}
          </div>
        ) : months.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {months.map((month) => (
              <Card
                key={month.id}
                className="overflow-hidden p-0 transition-all duration-300 transform hover:scale-105 hover:shadow-lg cursor-pointer"
                onClick={() => {
                  setSelectedMonth(month);
                  setSelectedWeek(null);
                }}
              >
                <div className="relative h-32 w-full">
                  <Image
                    src={month.thumbnail || selectedClass.thumbnail}
                    alt={month.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
                  />
                </div>
                <CardHeader className="px-4 py-3">
                  <CardTitle className="text-sm">{month.name}</CardTitle>
                  <CardDescription className="text-xs">
                    {selectedClass.class_name} - {selectedClass.subject}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : (
          <p>No months available for this class.</p>
        )}
      </div>
    );
  }

  // --- 3. WEEK SELECT ---
  if (!selectedWeek) {
    return (
      <div className="p-4">
        <Button variant="outline" onClick={() => setSelectedMonth(null)} className="mb-4">
          <ChevronLeft className="mr-2 h-4 w-4" /> Back to Months
        </Button>
        <h2 className="text-xl font-bold mb-4">Select Week for {selectedMonth.name}</h2>

        {loadingWeeks ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 3 }).map((_, idx) => (
              <Skeleton key={idx} className="h-32 w-full rounded-xl" />
            ))}
          </div>
        ) : weeks.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {weeks.map((week) => {
              const isCurrent = isCurrentWeek(week.class_date_time);
              return (
                <Card
                  key={week.id}
                  className={`overflow-hidden p-0 transition-all duration-300 ${
                    isCurrent 
                      ? "hover:scale-105 hover:shadow-lg cursor-pointer" 
                      : "opacity-70 cursor-not-allowed"
                  }`}
                  onClick={() => isCurrent && setSelectedWeek(week)}
                >
                  <div className="relative h-32 w-full">
                    <Image
                      src={week.thumbnail || selectedClass.thumbnail}
                      alt={week.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
                    />
                  </div>
                  <CardHeader className="px-4 py-3">
                    <CardTitle className="text-sm">{week.title}</CardTitle>
                    <CardDescription className="text-xs">
                      {new Date(week.class_date_time).toLocaleDateString()}
                      {isCurrent && (
                        <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                          Today
                        </span>
                      )}
                      {!isCurrent && (
                        <span className="ml-2 px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                          Not Available
                        </span>
                      )}
                    </CardDescription>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        ) : (
          <p>No weeks available for this month.</p>
        )}
      </div>
    );
  }

  // --- 4. ATTENDANCE TABLE ---
  return (
    <div className="p-4 space-y-4">
      <Button 
        variant="outline" 
        onClick={() => setSelectedWeek(null)} 
        className="mb-2" 
        size="sm"
      >
        <ChevronLeft className="mr-2 h-4 w-4" /> Back to Weeks
      </Button>

      <div className="flex gap-2 mb-4">
        <Button
          variant={activeTab === "qr" ? "secondary" : "outline"}
          onClick={() => setActiveTab("qr")}
          disabled
        >
          QR Attendance
        </Button>
        <Button
          variant={activeTab === "manual" ? "secondary" : "outline"}
          onClick={() => setActiveTab("manual")}
        >
          Manual Attendance
        </Button>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search students by name, username or ID..."
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
      ) : filteredStudents.length > 0 ? (
        <div className="space-y-2">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[150px]">Student ID</TableHead>
                <TableHead className="w-[200px]">Name</TableHead>
                <TableHead className="w-[200px]">Username</TableHead>
                <TableHead className="w-[150px] text-right">Action</TableHead>
                <TableHead className="w-[100px] text-right">Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.map((student) => (
                <TableRow key={student.student_id} className="hover:bg-muted/50">
                  <TableCell className="font-medium">{student.student_id}</TableCell>
                  <TableCell>{student.first_name} {student.last_name}</TableCell>
                  <TableCell>{student.username}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant={student.present ? "outline" : "default"}
                      onClick={() => toggleAttendance(student.student_id)}
                      size="sm"
                    >
                      {student.present ? "Marked" : "Mark Attendance"}
                    </Button>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline" 
                      size="sm"
                      onClick={() => openStudentDetails(student)}
                    >
                      Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <p className="text-center text-muted-foreground py-8">No students found</p>
      )}

      {/* Student Details Dialog */}
      <Dialog open={!!selectedStudent} onOpenChange={closeStudentDetails}>
        <DialogContent className="sm:max-w-l">
          <DialogHeader>
            <DialogTitle className="flex justify-between items-center">
              <span>Student Details</span>
            </DialogTitle>
          </DialogHeader>
          {selectedStudent && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Student ID</p>
                    <p className="text-base font-medium">{selectedStudent.student_id}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Name</p>
                    <p className="text-base font-medium">{selectedStudent.first_name} {selectedStudent.last_name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Username</p>
                    <p className="text-base font-medium">{selectedStudent.username}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Email</p>
                    <p className="text-base font-medium">{selectedStudent.email || "N/A"}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">School</p>
                    <p className="text-base font-medium">{selectedStudent.school || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Date of Birth</p>
                    <p className="text-base font-medium">{selectedStudent.dob || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Mobile No</p>
                    <p className="text-base font-medium">{selectedStudent.mobile_no || "N/A"}</p>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Batch</p>
                    <p className="text-base font-medium">{selectedStudent.new_batch || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">SHY</p>
                    <p className="text-base font-medium">{selectedStudent.shy || "N/A"}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Enrollment Type</p>
                    <p className="text-base font-medium">{selectedStudent.enrollment_type || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Exam Type</p>
                    <p className="text-base font-medium">{selectedStudent.new_exam_type || "N/A"}</p>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">District</p>
                  <p className="text-base font-medium">{selectedStudent.district || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Address</p>
                  <p className="text-base font-medium">{selectedStudent.address || "N/A"}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}