import { toast } from 'react-toastify';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

class GradeService {
  constructor() {
    this.tableName = 'grade';
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
        fields: ['Name', 'score', 'submitted_date', 'feedback', 'student_id', 'assignment_id', 'Tags', 'Owner', 'CreatedOn', 'CreatedBy', 'ModifiedOn', 'ModifiedBy']
      };
      
      const response = await client.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return [];
      }
      
      return response.data || [];
    } catch (error) {
      console.error("Error fetching grades:", error);
      throw error;
    }
  }

  async getById(id) {
    await delay(200);
    try {
      const client = this.getApperClient();
      const params = {
        fields: ['Name', 'score', 'submitted_date', 'feedback', 'student_id', 'assignment_id', 'Tags', 'Owner', 'CreatedOn', 'CreatedBy', 'ModifiedOn', 'ModifiedBy']
      };
      
      const response = await client.getRecordById(this.tableName, id, params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }
      
      return response.data;
    } catch (error) {
      console.error(`Error fetching grade with ID ${id}:`, error);
      throw error;
    }
  }

  async create(gradeData) {
    await delay(400);
    try {
      const client = this.getApperClient();
      
      // Only include Updateable fields
      const recordData = {
        Name: gradeData.Name || `Grade for ${gradeData.studentId}-${gradeData.assignmentId}`,
        score: parseInt(gradeData.score),
        submitted_date: gradeData.submittedDate || gradeData.submitted_date || new Date().toISOString(),
        feedback: gradeData.feedback || '',
        student_id: parseInt(gradeData.studentId || gradeData.student_id),
        assignment_id: parseInt(gradeData.assignmentId || gradeData.assignment_id),
        Tags: gradeData.tags || '',
        Owner: gradeData.owner || 1
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
          console.error(`Failed to create ${failedRecords.length} grades:${failedRecords}`);
          
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
      console.error("Error creating grade:", error);
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
        ...(updates.Name !== undefined && { Name: updates.Name }),
        ...(updates.score !== undefined && { score: parseInt(updates.score) }),
        ...(updates.submittedDate !== undefined && { submitted_date: updates.submittedDate }),
        ...(updates.submitted_date !== undefined && { submitted_date: updates.submitted_date }),
        ...(updates.feedback !== undefined && { feedback: updates.feedback }),
        ...(updates.studentId !== undefined && { student_id: parseInt(updates.studentId) }),
        ...(updates.student_id !== undefined && { student_id: parseInt(updates.student_id) }),
        ...(updates.assignmentId !== undefined && { assignment_id: parseInt(updates.assignmentId) }),
        ...(updates.assignment_id !== undefined && { assignment_id: parseInt(updates.assignment_id) }),
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
          console.error(`Failed to update ${failedUpdates.length} grades:${failedUpdates}`);
          
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
      console.error("Error updating grade:", error);
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
          console.error(`Failed to delete ${failedDeletions.length} grades:${failedDeletions}`);
          
          failedDeletions.forEach(record => {
            if (record.message) toast.error(record.message);
          });
        }
        
        return successfulDeletions.length > 0;
      }
      
      return false;
    } catch (error) {
      console.error("Error deleting grade:", error);
      throw error;
    }
  }
}

export default new GradeService();