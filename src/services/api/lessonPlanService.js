import { toast } from 'react-toastify';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

class LessonPlanService {
  constructor() {
    this.tableName = 'lesson_plan';
    this.apperClient = null;
  }

  getApperClient() {
    if (!this.apperClient) {
      const { ApperClient } = window.ApperSDK;
      this.apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });
    }
    return this.apperClient;
  }

  async getAll() {
    await delay(300);
    try {
      const client = this.getApperClient();
      const params = {
        fields: ['Name', 'date', 'title', 'objectives', 'activities', 'materials', 'homework', 'class_id', 'Tags', 'Owner', 'CreatedOn', 'CreatedBy', 'ModifiedOn', 'ModifiedBy']
      };
      
      const response = await client.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return [];
      }
      
      return response.data || [];
    } catch (error) {
      console.error("Error fetching lesson plans:", error);
      throw error;
    }
  }

  async getById(id) {
    await delay(200);
    try {
      const client = this.getApperClient();
      const params = {
        fields: ['Name', 'date', 'title', 'objectives', 'activities', 'materials', 'homework', 'class_id', 'Tags', 'Owner', 'CreatedOn', 'CreatedBy', 'ModifiedOn', 'ModifiedBy']
      };
      
      const response = await client.getRecordById(this.tableName, id, params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }
      
      return response.data;
    } catch (error) {
      console.error(`Error fetching lesson plan with ID ${id}:`, error);
      throw error;
    }
  }

  async create(lessonData) {
    await delay(400);
    try {
      const client = this.getApperClient();
      
      // Only include Updateable fields
      const recordData = {
        Name: lessonData.title || lessonData.Name,
        date: lessonData.date,
        title: lessonData.title,
        objectives: Array.isArray(lessonData.objectives) ? lessonData.objectives.join('\n') : lessonData.objectives || '',
        activities: Array.isArray(lessonData.activities) ? lessonData.activities.join('\n') : lessonData.activities || '',
        materials: Array.isArray(lessonData.materials) ? lessonData.materials.join('\n') : lessonData.materials || '',
        homework: lessonData.homework || '',
        class_id: parseInt(lessonData.classId || lessonData.class_id),
        Tags: lessonData.tags || '',
        Owner: lessonData.owner || 1
      };
      
      const params = {
        records: [recordData]
      };
      
      const response = await client.createRecord(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }
      
      if (response.results) {
        const successfulRecords = response.results.filter(result => result.success);
        const failedRecords = response.results.filter(result => !result.success);
        
        if (failedRecords.length > 0) {
          console.error(`Failed to create ${failedRecords.length} lesson plans:${failedRecords}`);
          
          failedRecords.forEach(record => {
            record.errors?.forEach(error => {
              toast.error(`${error.fieldLabel}: ${error.message}`);
            });
            if (record.message) toast.error(record.message);
          });
        }
        
        if (successfulRecords.length > 0) {
          return successfulRecords[0].data;
        }
      }
      
      return null;
    } catch (error) {
      console.error("Error creating lesson plan:", error);
      throw error;
    }
  }

  async update(id, updates) {
    await delay(300);
    try {
      const client = this.getApperClient();
      
      // Only include Updateable fields plus Id
      const recordData = {
        Id: parseInt(id),
        ...(updates.title !== undefined && { Name: updates.title, title: updates.title }),
        ...(updates.Name !== undefined && { Name: updates.Name }),
        ...(updates.date !== undefined && { date: updates.date }),
        ...(updates.objectives !== undefined && { 
          objectives: Array.isArray(updates.objectives) ? updates.objectives.join('\n') : updates.objectives 
        }),
        ...(updates.activities !== undefined && { 
          activities: Array.isArray(updates.activities) ? updates.activities.join('\n') : updates.activities 
        }),
        ...(updates.materials !== undefined && { 
          materials: Array.isArray(updates.materials) ? updates.materials.join('\n') : updates.materials 
        }),
        ...(updates.homework !== undefined && { homework: updates.homework }),
        ...(updates.classId !== undefined && { class_id: parseInt(updates.classId) }),
        ...(updates.class_id !== undefined && { class_id: parseInt(updates.class_id) }),
        ...(updates.tags !== undefined && { Tags: updates.tags }),
        ...(updates.Tags !== undefined && { Tags: updates.Tags }),
        ...(updates.owner !== undefined && { Owner: updates.owner }),
        ...(updates.Owner !== undefined && { Owner: updates.Owner })
      };
      
      const params = {
        records: [recordData]
      };
      
      const response = await client.updateRecord(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }
      
      if (response.results) {
        const successfulUpdates = response.results.filter(result => result.success);
        const failedUpdates = response.results.filter(result => !result.success);
        
        if (failedUpdates.length > 0) {
          console.error(`Failed to update ${failedUpdates.length} lesson plans:${failedUpdates}`);
          
          failedUpdates.forEach(record => {
            record.errors?.forEach(error => {
              toast.error(`${error.fieldLabel}: ${error.message}`);
            });
            if (record.message) toast.error(record.message);
          });
        }
        
        if (successfulUpdates.length > 0) {
          return successfulUpdates[0].data;
        }
      }
      
      return null;
    } catch (error) {
      console.error("Error updating lesson plan:", error);
      throw error;
    }
  }

  async delete(id) {
    await delay(200);
    try {
      const client = this.getApperClient();
      const params = {
        RecordIds: [parseInt(id)]
      };
      
      const response = await client.deleteRecord(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return false;
      }
      
      if (response.results) {
        const successfulDeletions = response.results.filter(result => result.success);
        const failedDeletions = response.results.filter(result => !result.success);
        
        if (failedDeletions.length > 0) {
          console.error(`Failed to delete ${failedDeletions.length} lesson plans:${failedDeletions}`);
          
          failedDeletions.forEach(record => {
            if (record.message) toast.error(record.message);
          });
        }
        
        return successfulDeletions.length > 0;
      }
      
      return false;
    } catch (error) {
      console.error("Error deleting lesson plan:", error);
      throw error;
    }
  }
}

export default new LessonPlanService();