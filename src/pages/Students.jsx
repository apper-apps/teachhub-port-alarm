import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import ApperIcon from '../components/ApperIcon';
import studentService from '../services/api/studentService';
import gradeService from '../services/api/gradeService';
import attendanceService from '../services/api/attendanceService';

const Students = () => {
  const [students, setStudents] = useState([]);
  const [grades, setGrades] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    parentContact: '',
    notes: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [studentsData, gradesData, attendanceData] = await Promise.all([
        studentService.getAll(),
        gradeService.getAll(),
        attendanceService.getAll()
      ]);
      setStudents(studentsData);
      setGrades(gradesData);
      setAttendance(attendanceData);
    } catch (err) {
      setError(err.message || 'Failed to load students');
      toast.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateStudent = async (e) => {
    e.preventDefault();
    
    try {
      const newStudent = await studentService.create({
        ...formData,
        photoUrl: `https://ui-avatars.com/api/?name=${formData.firstName}+${formData.lastName}&background=2E7D32&color=fff`
      });
      setStudents(prev => [...prev, newStudent]);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        parentContact: '',
        notes: ''
      });
      setShowCreateForm(false);
      toast.success('Student added successfully');
    } catch (err) {
      toast.error('Failed to add student');
    }
  };

  const handleDeleteStudent = async (studentId) => {
    if (!window.confirm('Are you sure you want to remove this student?')) return;
    
    try {
      await studentService.delete(studentId);
      setStudents(prev => prev.filter(student => student.id !== studentId));
      if (selectedStudent?.id === studentId) {
        setSelectedStudent(null);
      }
      toast.success('Student removed successfully');
    } catch (err) {
      toast.error('Failed to remove student');
    }
  };

  const getStudentGrades = (studentId) => {
    return grades.filter(grade => grade.studentId === studentId);
  };

  const getStudentAttendance = (studentId) => {
    const studentAttendance = attendance.filter(att => att.studentId === studentId);
    const total = studentAttendance.length;
    const present = studentAttendance.filter(att => att.status === 'present').length;
    return {
      total,
      present,
      rate: total > 0 ? (present / total) * 100 : 0
    };
  };

  const calculateStudentAverage = (studentId) => {
    const studentGrades = getStudentGrades(studentId);
    if (studentGrades.length === 0) return null;
    
    // For this demo, assume all assignments are worth 100 points
    const averageScore = studentGrades.reduce((sum, grade) => sum + grade.score, 0) / studentGrades.length;
    return (averageScore / 100) * 100; // Convert to percentage
  };

  const filteredStudents = students.filter(student =>
    `${student.firstName} ${student.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg p-6 shadow-sm">
              <div className="animate-pulse space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                    <div className="h-3 bg-gray-200 rounded w-32"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-lg p-8 shadow-sm text-center">
          <ApperIcon name="AlertCircle" className="w-12 h-12 text-error mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Unable to load students</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadData}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-full overflow-hidden">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 space-y-4 md:space-y-0">
        <div>
          <h1 className="text-2xl font-heading font-bold text-gray-900">Students</h1>
          <p className="text-gray-600">Manage student profiles and track progress</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="relative">
            <ApperIcon name="Search" className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            <ApperIcon name="UserPlus" className="w-4 h-4 mr-2" />
            Add Student
          </button>
        </div>
      </div>

      {/* Create Student Form */}
      {showCreateForm && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg p-6 shadow-sm mb-6"
        >
          <h3 className="text-lg font-heading font-semibold text-gray-900 mb-4">Add New Student</h3>
          <form onSubmit={handleCreateStudent} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Enter first name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Enter last name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="student@school.edu"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Parent Contact
                </label>
                <input
                  type="text"
                  value={formData.parentContact}
                  onChange={(e) => setFormData(prev => ({ ...prev, parentContact: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Parent phone or email"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                rows="3"
                placeholder="Additional notes about the student"
              />
            </div>
            <div className="flex items-center space-x-3">
              <button
                type="submit"
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                Add Student
              </button>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Students Grid */}
      {filteredStudents.length === 0 ? (
        <div className="bg-white rounded-lg p-12 shadow-sm text-center">
          <ApperIcon name="Users" className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm ? 'No students found' : 'No students yet'}
          </h3>
          <p className="text-gray-600 mb-4">
            {searchTerm ? 'Try adjusting your search terms' : 'Add your first student to get started'}
          </p>
          {!searchTerm && (
            <button
              onClick={() => setShowCreateForm(true)}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              Add First Student
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStudents.map((student, index) => {
            const studentGrades = getStudentGrades(student.id);
            const attendanceStats = getStudentAttendance(student.id);
            const average = calculateStudentAverage(student.id);
            
            return (
              <motion.div
                key={student.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedStudent(student)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-lg font-medium text-white">
                      {student.firstName.charAt(0)}{student.lastName.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-heading font-semibold text-gray-900">
                        {student.firstName} {student.lastName}
                      </h3>
                      <p className="text-sm text-gray-600">{student.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteStudent(student.id);
                    }}
                    className="p-1 text-gray-400 hover:text-error transition-colors"
                  >
                    <ApperIcon name="Trash2" className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Current Average</span>
                    {average !== null ? (
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        average >= 90 ? 'bg-success/10 text-success' :
                        average >= 80 ? 'bg-warning/10 text-warning' :
                        average >= 70 ? 'bg-accent/10 text-accent' :
                        'bg-error/10 text-error'
                      }`}>
                        {Math.round(average)}%
                      </span>
                    ) : (
                      <span className="text-sm text-gray-400">No grades</span>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Attendance</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      attendanceStats.rate >= 95 ? 'bg-success/10 text-success' :
                      attendanceStats.rate >= 90 ? 'bg-warning/10 text-warning' :
                      'bg-error/10 text-error'
                    }`}>
                      {Math.round(attendanceStats.rate)}%
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Total Assignments</span>
                    <span className="text-sm font-medium text-gray-900">
                      {studentGrades.length}
                    </span>
                  </div>

                  {student.parentContact && (
                    <div className="pt-2 border-t border-gray-100">
                      <div className="flex items-center text-sm text-gray-600">
                        <ApperIcon name="Phone" className="w-4 h-4 mr-2" />
                        {student.parentContact}
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-4 text-xs text-gray-500 text-center">
                  Click to view details
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Student Detail Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-xl font-medium text-white">
                    {selectedStudent.firstName.charAt(0)}{selectedStudent.lastName.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-xl font-heading font-bold text-gray-900">
                      {selectedStudent.firstName} {selectedStudent.lastName}
                    </h2>
                    <p className="text-gray-600">{selectedStudent.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedStudent(null)}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <ApperIcon name="X" className="w-5 h-5" />
                </button>
              </div>

              {/* Student Stats */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-primary">
                    {Math.round(calculateStudentAverage(selectedStudent.id) || 0)}%
                  </p>
                  <p className="text-sm text-gray-600">Average Grade</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-secondary">
                    {Math.round(getStudentAttendance(selectedStudent.id).rate)}%
                  </p>
                  <p className="text-sm text-gray-600">Attendance</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-accent">
                    {getStudentGrades(selectedStudent.id).length}
                  </p>
                  <p className="text-sm text-gray-600">Assignments</p>
                </div>
              </div>

              {/* Contact Information */}
              <div className="mb-6">
                <h3 className="text-lg font-heading font-semibold text-gray-900 mb-4">
                  Contact Information
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <ApperIcon name="Mail" className="w-4 h-4 text-gray-400 mr-3" />
                    <span className="text-gray-900">{selectedStudent.email}</span>
                  </div>
                  {selectedStudent.parentContact && (
                    <div className="flex items-center">
                      <ApperIcon name="Phone" className="w-4 h-4 text-gray-400 mr-3" />
                      <span className="text-gray-900">{selectedStudent.parentContact}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Notes */}
              {selectedStudent.notes && (
                <div className="mb-6">
                  <h3 className="text-lg font-heading font-semibold text-gray-900 mb-4">
                    Notes
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-700">{selectedStudent.notes}</p>
                  </div>
                </div>
              )}

              {/* Recent Grades */}
              <div>
                <h3 className="text-lg font-heading font-semibold text-gray-900 mb-4">
                  Recent Grades
                </h3>
                {getStudentGrades(selectedStudent.id).length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <ApperIcon name="FileText" className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No grades recorded yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {getStudentGrades(selectedStudent.id)
                      .sort((a, b) => new Date(b.submittedDate) - new Date(a.submittedDate))
                      .slice(0, 5)
                      .map((grade) => (
                        <div
                          key={grade.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div>
                            <p className="font-medium text-gray-900">Assignment #{grade.assignmentId.slice(-4)}</p>
                            <p className="text-sm text-gray-500">
                              {new Date(grade.submittedDate).toLocaleDateString()}
                            </p>
                          </div>
                          <span className={`px-3 py-1 rounded-lg text-sm font-medium ${
                            (grade.score / 100) * 100 >= 90 ? 'bg-success/10 text-success' :
                            (grade.score / 100) * 100 >= 80 ? 'bg-warning/10 text-warning' :
                            (grade.score / 100) * 100 >= 70 ? 'bg-accent/10 text-accent' :
                            'bg-error/10 text-error'
                          }`}>
                            {grade.score}/100
                          </span>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Students;