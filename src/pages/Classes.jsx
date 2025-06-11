import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import ApperIcon from '../components/ApperIcon';
import classService from '../services/api/classService';
import studentService from '../services/api/studentService';

const Classes = () => {
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedClass, setSelectedClass] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    period: '',
    room: '',
    time: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [classesData, studentsData] = await Promise.all([
        classService.getAll(),
        studentService.getAll()
      ]);
      setClasses(classesData);
      setStudents(studentsData);
    } catch (err) {
      setError(err.message || 'Failed to load classes');
      toast.error('Failed to load classes');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClass = async (e) => {
    e.preventDefault();
    
    try {
      const newClass = {
        ...formData,
        studentIds: [],
        schedule: {
          time: formData.time,
          days: [1, 2, 3, 4, 5] // Monday to Friday
        }
      };
      
      const created = await classService.create(newClass);
      setClasses(prev => [...prev, created]);
      setFormData({ name: '', subject: '', period: '', room: '', time: '' });
      setShowCreateForm(false);
      toast.success('Class created successfully');
    } catch (err) {
      toast.error('Failed to create class');
    }
  };

  const handleDeleteClass = async (classId) => {
    if (!window.confirm('Are you sure you want to delete this class?')) return;
    
    try {
      await classService.delete(classId);
      setClasses(prev => prev.filter(cls => cls.id !== classId));
      if (selectedClass?.id === classId) {
        setSelectedClass(null);
      }
      toast.success('Class deleted successfully');
    } catch (err) {
      toast.error('Failed to delete class');
    }
  };

  const getStudentsInClass = (classObj) => {
    if (!classObj.studentIds) return [];
    return students.filter(student => classObj.studentIds.includes(student.id));
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg p-6 shadow-sm">
              <div className="animate-pulse space-y-4">
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
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
          <h3 className="text-lg font-medium text-gray-900 mb-2">Unable to load classes</h3>
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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-heading font-bold text-gray-900">Classes</h1>
          <p className="text-gray-600">Manage your class rosters and settings</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
        >
          <ApperIcon name="Plus" className="w-4 h-4 mr-2" />
          Add Class
        </button>
      </div>

      {/* Create Class Form */}
      {showCreateForm && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg p-6 shadow-sm mb-6"
        >
          <h3 className="text-lg font-heading font-semibold text-gray-900 mb-4">Create New Class</h3>
          <form onSubmit={handleCreateClass} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Class Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="e.g., Advanced Mathematics"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subject
                </label>
                <input
                  type="text"
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="e.g., Mathematics"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Period
                </label>
                <input
                  type="text"
                  required
                  value={formData.period}
                  onChange={(e) => setFormData(prev => ({ ...prev, period: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="e.g., 1st"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Room
                </label>
                <input
                  type="text"
                  required
                  value={formData.room}
                  onChange={(e) => setFormData(prev => ({ ...prev, room: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="e.g., 101A"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Time
                </label>
                <input
                  type="time"
                  required
                  value={formData.time}
                  onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                type="submit"
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                Create Class
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

      {/* Classes Grid */}
      {classes.length === 0 ? (
        <div className="bg-white rounded-lg p-12 shadow-sm text-center">
          <ApperIcon name="Users" className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No classes yet</h3>
          <p className="text-gray-600 mb-4">Create your first class to get started</p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            Create First Class
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((classObj, index) => {
            const classStudents = getStudentsInClass(classObj);
            
            return (
              <motion.div
                key={classObj.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedClass(classObj)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-heading font-semibold text-gray-900 truncate">
                      {classObj.name}
                    </h3>
                    <p className="text-sm text-gray-600">{classObj.subject}</p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteClass(classObj.id);
                    }}
                    className="p-1 text-gray-400 hover:text-error transition-colors"
                  >
                    <ApperIcon name="Trash2" className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <ApperIcon name="Clock" className="w-4 h-4 mr-2" />
                    Period {classObj.period} • {classObj.schedule?.time || 'TBD'}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <ApperIcon name="MapPin" className="w-4 h-4 mr-2" />
                    Room {classObj.room}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <ApperIcon name="Users" className="w-4 h-4 mr-2" />
                    {classStudents.length} students
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex -space-x-2">
                    {classStudents.slice(0, 3).map((student) => (
                      <div
                        key={student.id}
                        className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-xs font-medium text-white border-2 border-white"
                      >
                        {student.firstName.charAt(0)}{student.lastName.charAt(0)}
                      </div>
                    ))}
                    {classStudents.length > 3 && (
                      <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center text-xs font-medium text-white border-2 border-white">
                        +{classStudents.length - 3}
                      </div>
                    )}
                  </div>
                  <span className="text-xs text-gray-500">
                    Click to view details
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Class Detail Modal */}
      {selectedClass && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-heading font-bold text-gray-900">
                    {selectedClass.name}
                  </h2>
                  <p className="text-gray-600">{selectedClass.subject}</p>
                </div>
                <button
                  onClick={() => setSelectedClass(null)}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <ApperIcon name="X" className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-500 mb-1">Period</p>
                  <p className="font-medium">{selectedClass.period}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-500 mb-1">Room</p>
                  <p className="font-medium">{selectedClass.room}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-500 mb-1">Time</p>
                  <p className="font-medium">{selectedClass.schedule?.time || 'TBD'}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-500 mb-1">Students</p>
                  <p className="font-medium">{getStudentsInClass(selectedClass).length}</p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-heading font-semibold text-gray-900 mb-4">
                  Student Roster
                </h3>
                {getStudentsInClass(selectedClass).length === 0 ? (
                  <div className="text-center py-8">
                    <ApperIcon name="UserPlus" className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No students enrolled</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {getStudentsInClass(selectedClass).map((student) => (
                      <div
                        key={student.id}
                        className="flex items-center p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-sm font-medium text-white mr-3">
                          {student.firstName.charAt(0)}{student.lastName.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900">
                            {student.firstName} {student.lastName}
                          </p>
                          <p className="text-sm text-gray-500">{student.email}</p>
                        </div>
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

export default Classes;