import classData from '../mockData/classes.json';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

class ClassService {
  constructor() {
    this.data = [...classData];
  }

  async getAll() {
    await delay(300);
    return [...this.data];
  }

  async getById(id) {
    await delay(200);
    const item = this.data.find(cls => cls.id === id);
    return item ? { ...item } : null;
  }

  async create(classData) {
    await delay(400);
    const newClass = {
      ...classData,
      id: Date.now().toString(),
      studentIds: classData.studentIds || []
    };
    this.data.push(newClass);
    return { ...newClass };
  }

  async update(id, updates) {
    await delay(300);
    const index = this.data.findIndex(cls => cls.id === id);
    if (index === -1) throw new Error('Class not found');
    
    this.data[index] = { ...this.data[index], ...updates };
    return { ...this.data[index] };
  }

  async delete(id) {
    await delay(200);
    const index = this.data.findIndex(cls => cls.id === id);
    if (index === -1) throw new Error('Class not found');
    
    this.data.splice(index, 1);
    return true;
  }
}

export default new ClassService();