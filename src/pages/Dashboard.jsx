import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import ApperIcon from '../components/ApperIcon';
import classService from '../services/api/classService';
import assignmentService from '../services/api/assignmentService';
import attendanceService from '../services/api/attendanceService';
import gradeService from '../services/api/gradeService';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    todayClasses: [],
    upcomingAssignments: [],
    recentGrades: [],
    attendanceSummary: null,
    totalStudents: 0
  });

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const [classes, assignments, grades, attendance] = await Promise.all([
          classService.getAll(),
          assignmentService.getAll(),
          gradeService.getAll(),
          attendanceService.getAll()
        ]);

        // Calculate dashboard metrics
        const today = new Date().toDateString();
        const todayClasses = classes.filter(cls => 
          cls.schedule && cls.schedule.days && cls.schedule.days.includes(new Date().getDay())
        );

        const upcomingAssignments = assignments
          .filter(assignment => new Date(assignment.dueDate) >= new Date())
          .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
          .slice(0, 5);

        const recentGrades = grades
          .sort((a, b) => new Date(b.submittedDate) - new Date(a.submittedDate))
          .slice(0, 5);

        const todayAttendance = attendance.filter(att => 
          new Date(att.date).toDateString() === today
        );
        
        const presentCount = todayAttendance.filter(att => att.status === 'present').length;
        const totalCount = todayAttendance.length;
        const attendanceRate = totalCount > 0 ? (presentCount / totalCount) * 100 : 0;

        const totalStudents = classes.reduce((sum, cls) => sum + (cls.studentIds?.length || 0), 0);

        setDashboardData({
          todayClasses,
          upcomingAssignments,
          recentGrades,
          attendanceSummary: {
            present: presentCount,
            total: totalCount,
            rate: attendanceRate
          },
          totalStudents
        });
      } catch (err) {
        setError(err.message || 'Failed to load dashboard data');
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg p-6 shadow-sm">
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              </div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg p-6 shadow-sm">
              <div className="animate-pulse space-y-4">
                <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                <div className="space-y-3">
                  {[...Array(3)].map((_, j) => (
                    <div key={j} className="h-4 bg-gray-200 rounded"></div>
                  ))}
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
          <h3 className="text-lg font-medium text-gray-900 mb-2">Unable to load dashboard</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const { todayClasses, upcomingAssignments, recentGrades, attendanceSummary, totalStudents } = dashboardData;

  return (
    <div className="p-6 space-y-6 max-w-full overflow-hidden">
      {/* Welcome Header */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-heading font-bold text-gray-900">
              Good morning, Teacher!
            </h1>
            <p className="text-gray-600 mt-1">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Today's classes</p>
            <p className="text-2xl font-bold text-primary">{todayClasses.length}</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg p-6 shadow-sm"
        >
          <div className="flex items-center">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <ApperIcon name="Users" className="w-6 h-6 text-primary" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Students</p>
              <p className="text-2xl font-bold text-gray-900">{totalStudents}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg p-6 shadow-sm"
        >
          <div className="flex items-center">
            <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center">
              <ApperIcon name="BookOpen" className="w-6 h-6 text-secondary" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Active Classes</p>
              <p className="text-2xl font-bold text-gray-900">{todayClasses.length}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-lg p-6 shadow-sm"
        >
          <div className="flex items-center">
            <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
              <ApperIcon name="ClipboardList" className="w-6 h-6 text-accent" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Pending Assignments</p>
              <p className="text-2xl font-bold text-gray-900">{upcomingAssignments.length}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-lg p-6 shadow-sm"
        >
          <div className="flex items-center">
            <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center">
              <ApperIcon name="UserCheck" className="w-6 h-6 text-success" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Attendance Rate</p>
              <p className="text-2xl font-bold text-gray-900">
                {attendanceSummary ? Math.round(attendanceSummary.rate) : 0}%
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Today's Schedule & Upcoming Assignments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Classes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-lg p-6 shadow-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-heading font-semibold text-gray-900">Today's Classes</h3>
            <ApperIcon name="Calendar" className="w-5 h-5 text-gray-400" />
          </div>
          {todayClasses.length === 0 ? (
            <div className="text-center py-8">
              <ApperIcon name="Coffee" className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No classes scheduled for today</p>
            </div>
          ) : (
            <div className="space-y-3">
              {todayClasses.map((cls, index) => (
                <motion.div
                  key={cls.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="w-3 h-3 bg-primary rounded-full mr-3"></div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{cls.name}</p>
                    <p className="text-sm text-gray-500">
                      Period {cls.period} • Room {cls.room}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {cls.schedule?.time || '9:00 AM'}
                    </p>
                    <p className="text-xs text-gray-500">{cls.studentIds?.length || 0} students</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Upcoming Assignments */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-lg p-6 shadow-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-heading font-semibold text-gray-900">Upcoming Assignments</h3>
            <ApperIcon name="Clock" className="w-5 h-5 text-gray-400" />
          </div>
          {upcomingAssignments.length === 0 ? (
            <div className="text-center py-8">
              <ApperIcon name="CheckCircle" className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">All caught up!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingAssignments.map((assignment, index) => (
                <motion.div
                  key={assignment.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{assignment.title}</p>
                    <p className="text-sm text-gray-500">{assignment.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(assignment.dueDate).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-gray-500">{assignment.points} pts</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-white rounded-lg p-6 shadow-sm"
      >
        <h3 className="text-lg font-heading font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="flex flex-col items-center p-4 bg-primary/5 rounded-lg hover:bg-primary/10 transition-colors group">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <ApperIcon name="UserPlus" className="w-6 h-6 text-white" />
            </div>
            <span className="text-sm font-medium text-gray-700">Take Attendance</span>
          </button>
          
          <button className="flex flex-col items-center p-4 bg-secondary/5 rounded-lg hover:bg-secondary/10 transition-colors group">
            <div className="w-12 h-12 bg-secondary rounded-lg flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <ApperIcon name="PlusCircle" className="w-6 h-6 text-white" />
            </div>
            <span className="text-sm font-medium text-gray-700">Add Assignment</span>
          </button>
          
          <button className="flex flex-col items-center p-4 bg-accent/5 rounded-lg hover:bg-accent/10 transition-colors group">
            <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <ApperIcon name="Edit3" className="w-6 h-6 text-white" />
            </div>
            <span className="text-sm font-medium text-gray-700">Enter Grades</span>
          </button>
          
          <button className="flex flex-col items-center p-4 bg-success/5 rounded-lg hover:bg-success/10 transition-colors group">
            <div className="w-12 h-12 bg-success rounded-lg flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <ApperIcon name="FileText" className="w-6 h-6 text-white" />
            </div>
            <span className="text-sm font-medium text-gray-700">Plan Lesson</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;