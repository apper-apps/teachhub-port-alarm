import { toast } from 'react-toastify';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

class StudentService {
  constructor() {
    this.tableName = 'student';
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
        fields: ['Name', 'first_name', 'last_name', 'email', 'parent_contact', 'notes', 'photo_url', 'Tags', 'Owner', 'CreatedOn', 'CreatedBy', 'ModifiedOn', 'ModifiedBy']
      };
      
      const response = await client.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return [];
      }
      
      return response.data || [];
    } catch (error) {
      console.error("Error fetching students:", error);
      throw error;
    }
  }

  async getById(id) {
    await delay(200);
    try {
      const client = this.getApperClient();
      const params = {
        fields: ['Name', 'first_name', 'last_name', 'email', 'parent_contact', 'notes', 'photo_url', 'Tags', 'Owner', 'CreatedOn', 'CreatedBy', 'ModifiedOn', 'ModifiedBy']
      };
      
      const response = await client.getRecordById(this.tableName, id, params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }
      
      return response.data;
    } catch (error) {
      console.error(`Error fetching student with ID ${id}:`, error);
      throw error;
    }
  }

  async create(studentData) {
    await delay(400);
    try {
      const client = this.getApperClient();
      
      // Only include Updateable fields
      const recordData = {
        Name: studentData.Name || `${studentData.firstName} ${studentData.lastName}`,
        first_name: studentData.firstName || studentData.first_name,
        last_name: studentData.lastName || studentData.last_name,
        email: studentData.email,
        parent_contact: studentData.parentContact || studentData.parent_contact || '',
        notes: studentData.notes || '',
        photo_url: studentData.photoUrl || studentData.photo_url || '',
        Tags: studentData.tags || '',
        Owner: studentData.owner || 1
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
          console.error(`Failed to create ${failedRecords.length} students:${failedRecords}`);
          
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
      console.error("Error creating student:", error);
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
        ...(updates.firstName !== undefined && { first_name: updates.firstName }),
        ...(updates.first_name !== undefined && { first_name: updates.first_name }),
        ...(updates.lastName !== undefined && { last_name: updates.lastName }),
        ...(updates.last_name !== undefined && { last_name: updates.last_name }),
        ...(updates.email !== undefined && { email: updates.email }),
        ...(updates.parentContact !== undefined && { parent_contact: updates.parentContact }),
        ...(updates.parent_contact !== undefined && { parent_contact: updates.parent_contact }),
        ...(updates.notes !== undefined && { notes: updates.notes }),
        ...(updates.photoUrl !== undefined && { photo_url: updates.photoUrl }),
        ...(updates.photo_url !== undefined && { photo_url: updates.photo_url }),
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
          console.error(`Failed to update ${failedUpdates.length} students:${failedUpdates}`);
          
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
      console.error("Error updating student:", error);
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
          console.error(`Failed to delete ${failedDeletions.length} students:${failedDeletions}`);
          
          failedDeletions.forEach(record => {
            if (record.message) toast.error(record.message);
          });
        }
        
        return successfulDeletions.length > 0;
      }
      
      return false;
    } catch (error) {
      console.error("Error deleting student:", error);
      throw error;
    }
  }
}

export default new StudentService();