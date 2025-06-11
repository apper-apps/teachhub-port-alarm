import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import ApperIcon from '../components/ApperIcon';
import classService from '../services/api/classService';
import studentService from '../services/api/studentService';
import assignmentService from '../services/api/assignmentService';
import gradeService from '../services/api/gradeService';

const Gradebook = () => {
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedClass, setSelectedClass] = useState('');
  const [editingGrade, setEditingGrade] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [classesData, studentsData, assignmentsData, gradesData] = await Promise.all([
        classService.getAll(),
        studentService.getAll(),
        assignmentService.getAll(),
        gradeService.getAll()
      ]);
      
      setClasses(classesData);
      setStudents(studentsData);
      setAssignments(assignmentsData);
      setGrades(gradesData);
      
      if (classesData.length > 0 && !selectedClass) {
        setSelectedClass(classesData[0].id);
      }
    } catch (err) {
      setError(err.message || 'Failed to load gradebook data');
      toast.error('Failed to load gradebook data');
    } finally {
      setLoading(false);
    }
  };

  const getClassStudents = () => {
    if (!selectedClass) return [];
    const classObj = classes.find(cls => cls.id === selectedClass);
    if (!classObj || !classObj.studentIds) return [];
    return students.filter(student => classObj.studentIds.includes(student.id));
  };

  const getClassAssignments = () => {
    return assignments.filter(assignment => assignment.classId === selectedClass);
  };

  const getGrade = (studentId, assignmentId) => {
    return grades.find(grade => 
      grade.studentId === studentId && grade.assignmentId === assignmentId
    );
  };

  const calculateStudentAverage = (studentId) => {
    const classAssignments = getClassAssignments();
    const studentGrades = classAssignments.map(assignment => {
      const grade = getGrade(studentId, assignment.id);
      return grade ? (grade.score / assignment.points) * 100 : null;
    }).filter(score => score !== null);
    
    if (studentGrades.length === 0) return null;
    return studentGrades.reduce((sum, score) => sum + score, 0) / studentGrades.length;
  };

  const getGradeColor = (score, totalPoints) => {
    const percentage = (score / totalPoints) * 100;
    if (percentage >= 90) return 'text-success bg-success/10';
    if (percentage >= 80) return 'text-warning bg-warning/10';
    if (percentage >= 70) return 'text-accent bg-accent/10';
    return 'text-error bg-error/10';
  };

  const handleGradeUpdate = async (studentId, assignmentId, newScore) => {
    try {
      const existingGrade = getGrade(studentId, assignmentId);
      const assignment = assignments.find(a => a.id === assignmentId);
      
      // Validate score
      if (newScore < 0 || newScore > assignment.points) {
        toast.error(`Score must be between 0 and ${assignment.points}`);
        return;
      }
      
      if (existingGrade) {
        const updated = await gradeService.update(existingGrade.id, {
          ...existingGrade,
          score: parseFloat(newScore),
          submittedDate: new Date().toISOString()
        });
        setGrades(prev => prev.map(grade => 
          grade.id === existingGrade.id ? updated : grade
        ));
      } else {
        const newGrade = await gradeService.create({
          studentId,
          assignmentId,
          score: parseFloat(newScore),
          submittedDate: new Date().toISOString(),
          feedback: ''
        });
        setGrades(prev => [...prev, newGrade]);
      }
      
      setEditingGrade(null);
      toast.success('Grade updated successfully');
    } catch (err) {
      toast.error('Failed to update grade');
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-lg p-8 shadow-sm text-center">
          <ApperIcon name="AlertCircle" className="w-12 h-12 text-error mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Unable to load gradebook</h3>
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

  const classStudents = getClassStudents();
  const classAssignments = getClassAssignments();

  return (
    <div className="p-6 max-w-full overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-heading font-bold text-gray-900">Gradebook</h1>
          <p className="text-gray-600">Track and manage student grades</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="">Select a class</option>
            {classes.map(cls => (
              <option key={cls.id} value={cls.id}>
                {cls.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {!selectedClass ? (
        <div className="bg-white rounded-lg p-12 shadow-sm text-center">
          <ApperIcon name="Calculator" className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Select a class</h3>
          <p className="text-gray-600">Choose a class to view and manage grades</p>
        </div>
      ) : classStudents.length === 0 ? (
        <div className="bg-white rounded-lg p-12 shadow-sm text-center">
          <ApperIcon name="Users" className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No students enrolled</h3>
          <p className="text-gray-600">Add students to this class to start grading</p>
        </div>
      ) : classAssignments.length === 0 ? (
        <div className="bg-white rounded-lg p-12 shadow-sm text-center">
          <ApperIcon name="ClipboardList" className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No assignments yet</h3>
          <p className="text-gray-600">Create assignments to start recording grades</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="sticky left-0 bg-gray-50 px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r">
                    Student
                  </th>
                  {classAssignments.map(assignment => (
                    <th key={assignment.id} className="px-4 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-r min-w-[100px]">
                      <div className="space-y-1">
                        <div className="font-semibold truncate" title={assignment.title}>
                          {assignment.title}
                        </div>
                        <div className="text-gray-400">
                          {assignment.points} pts
                        </div>
                        <div className="text-gray-400">
                          {new Date(assignment.dueDate).toLocaleDateString()}
                        </div>
                      </div>
                    </th>
                  ))}
                  <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Average
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {classStudents.map((student, studentIndex) => {
                  const average = calculateStudentAverage(student.id);
                  
                  return (
                    <motion.tr
                      key={student.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: studentIndex * 0.05 }}
                      className="hover:bg-gray-50"
                    >
                      <td className="sticky left-0 bg-white px-6 py-4 border-r">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-sm font-medium text-white mr-3">
                            {student.firstName.charAt(0)}{student.lastName.charAt(0)}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              {student.firstName} {student.lastName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {student.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      
                      {classAssignments.map(assignment => {
                        const grade = getGrade(student.id, assignment.id);
                        const gradeKey = `${student.id}-${assignment.id}`;
                        const isEditing = editingGrade === gradeKey;
                        
                        return (
                          <td key={assignment.id} className="px-4 py-4 text-center border-r">
                            {isEditing ? (
                              <input
                                type="number"
                                min="0"
                                max={assignment.points}
                                step="0.1"
                                defaultValue={grade?.score || ''}
                                autoFocus
                                onBlur={(e) => {
                                  if (e.target.value !== '') {
                                    handleGradeUpdate(student.id, assignment.id, e.target.value);
                                  } else {
                                    setEditingGrade(null);
                                  }
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    if (e.target.value !== '') {
                                      handleGradeUpdate(student.id, assignment.id, e.target.value);
                                    } else {
                                      setEditingGrade(null);
                                    }
                                  } else if (e.key === 'Escape') {
                                    setEditingGrade(null);
                                  }
                                }}
                                className="w-16 px-2 py-1 text-center border border-primary rounded focus:outline-none focus:ring-2 focus:ring-primary"
                              />
                            ) : (
                              <button
                                onClick={() => setEditingGrade(gradeKey)}
                                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                                  grade 
                                    ? getGradeColor(grade.score, assignment.points)
                                    : 'text-gray-400 bg-gray-100 hover:bg-gray-200'
                                }`}
                              >
                                {grade ? `${grade.score}/${assignment.points}` : '—'}
                              </button>
                            )}
                          </td>
                        );
                      })}
                      
                      <td className="px-6 py-4 text-center">
                        {average !== null ? (
                          <span className={`px-3 py-1 rounded-lg text-sm font-medium ${
                            average >= 90 ? 'text-success bg-success/10' :
                            average >= 80 ? 'text-warning bg-warning/10' :
                            average >= 70 ? 'text-accent bg-accent/10' :
                            'text-error bg-error/10'
                          }`}>
                            {Math.round(average)}%
                          </span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {/* Grade Legend */}
          <div className="px-6 py-4 bg-gray-50 border-t">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Click on any grade cell to edit • Press Enter to save, Escape to cancel
              </div>
              <div className="flex items-center space-x-4 text-xs">
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-success/20 rounded"></div>
                  <span className="text-gray-600">90-100%</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-warning/20 rounded"></div>
                  <span className="text-gray-600">80-89%</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-accent/20 rounded"></div>
                  <span className="text-gray-600">70-79%</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-error/20 rounded"></div>
                  <span className="text-gray-600">Below 70%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Gradebook;