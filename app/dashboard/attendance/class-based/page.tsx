"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Search } from "lucide-react";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import debounce from "lodash.debounce";

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
  district?: string;
  address?: string;
  mobile_no?: string;
};

type AttendanceWeek = {
  date_time: string;
  week_name: string;
  attendance: boolean;
};

type AttendanceMonth = {
  weeks: AttendanceWeek[];
};

type AttendanceClass = {
  class_name: string;
  current_month: AttendanceMonth;
  previous_month: AttendanceMonth;
};

type StudentDetails = {
  student_id: string;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  mobile_no: string;
  attendance: AttendanceClass[];
  attendance_marked?: boolean;
};

export default function ClassBasedAttendancePage() {
  // Get initial state from localStorage if available
  const [classList, setClassList] = useState<ClassType[]>([]);
  const [selectedClass, setSelectedClass] = useState<ClassType | null>(
    typeof window !== 'undefined' ? 
      JSON.parse(localStorage.getItem('selectedClass') || 'null') : null
  );

  const [months, setMonths] = useState<MonthType[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<MonthType | null>(
    typeof window !== 'undefined' ? 
      JSON.parse(localStorage.getItem('selectedMonth') || 'null') : null
  );

  const [weeks, setWeeks] = useState<WeekType[]>([]);
  const [selectedWeek, setSelectedWeek] = useState<WeekType | null>(
    typeof window !== 'undefined' ? 
      JSON.parse(localStorage.getItem('selectedWeek') || 'null') : null
  );

  const [searchTerm, setSearchTerm] = useState("");

  const [students, setStudents] = useState<StudentDetails[]>([]);
  const [allStudents, setAllStudents] = useState<StudentDetails[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<StudentType | null>(null);
  const [studentDetails, setStudentDetails] = useState<StudentDetails | null>(null);
  const [selectedClassTab, setSelectedClassTab] = useState<number>(0);

  const [loadingClasses, setLoadingClasses] = useState<boolean>(true);
  const [loadingMonths, setLoadingMonths] = useState<boolean>(false);
  const [loadingWeeks, setLoadingWeeks] = useState<boolean>(false);
  const [loadingStudents, setLoadingStudents] = useState<boolean>(false);
  const [loadingStudentDetails, setLoadingStudentDetails] = useState<boolean>(false);

  const [activeTab, setActiveTab] = useState<"Paid" | "All">("Paid");

  // Save state to localStorage whenever it changes
  useEffect(() => {
    if (selectedClass) {
      localStorage.setItem('selectedClass', JSON.stringify(selectedClass));
    } else {
      localStorage.removeItem('selectedClass');
    }
  }, [selectedClass]);

  useEffect(() => {
    if (selectedMonth) {
      localStorage.setItem('selectedMonth', JSON.stringify(selectedMonth));
    } else {
      localStorage.removeItem('selectedMonth');
    }
  }, [selectedMonth]);

  useEffect(() => {
    if (selectedWeek) {
      localStorage.setItem('selectedWeek', JSON.stringify(selectedWeek));
    } else {
      localStorage.removeItem('selectedWeek');
    }
  }, [selectedWeek]);

  // Clear all saved state when going back to class selection
  const handleBackToClasses = () => {
    localStorage.removeItem('selectedClass');
    localStorage.removeItem('selectedMonth');
    localStorage.removeItem('selectedWeek');
    setSelectedClass(null);
    setSelectedMonth(null);
    setSelectedWeek(null);
  };

  // Clear month and week when changing class
  const handleClassSelect = (classItem: ClassType) => {
    localStorage.removeItem('selectedMonth');
    localStorage.removeItem('selectedWeek');
    setSelectedClass(classItem);
    setSelectedMonth(null);
    setSelectedWeek(null);
  };

  // Clear week when changing month
  const handleMonthSelect = (month: MonthType) => {
    localStorage.removeItem('selectedWeek');
    setSelectedMonth(month);
    setSelectedWeek(null);
  };

  // Check current week (Sri Lanka timezone)
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

  // --- FETCH CLASSES ---
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
          headers: { Authorization: `Token ${token}` },
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

  // --- FETCH MONTHS ---
  useEffect(() => {
    if (!selectedClass) return;

    const fetchMonths = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

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

  // --- FETCH WEEKS ---
  useEffect(() => {
    if (!selectedMonth) return;

    const fetchWeeks = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

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

  // --- FETCH STUDENTS (Paid tab) ---
  useEffect(() => {
    if (!selectedWeek) return;
    if (activeTab === "All") return;

    const fetchStudents = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      setLoadingStudents(true);
      try {
        const res = await fetch(
          "https://lms.mathlab.lk/api/v1/get-students-for-week/",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Token ${token}`,
            },
            body: JSON.stringify({ week_id: selectedWeek.id }),
          }
        );
        console.log(selectedWeek.id)
        if (!res.ok) throw new Error("Failed to fetch students");

        // const data: StudentType[] = await res.json();
        // const studentsWithAttendance = data.map((student) => ({
        //   ...student,
        //   attendance_marked: student.attendance_marked,
        // }));
        const data: StudentDetails[] = await res.json();
        const studentsWithAttendance = data.map((student) => ({
          ...student,
          attendance_marked: student.attendance_marked,
        }));
        console.log(studentsWithAttendance)
        console.log("Data - ", data)
        console.log("response - ", res)
        setStudents(studentsWithAttendance);
      } catch (error) {
        toast.error("Error loading student data");
      } finally {
        setLoadingStudents(false);
      }
    };

    fetchStudents();
  }, [selectedWeek, activeTab]);

    // --- FETCH ALL STUDENTS (All tab) ---
  const fetchAllStudents = async (search: string) => {
    if (!selectedWeek) return;
    const token = localStorage.getItem("token");
    if (!token) return;

    // Prevent automatic fetch when no search is given
    if (!search || search.trim() === "") {
      setAllStudents([]); // clear results when search is empty
      return;
    }

    setLoadingStudents(true);
    try {
      const query = search.toString().trim();
      const res = await fetch(
        `https://lms.mathlab.lk/api/v1/search-students/?search_query=${query}&week_id=${selectedWeek.id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${token}`,
          },
        }
      );

      const data: StudentDetails[] = await res.json();
      const dataWithMarked = data.map((s) => ({
        ...s,
        attendance_marked: s.attendance_marked,
      }));

      setAllStudents(dataWithMarked);
    } catch (error) {
      toast.error("Error fetching students");
      console.error(error);
    } finally {
      setLoadingStudents(false);
    }
  };


  const debouncedFetch = useCallback(debounce(fetchAllStudents, 500), [selectedWeek]);

  useEffect(() => {
    if (activeTab === "All") {
      debouncedFetch(searchTerm);
    }
  }, [searchTerm, activeTab, debouncedFetch]);

  // --- FETCH STUDENT DETAILS ---
  const fetchStudentDetails = async (studentId: string) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    setLoadingStudentDetails(true);
    try {
      const res = await fetch(
        `https://lms.mathlab.lk/api/v1/individual-student-details/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${token}`,
          },
          body: JSON.stringify({student_id: studentId }),
        }
      );

      if (!res.ok) throw new Error("Failed to fetch student details");
      const data: StudentDetails = await res.json();
      setStudentDetails(data);
      setSelectedClassTab(0); // Reset to first class tab
    } catch (error) {
      toast.error("Error loading student details");
    } finally {
      setLoadingStudentDetails(false);
    }
  };

  // --- TOGGLE ATTENDANCE (Mark/Unmark) ---
  const toggleAttendanceAPI = async (studentId: string, isMarked: boolean, tab: "Paid" | "All") => {
    const token = localStorage.getItem("token");
    if (!token || !selectedWeek) return;

    try {
      if (!isMarked) {
        // Mark attendance
        await fetch("https://lms.mathlab.lk/api/v1/mark-attendance/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${token}`,
          },
          body: JSON.stringify({ week_id: selectedWeek.id, student_id: studentId }),
        });
      } else {
        // Unmark attendance
        await fetch("https://lms.mathlab.lk/api/v1/delete-attendance/", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${token}`,
          },
          body: JSON.stringify({ week_id: selectedWeek.id, student_id: studentId }),
        });
      }

      if (tab === "Paid") {
        setStudents((prev) =>
          prev.map((s) =>
            s.student_id === studentId ? { ...s, attendance_marked: !isMarked } : s
          )
        );
      } else {
        setAllStudents((prev) =>
          prev.map((s) =>
            s.student_id === studentId ? { ...s, attendance_marked: !isMarked } : s
          )
        );
      }

      toast.success(!isMarked ? "Attendance marked" : "Attendance unmarked");
    } catch (error) {
      toast.error("Error updating attendance");
    }
  };

  const toggleAttendance = (studentId: string) => {
    const student = students.find((s) => s.student_id === studentId);
    if (!student) return;
    toggleAttendanceAPI(studentId, student.attendance_marked || false, "Paid");
  };

  const toggleAttendanceAll = (studentId: string) => {
    const student = allStudents.find((s) => s.student_id === studentId);
    if (!student) return;
    toggleAttendanceAPI(studentId, student.attendance_marked || false, "All");
  };


  const openStudentDetails = async (student: StudentType) => {
    setSelectedStudent(student);
    await fetchStudentDetails(student.student_id);
  };

  const closeStudentDetails = () => {
    setSelectedStudent(null);
    setStudentDetails(null);
  };

  const displayedStudents = activeTab === "Paid" ? students : allStudents;

  const filteredDisplayedStudents =
    activeTab === "Paid"
      ? displayedStudents.filter(
          (student) =>
            student.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.student_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            `${student.first_name} ${student.last_name}`
              .toLowerCase()
              .includes(searchTerm.toLowerCase())
        )
      : displayedStudents;

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Calculate attendance statistics
  const calculateAttendanceStats = (attendance: AttendanceClass[]) => {
    let totalClasses = 0;
    let attendedClasses = 0;

    attendance.forEach(classItem => {
      // Current month
      classItem.current_month.weeks.forEach(week => {
        totalClasses++;
        if (week.attendance) attendedClasses++;
      });

      // Previous month
      classItem.previous_month.weeks.forEach(week => {
        totalClasses++;
        if (week.attendance) attendedClasses++;
      });
    });

    const attendancePercentage = totalClasses > 0 ? (attendedClasses / totalClasses) * 100 : 0;
    
    return {
      totalClasses,
      attendedClasses,
      attendancePercentage: attendancePercentage.toFixed(1)
    };
  };

  // --- RENDER ---
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
                onClick={() => handleClassSelect(classItem)}
              >
                <div className="relative h-36 w-full">
                  <Image
                    src={classItem.thumbnail}
                    alt={classItem.class_name}
                    fill
                    className="object-cover"
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

  if (!selectedMonth) {
    return (
      <div className="p-4">
        <Button variant="outline" onClick={handleBackToClasses} className="mb-4">
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
                onClick={() => handleMonthSelect(month)}
              >
                <div className="relative h-32 w-full">
                  <Image
                    src={month.thumbnail || selectedClass.thumbnail}
                    alt={month.name}
                    fill
                    className="object-cover"
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

  if (!selectedWeek) {
    return (
      <div className="p-4">
        <Button variant="outline" onClick={() => { localStorage.removeItem('selectedMonth'); setSelectedMonth(null); }} className="mb-4">
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

  // --- MANUAL ATTENDANCE WITH TABS ---
  return (
    <div className="p-4 space-y-4">
      <Button 
        variant="outline" 
        onClick={() => { localStorage.removeItem('selectedWeek'); setSelectedWeek(null); }} 
        className="mb-2" 
        size="sm"
      >
        <ChevronLeft className="mr-2 h-4 w-4" /> Back to Weeks
      </Button>

      {/* Tabs */}
      <div className="flex space-x-2 mb-4">
        <Button
          size="sm"
          variant={activeTab === "Paid" ? "default" : "outline"}
          onClick={() => setActiveTab("Paid")}
        >
          Paid
        </Button>
        <Button
          size="sm"
          variant={activeTab === "All" ? "default" : "outline"}
          onClick={() => setActiveTab("All")}
        >
          All
        </Button>
      </div>

      {/* Search */}
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
      ) : filteredDisplayedStudents.length > 0 ? (
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
              {filteredDisplayedStudents.map((student) => (
                <TableRow key={student.student_id}>
                  <TableCell>{student.student_id}</TableCell>
                  <TableCell>{`${student.first_name} ${student.last_name}`}</TableCell>
                  <TableCell>{student.username}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      onClick={() =>
                        activeTab === "Paid"
                          ? toggleAttendance(student.student_id)
                          : toggleAttendanceAll(student.student_id)
                      }
                    >
                      {student.attendance_marked ? "Unmark" : "Mark"}
                    </Button>

                  </TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" onClick={() => openStudentDetails(student)}>
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
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
          ) : studentDetails ? (
            <div className="space-y-6">
              {/* Personal Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg">
                <h3 className="text-lg font-semibold col-span-full mb-2 text-center">Personal Information</h3>
                  <p><strong>Student ID:</strong> {studentDetails.student_id}</p><br></br>
                  <p><strong>Email:</strong> {studentDetails.email}</p><br></br>
                  <p><strong>Name:</strong> {studentDetails.first_name} {studentDetails.last_name}</p><br></br>
                  <p><strong>Mobile:</strong> {studentDetails.mobile_no}</p><br></br>
              </div>

              {/* Attendance Statistics */}
              {studentDetails.attendance && studentDetails.attendance.length > 0 && (
                <div className="p-4 border rounded-lg">
                  <h3 className="text-lg font-semibold mb-4 text-center">Attendance Overview</h3>
                  {studentDetails.attendance.map((classItem, index) => {
                    const stats = calculateAttendanceStats([classItem]);
                    return (
                      <div key={index} className="mb-4 last:mb-0">
                        <h4 className="font-medium mb-2">{classItem.class_name}</h4>
                        <div className="grid grid-cols-3 gap-4 text-center">
                          <div className="p-2 bg-blue-50 rounded">
                            <p className="text-sm">Total Classes</p>
                            <p className="text-xl font-bold">{stats.totalClasses}</p>
                          </div>
                          <div className="p-2 bg-green-50 rounded">
                            <p className="text-sm">Attended</p>
                            <p className="text-xl font-bold">{stats.attendedClasses}</p>
                          </div>
                          <div className="p-2 bg-purple-50 rounded">
                            <p className="text-sm">Attendance %</p>
                            <p className="text-xl font-bold">{stats.attendancePercentage}%</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Attendance Details */}
              {studentDetails.attendance && studentDetails.attendance.length > 0 && (
                <div className="p-4 border rounded-lg">
                  <h3 className="text-lg font-semibold mb-4 text-center">Detailed Attendance</h3>
                  
                  {/* Class Selection Buttons */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {studentDetails.attendance.map((classItem, index) => (
                      <Button 
                        key={index}
                        variant={selectedClassTab === index ? "default" : "outline"}
                        size="sm"
                      className="flex justify-center items-center"
                        onClick={() => setSelectedClassTab(index)}
                      >
                        {classItem.class_name}
                      </Button>
                    ))}
                  </div>
                  
                  {/* Selected Class Attendance */}
                  {studentDetails.attendance[selectedClassTab] && (
                    <div className="space-y-6">
                      {/* Current Month */}
                      <div>
                        <h4 className="font-medium mb-2 text-center">Current Month</h4>
                        <div className="border rounded-md">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Session</TableHead>
                                <TableHead>Status</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {studentDetails.attendance[selectedClassTab].current_month.weeks.map((week, weekIndex) => (
                                <TableRow key={weekIndex}>
                                  <TableCell>{formatDate(week.date_time)}</TableCell>
                                  <TableCell>{week.week_name}</TableCell>
                                  <TableCell>
                                    <span className={`px-2 py-1 rounded-full text-xs ${
                                      week.attendance 
                                        ? "bg-green-100 text-green-800" 
                                        : "bg-red-100 text-red-800"
                                    }`}>
                                      {week.attendance ? "Present" : "Absent"}
                                    </span>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </div>

                      {/* Previous Month */}
                      <div>
                        <h4 className="font-medium mb-2 text-center">Previous Month</h4>
                        <div className="border rounded-md">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Session</TableHead>
                                <TableHead>Status</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {studentDetails.attendance[selectedClassTab].previous_month.weeks.map((week, weekIndex) => (
                                <TableRow key={weekIndex}>
                                  <TableCell>{formatDate(week.date_time)}</TableCell>
                                  <TableCell>{week.week_name}</TableCell>
                                  <TableCell>
                                    <span className={`px-2 py-1 rounded-full text-xs ${
                                      week.attendance 
                                        ? "bg-green-100 text-green-800" 
                                        : "bg-red-100 text-red-800"
                                    }`}>
                                      {week.attendance ? "Present" : "Absent"}
                                    </span>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <p>No details available for this student.</p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}


