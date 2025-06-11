import studentData from '../mockData/students.json';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

class StudentService {
  constructor() {
    this.data = [...studentData];
  }

  async getAll() {
    await delay(300);
    return [...this.data];
  }

  async getById(id) {
    await delay(200);
    const item = this.data.find(student => student.id === id);
    return item ? { ...item } : null;
  }

  async create(studentData) {
    await delay(400);
    const newStudent = {
      ...studentData,
      id: Date.now().toString()
    };
    this.data.push(newStudent);
    return { ...newStudent };
  }

  async update(id, updates) {
    await delay(300);
    const index = this.data.findIndex(student => student.id === id);
    if (index === -1) throw new Error('Student not found');
    
    this.data[index] = { ...this.data[index], ...updates };
    return { ...this.data[index] };
  }

  async delete(id) {
    await delay(200);
    const index = this.data.findIndex(student => student.id === id);
    if (index === -1) throw new Error('Student not found');
    
    this.data.splice(index, 1);
    return true;
  }
}

export default new StudentService();