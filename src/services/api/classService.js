import { toast } from 'react-toastify';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

class ClassService {
  constructor() {
    this.tableName = 'class';
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
        fields: ['Name', 'subject', 'period', 'room', 'time', 'student_ids', 'Tags', 'Owner', 'CreatedOn', 'CreatedBy', 'ModifiedOn', 'ModifiedBy']
      };
      
      const response = await client.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return [];
      }
      
      return response.data || [];
    } catch (error) {
      console.error("Error fetching classes:", error);
      throw error;
    }
  }

  async getById(id) {
    await delay(200);
    try {
      const client = this.getApperClient();
      const params = {
        fields: ['Name', 'subject', 'period', 'room', 'time', 'student_ids', 'Tags', 'Owner', 'CreatedOn', 'CreatedBy', 'ModifiedOn', 'ModifiedBy']
      };
      
      const response = await client.getRecordById(this.tableName, id, params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }
      
      return response.data;
    } catch (error) {
      console.error(`Error fetching class with ID ${id}:`, error);
      throw error;
    }
  }

  async create(classData) {
    await delay(400);
    try {
      const client = this.getApperClient();
      
      // Only include Updateable fields
      const recordData = {
        Name: classData.name || classData.Name,
        subject: classData.subject,
        period: classData.period,
        room: classData.room,
        time: classData.time,
        student_ids: classData.studentIds ? classData.studentIds.join(',') : '',
        Tags: classData.tags || '',
        Owner: classData.owner || 1
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
          console.error(`Failed to create ${failedRecords.length} classes:${failedRecords}`);
          
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
      console.error("Error creating class:", error);
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
        ...(updates.name !== undefined && { Name: updates.name }),
        ...(updates.Name !== undefined && { Name: updates.Name }),
        ...(updates.subject !== undefined && { subject: updates.subject }),
        ...(updates.period !== undefined && { period: updates.period }),
        ...(updates.room !== undefined && { room: updates.room }),
        ...(updates.time !== undefined && { time: updates.time }),
        ...(updates.studentIds !== undefined && { student_ids: updates.studentIds.join(',') }),
        ...(updates.student_ids !== undefined && { student_ids: updates.student_ids }),
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
          console.error(`Failed to update ${failedUpdates.length} classes:${failedUpdates}`);
          
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
      console.error("Error updating class:", error);
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
          console.error(`Failed to delete ${failedDeletions.length} classes:${failedDeletions}`);
          
          failedDeletions.forEach(record => {
            if (record.message) toast.error(record.message);
          });
        }
        
        return successfulDeletions.length > 0;
      }
      
      return false;
    } catch (error) {
      console.error("Error deleting class:", error);
      throw error;
    }
  }
}

export default new ClassService();