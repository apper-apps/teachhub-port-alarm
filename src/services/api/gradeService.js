import gradeData from '../mockData/grades.json';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

class GradeService {
  constructor() {
    this.data = [...gradeData];
  }

  async getAll() {
    await delay(300);
    return [...this.data];
  }

  async getById(id) {
    await delay(200);
    const item = this.data.find(grade => grade.id === id);
    return item ? { ...item } : null;
  }

  async create(gradeData) {
    await delay(400);
    const newGrade = {
      ...gradeData,
      id: Date.now().toString()
    };
    this.data.push(newGrade);
    return { ...newGrade };
  }

  async update(id, updates) {
    await delay(300);
    const index = this.data.findIndex(grade => grade.id === id);
    if (index === -1) throw new Error('Grade not found');
    
    this.data[index] = { ...this.data[index], ...updates };
    return { ...this.data[index] };
  }

  async delete(id) {
    await delay(200);
    const index = this.data.findIndex(grade => grade.id === id);
    if (index === -1) throw new Error('Grade not found');
    
    this.data.splice(index, 1);
    return true;
  }
}

export default new GradeService();