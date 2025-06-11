import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import ApperIcon from '../components/ApperIcon';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full text-center"
      >
        <div className="mb-8">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <ApperIcon name="GraduationCap" className="w-10 h-10 text-white" />
          </motion.div>
          <h1 className="text-6xl font-bold text-gray-900 mb-2">404</h1>
          <h2 className="text-2xl font-heading font-semibold text-gray-700 mb-4">
            Page Not Found
          </h2>
          <p className="text-gray-600 mb-8">
            Looks like this page took an unscheduled break. Let's get you back to class!
          </p>
        </div>

        <div className="space-y-4">
          <Link
            to="/dashboard"
            className="inline-flex items-center px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            <ApperIcon name="Home" className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
          
          <div className="text-sm text-gray-500">
            or try one of these:
          </div>
          
          <div className="flex flex-wrap justify-center gap-2">
            <Link
              to="/classes"
              className="px-3 py-1 text-sm bg-white border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors"
            >
              Classes
            </Link>
            <Link
              to="/gradebook"
              className="px-3 py-1 text-sm bg-white border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors"
            >
              Gradebook
            </Link>
            <Link
              to="/students"
              className="px-3 py-1 text-sm bg-white border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors"
            >
              Students
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFound;