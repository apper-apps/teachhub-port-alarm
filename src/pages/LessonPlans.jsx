import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import ApperIcon from '../components/ApperIcon';
import lessonPlanService from '../services/api/lessonPlanService';
import classService from '../services/api/classService';

const LessonPlans = () => {
  const [lessonPlans, setLessonPlans] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedWeek, setSelectedWeek] = useState(new Date());
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [formData, setFormData] = useState({
    classId: '',
    date: '',
    title: '',
    objectives: [''],
    activities: [''],
    materials: [''],
    homework: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [lessonPlansData, classesData] = await Promise.all([
        lessonPlanService.getAll(),
        classService.getAll()
      ]);
      setLessonPlans(lessonPlansData);
      setClasses(classesData);
    } catch (err) {
      setError(err.message || 'Failed to load lesson plans');
      toast.error('Failed to load lesson plans');
    } finally {
      setLoading(false);
    }
  };

  const getWeekDates = (date) => {
    const week = [];
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay() + 1); // Start on Monday
    
    for (let i = 0; i < 5; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      week.push(day);
    }
    return week;
  };

  const getLessonPlansForDate = (date) => {
    const dateString = date.toDateString();
    return lessonPlans.filter(plan => 
      new Date(plan.date).toDateString() === dateString
    );
  };

  const handleCreateLesson = async (e) => {
    e.preventDefault();
    
    try {
      const newLessonPlan = {
        ...formData,
        objectives: formData.objectives.filter(obj => obj.trim()),
        activities: formData.activities.filter(act => act.trim()),
        materials: formData.materials.filter(mat => mat.trim())
      };
      
      const created = await lessonPlanService.create(newLessonPlan);
      setLessonPlans(prev => [...prev, created]);
      setFormData({
        classId: '',
        date: '',
        title: '',
        objectives: [''],
        activities: [''],
        materials: [''],
        homework: ''
      });
      setShowCreateForm(false);
      setSelectedDate(null);
      toast.success('Lesson plan created successfully');
    } catch (err) {
      toast.error('Failed to create lesson plan');
    }
  };

  const handleDragStart = (e, lessonPlan) => {
    e.dataTransfer.setData('text/plain', JSON.stringify(lessonPlan));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (e, targetDate) => {
    e.preventDefault();
    
    try {
      const lessonData = JSON.parse(e.dataTransfer.getData('text/plain'));
      const updatedLesson = {
        ...lessonData,
        date: targetDate.toISOString().split('T')[0]
      };
      
      await lessonPlanService.update(lessonData.id, updatedLesson);
      setLessonPlans(prev => 
        prev.map(plan => 
          plan.id === lessonData.id ? updatedLesson : plan
        )
      );
      toast.success('Lesson plan moved successfully');
    } catch (err) {
      toast.error('Failed to move lesson plan');
    }
  };

  const addArrayField = (field) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const updateArrayField = (field, index, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const removeArrayField = (field, index) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="grid grid-cols-5 gap-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="space-y-3">
                  <div className="h-6 bg-gray-200 rounded"></div>
                  <div className="h-32 bg-gray-200 rounded"></div>
                </div>
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
          <h3 className="text-lg font-medium text-gray-900 mb-2">Unable to load lesson plans</h3>
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

  const weekDates = getWeekDates(selectedWeek);

  return (
    <div className="p-6 max-w-full overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-heading font-bold text-gray-900">Lesson Plans</h1>
          <p className="text-gray-600">Plan and organize your weekly lessons</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
        >
          <ApperIcon name="Plus" className="w-4 h-4 mr-2" />
          Add Lesson
        </button>
      </div>

      {/* Week Navigation */}
      <div className="bg-white rounded-lg p-4 shadow-sm mb-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => {
              const prevWeek = new Date(selectedWeek);
              prevWeek.setDate(selectedWeek.getDate() - 7);
              setSelectedWeek(prevWeek);
            }}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ApperIcon name="ChevronLeft" className="w-5 h-5" />
          </button>
          
          <h2 className="text-lg font-heading font-semibold text-gray-900">
            Week of {weekDates[0].toLocaleDateString('en-US', { 
              month: 'long', 
              day: 'numeric',
              year: 'numeric'
            })}
          </h2>
          
          <button
            onClick={() => {
              const nextWeek = new Date(selectedWeek);
              nextWeek.setDate(selectedWeek.getDate() + 7);
              setSelectedWeek(nextWeek);
            }}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ApperIcon name="ChevronRight" className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Weekly Calendar Grid */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <div className="grid grid-cols-5 gap-4">
          {weekDates.map((date, index) => {
            const dayLessons = getLessonPlansForDate(date);
            const isToday = date.toDateString() === new Date().toDateString();
            
            return (
              <div
                key={index}
                className={`min-h-[300px] border-2 border-dashed rounded-lg p-3 ${
                  isToday ? 'border-primary bg-primary/5' : 'border-gray-200'
                }`}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, date)}
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {date.toLocaleDateString('en-US', { weekday: 'short' })}
                    </h3>
                    <p className={`text-sm ${isToday ? 'text-primary font-medium' : 'text-gray-500'}`}>
                      {date.getDate()}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedDate(date);
                      setFormData(prev => ({
                        ...prev,
                        date: date.toISOString().split('T')[0]
                      }));
                      setShowCreateForm(true);
                    }}
                    className="p-1 text-gray-400 hover:text-primary transition-colors"
                  >
                    <ApperIcon name="Plus" className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="space-y-2">
                  {dayLessons.map((lesson) => {
                    const lessonClass = classes.find(cls => cls.id === lesson.classId);
                    
                    return (
                      <motion.div
                        key={lesson.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        draggable
                        onDragStart={(e) => handleDragStart(e, lesson)}
                        className="bg-secondary/10 border border-secondary/20 rounded-lg p-3 cursor-move hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-gray-900 text-sm truncate">
                            {lesson.title}
                          </h4>
                          <ApperIcon name="GripVertical" className="w-3 h-3 text-gray-400" />
                        </div>
                        <p className="text-xs text-gray-600 mb-1">
                          {lessonClass?.name || 'Unknown Class'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {lesson.objectives.length} objectives
                        </p>
                      </motion.div>
                    );
                  })}
                  
                  {dayLessons.length === 0 && (
                    <div className="text-center py-8">
                      <ApperIcon name="Calendar" className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                      <p className="text-xs text-gray-500">No lessons planned</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Create Lesson Form Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-heading font-bold text-gray-900">
                  Create Lesson Plan
                </h2>
                <button
                  onClick={() => {
                    setShowCreateForm(false);
                    setSelectedDate(null);
                  }}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <ApperIcon name="X" className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateLesson} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Class
                    </label>
                    <select
                      required
                      value={formData.classId}
                      onChange={(e) => setFormData(prev => ({ ...prev, classId: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="">Select a class</option>
                      {classes.map(cls => (
                        <option key={cls.id} value={cls.id}>
                          {cls.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.date}
                      onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Lesson Title
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="e.g., Introduction to Algebra"
                  />
                </div>

                {/* Objectives */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Learning Objectives
                    </label>
                    <button
                      type="button"
                      onClick={() => addArrayField('objectives')}
                      className="text-sm text-primary hover:text-primary/80"
                    >
                      + Add Objective
                    </button>
                  </div>
                  <div className="space-y-2">
                    {formData.objectives.map((objective, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={objective}
                          onChange={(e) => updateArrayField('objectives', index, e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                          placeholder="Learning objective"
                        />
                        {formData.objectives.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeArrayField('objectives', index)}
                            className="p-2 text-gray-400 hover:text-error transition-colors"
                          >
                            <ApperIcon name="X" className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Activities */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Activities
                    </label>
                    <button
                      type="button"
                      onClick={() => addArrayField('activities')}
                      className="text-sm text-primary hover:text-primary/80"
                    >
                      + Add Activity
                    </button>
                  </div>
                  <div className="space-y-2">
                    {formData.activities.map((activity, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={activity}
                          onChange={(e) => updateArrayField('activities', index, e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                          placeholder="Class activity"
                        />
                        {formData.activities.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeArrayField('activities', index)}
                            className="p-2 text-gray-400 hover:text-error transition-colors"
                          >
                            <ApperIcon name="X" className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Materials */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Materials Needed
                    </label>
                    <button
                      type="button"
                      onClick={() => addArrayField('materials')}
                      className="text-sm text-primary hover:text-primary/80"
                    >
                      + Add Material
                    </button>
                  </div>
                  <div className="space-y-2">
                    {formData.materials.map((material, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={material}
                          onChange={(e) => updateArrayField('materials', index, e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                          placeholder="Required material"
                        />
                        {formData.materials.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeArrayField('materials', index)}
                            className="p-2 text-gray-400 hover:text-error transition-colors"
                          >
                            <ApperIcon name="X" className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Homework Assignment
                  </label>
                  <textarea
                    value={formData.homework}
                    onChange={(e) => setFormData(prev => ({ ...prev, homework: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    rows="3"
                    placeholder="Homework details (optional)"
                  />
                </div>

                <div className="flex items-center space-x-3">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    Create Lesson Plan
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateForm(false);
                      setSelectedDate(null);
                    }}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default LessonPlans;