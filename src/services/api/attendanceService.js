import { toast } from 'react-toastify';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

class AttendanceService {
  constructor() {
    this.tableName = 'attendance';
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
        fields: ['Name', 'student_id', 'date', 'status', 'Tags', 'Owner', 'CreatedOn', 'CreatedBy', 'ModifiedOn', 'ModifiedBy']
      };
      
      const response = await client.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return [];
      }
      
      return response.data || [];
    } catch (error) {
      console.error("Error fetching attendance:", error);
      throw error;
    }
  }

  async getById(id) {
    await delay(200);
    try {
      const client = this.getApperClient();
      const params = {
        fields: ['Name', 'student_id', 'date', 'status', 'Tags', 'Owner', 'CreatedOn', 'CreatedBy', 'ModifiedOn', 'ModifiedBy']
      };
      
      const response = await client.getRecordById(this.tableName, id, params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }
      
      return response.data;
    } catch (error) {
      console.error(`Error fetching attendance with ID ${id}:`, error);
      throw error;
    }
  }

  async create(attendanceData) {
    await delay(400);
    try {
      const client = this.getApperClient();
      
      // Only include Updateable fields
      const recordData = {
        Name: attendanceData.Name || `Attendance ${attendanceData.studentId}-${attendanceData.date}`,
        student_id: parseInt(attendanceData.studentId || attendanceData.student_id),
        date: attendanceData.date,
        status: attendanceData.status, // Picklist: present,absent,late,excused
        Tags: attendanceData.tags || '',
        Owner: attendanceData.owner || 1
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
          console.error(`Failed to create ${failedRecords.length} attendance records:${failedRecords}`);
          
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
      console.error("Error creating attendance:", error);
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
        ...(updates.studentId !== undefined && { student_id: parseInt(updates.studentId) }),
        ...(updates.student_id !== undefined && { student_id: parseInt(updates.student_id) }),
        ...(updates.date !== undefined && { date: updates.date }),
        ...(updates.status !== undefined && { status: updates.status }),
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
          console.error(`Failed to update ${failedUpdates.length} attendance records:${failedUpdates}`);
          
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
      console.error("Error updating attendance:", error);
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
          console.error(`Failed to delete ${failedDeletions.length} attendance records:${failedDeletions}`);
          
          failedDeletions.forEach(record => {
            if (record.message) toast.error(record.message);
          });
        }
        
        return successfulDeletions.length > 0;
      }
      
      return false;
    } catch (error) {
      console.error("Error deleting attendance:", error);
      throw error;
    }
  }
}

export default new AttendanceService();