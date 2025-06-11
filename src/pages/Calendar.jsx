import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import ApperIcon from '../components/ApperIcon';
import lessonPlanService from '../services/api/lessonPlanService';
import assignmentService from '../services/api/assignmentService';

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [lessonPlans, setLessonPlans] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [view, setView] = useState('month'); // month, week, day

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [lessonPlansData, assignmentsData] = await Promise.all([
        lessonPlanService.getAll(),
        assignmentService.getAll()
      ]);
      setLessonPlans(lessonPlansData);
      setAssignments(assignmentsData);
    } catch (err) {
      setError(err.message || 'Failed to load calendar data');
      toast.error('Failed to load calendar data');
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const getEventsForDate = (date) => {
    if (!date) return [];
    
    const dateString = date.toDateString();
    const events = [];
    
    // Add lesson plans
    lessonPlans.forEach(lesson => {
      if (new Date(lesson.date).toDateString() === dateString) {
        events.push({
          id: lesson.id,
          title: lesson.title,
          type: 'lesson',
          time: lesson.time || '9:00 AM',
          color: 'bg-primary text-white'
        });
      }
    });
    
    // Add assignments
    assignments.forEach(assignment => {
      if (new Date(assignment.dueDate).toDateString() === dateString) {
        events.push({
          id: assignment.id,
          title: assignment.title,
          type: 'assignment',
          time: 'Due',
          color: 'bg-accent text-white'
        });
      }
    });
    
    return events;
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const navigateToToday = () => {
    setCurrentDate(new Date());
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="grid grid-cols-7 gap-4">
              {[...Array(35)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 rounded"></div>
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
          <h3 className="text-lg font-medium text-gray-900 mb-2">Unable to load calendar</h3>
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

  const monthDays = getDaysInMonth(currentDate);
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="p-6 max-w-full overflow-hidden">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 space-y-4 md:space-y-0">
        <div>
          <h1 className="text-2xl font-heading font-bold text-gray-900">Calendar</h1>
          <p className="text-gray-600">View lessons, assignments, and events</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setView('month')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                view === 'month' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setView('week')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                view === 'week' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setView('day')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                view === 'day' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
              }`}
            >
              Day
            </button>
          </div>
          
          <button
            onClick={navigateToToday}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Today
          </button>
        </div>
      </div>

      {/* Calendar Navigation */}
      <div className="bg-white rounded-lg p-4 shadow-sm mb-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigateMonth(-1)}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ApperIcon name="ChevronLeft" className="w-5 h-5" />
          </button>
          
          <h2 className="text-xl font-heading font-semibold text-gray-900">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          
          <button
            onClick={() => navigateMonth(1)}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ApperIcon name="ChevronRight" className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {/* Day Headers */}
        <div className="grid grid-cols-7 bg-gray-50 border-b">
          {dayNames.map(day => (
            <div key={day} className="p-3 text-center text-sm font-medium text-gray-500">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7">
          {monthDays.map((date, index) => {
            const events = date ? getEventsForDate(date) : [];
            const isToday = date && date.toDateString() === new Date().toDateString();
            const isCurrentMonth = date && date.getMonth() === currentDate.getMonth();
            
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.01 }}
                className={`min-h-[120px] border-r border-b p-2 ${
                  !isCurrentMonth ? 'bg-gray-50' : 'bg-white'
                } hover:bg-gray-50 transition-colors`}
              >
                {date && (
                  <>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-sm font-medium ${
                        isToday 
                          ? 'bg-primary text-white w-6 h-6 rounded-full flex items-center justify-center' 
                          : isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                      }`}>
                        {date.getDate()}
                      </span>
                    </div>
                    
                    <div className="space-y-1 overflow-hidden">
                      {events.slice(0, 3).map((event, eventIndex) => (
                        <motion.div
                          key={event.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: eventIndex * 0.1 }}
                          className={`px-2 py-1 rounded text-xs font-medium truncate ${event.color}`}
                          title={event.title}
                        >
                          {event.type === 'lesson' && (
                            <ApperIcon name="BookOpen" className="w-3 h-3 inline mr-1" />
                          )}
                          {event.type === 'assignment' && (
                            <ApperIcon name="ClipboardList" className="w-3 h-3 inline mr-1" />
                          )}
                          {event.title}
                        </motion.div>
                      ))}
                      
                      {events.length > 3 && (
                        <div className="text-xs text-gray-500 px-2">
                          +{events.length - 3} more
                        </div>
                      )}
                    </div>
                  </>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 bg-white rounded-lg p-4 shadow-sm">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Legend</h3>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-primary rounded"></div>
            <span className="text-sm text-gray-600">Lessons</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-accent rounded"></div>
            <span className="text-sm text-gray-600">Assignment Due</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-secondary rounded"></div>
            <span className="text-sm text-gray-600">Events</span>
          </div>
        </div>
      </div>

      {/* Upcoming Events Summary */}
      <div className="mt-6 bg-white rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-heading font-semibold text-gray-900 mb-4">
          Upcoming This Week
        </h3>
        
        {(() => {
          const today = new Date();
          const nextWeek = new Date(today);
          nextWeek.setDate(today.getDate() + 7);
          
          const upcomingEvents = [];
          
          // Get events for the next 7 days
          for (let i = 0; i < 7; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            const events = getEventsForDate(date);
            events.forEach(event => {
              upcomingEvents.push({ ...event, date });
            });
          }
          
          if (upcomingEvents.length === 0) {
            return (
              <div className="text-center py-8">
                <ApperIcon name="Calendar" className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No events scheduled for this week</p>
              </div>
            );
          }
          
          return (
            <div className="space-y-3">
              {upcomingEvents.slice(0, 5).map((event, index) => (
                <motion.div
                  key={`${event.id}-${event.date.getTime()}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center p-3 bg-gray-50 rounded-lg"
                >
                  <div className={`w-3 h-3 rounded-full mr-3 ${
                    event.type === 'lesson' ? 'bg-primary' : 'bg-accent'
                  }`}></div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{event.title}</p>
                    <p className="text-sm text-gray-500">
                      {event.date.toLocaleDateString('en-US', { 
                        weekday: 'short', 
                        month: 'short', 
                        day: 'numeric' 
                      })} • {event.time}
                    </p>
                  </div>
                  <div className="flex items-center">
                    {event.type === 'lesson' && (
                      <ApperIcon name="BookOpen" className="w-4 h-4 text-primary" />
                    )}
                    {event.type === 'assignment' && (
                      <ApperIcon name="ClipboardList" className="w-4 h-4 text-accent" />
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          );
        })()}
      </div>
    </div>
  );
};

export default Calendar;