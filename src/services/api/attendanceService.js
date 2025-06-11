import attendanceData from '../mockData/attendance.json';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

class AttendanceService {
  constructor() {
    this.data = [...attendanceData];
  }

  async getAll() {
    await delay(300);
    return [...this.data];
  }

  async getById(id) {
    await delay(200);
    const item = this.data.find(attendance => attendance.id === id);
    return item ? { ...item } : null;
  }

  async create(attendanceData) {
    await delay(400);
    const newAttendance = {
      ...attendanceData,
      id: Date.now().toString()
    };
    this.data.push(newAttendance);
    return { ...newAttendance };
  }

  async update(id, updates) {
    await delay(300);
    const index = this.data.findIndex(attendance => attendance.id === id);
    if (index === -1) throw new Error('Attendance record not found');
    
    this.data[index] = { ...this.data[index], ...updates };
    return { ...this.data[index] };
  }

  async delete(id) {
    await delay(200);
    const index = this.data.findIndex(attendance => attendance.id === id);
    if (index === -1) throw new Error('Attendance record not found');
    
    this.data.splice(index, 1);
    return true;
  }
}

export default new AttendanceService();