import assignmentData from '../mockData/assignments.json';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

class AssignmentService {
  constructor() {
    this.data = [...assignmentData];
  }

  async getAll() {
    await delay(300);
    return [...this.data];
  }

  async getById(id) {
    await delay(200);
    const item = this.data.find(assignment => assignment.id === id);
    return item ? { ...item } : null;
  }

  async create(assignmentData) {
    await delay(400);
    const newAssignment = {
      ...assignmentData,
      id: Date.now().toString(),
      submissions: assignmentData.submissions || []
    };
    this.data.push(newAssignment);
    return { ...newAssignment };
  }

  async update(id, updates) {
    await delay(300);
    const index = this.data.findIndex(assignment => assignment.id === id);
    if (index === -1) throw new Error('Assignment not found');
    
    this.data[index] = { ...this.data[index], ...updates };
    return { ...this.data[index] };
  }

  async delete(id) {
    await delay(200);
    const index = this.data.findIndex(assignment => assignment.id === id);
    if (index === -1) throw new Error('Assignment not found');
    
    this.data.splice(index, 1);
    return true;
  }
}

export default new AssignmentService();