import lessonPlanData from '../mockData/lessonPlans.json';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

class LessonPlanService {
  constructor() {
    this.data = [...lessonPlanData];
  }

  async getAll() {
    await delay(300);
    return [...this.data];
  }

  async getById(id) {
    await delay(200);
    const item = this.data.find(lesson => lesson.id === id);
    return item ? { ...item } : null;
  }

  async create(lessonData) {
    await delay(400);
    const newLesson = {
      ...lessonData,
      id: Date.now().toString()
    };
    this.data.push(newLesson);
    return { ...newLesson };
  }

  async update(id, updates) {
    await delay(300);
    const index = this.data.findIndex(lesson => lesson.id === id);
    if (index === -1) throw new Error('Lesson plan not found');
    
    this.data[index] = { ...this.data[index], ...updates };
    return { ...this.data[index] };
  }

  async delete(id) {
    await delay(200);
    const index = this.data.findIndex(lesson => lesson.id === id);
    if (index === -1) throw new Error('Lesson plan not found');
    
    this.data.splice(index, 1);
    return true;
  }
}

export default new LessonPlanService();