import Dashboard from '../pages/Dashboard';
import Classes from '../pages/Classes';
import LessonPlans from '../pages/LessonPlans';
import Gradebook from '../pages/Gradebook';
import Students from '../pages/Students';
import Calendar from '../pages/Calendar';

export const routes = {
  dashboard: {
    id: 'dashboard',
    label: 'Dashboard',
    path: '/dashboard',
    icon: 'LayoutDashboard',
    component: Dashboard
  },
  classes: {
    id: 'classes',
    label: 'Classes',
    path: '/classes',
    icon: 'Users',
    component: Classes
  },
  lessonPlans: {
    id: 'lessonPlans',
    label: 'Lesson Plans',
    path: '/lesson-plans',
    icon: 'BookOpen',
    component: LessonPlans
  },
  gradebook: {
    id: 'gradebook',
    label: 'Gradebook',
    path: '/gradebook',
    icon: 'Calculator',
    component: Gradebook
  },
  students: {
    id: 'students',
    label: 'Students',
    path: '/students',
    icon: 'UserCheck',
    component: Students
  },
  calendar: {
    id: 'calendar',
    label: 'Calendar',
    path: '/calendar',
    icon: 'Calendar',
    component: Calendar
  }
};

export const routeArray = Object.values(routes);