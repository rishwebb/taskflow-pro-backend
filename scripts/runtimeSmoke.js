const dotenv = require('dotenv');

dotenv.config({ path: require('path').join(__dirname, '..', '.env') });

const baseUrl = `http://127.0.0.1:${process.env.PORT || 5000}`;

const testUser = {
  email: 'test@taskflowpro.com',
  password: 'Test@123'
};

const request = async (path, options = {}) => {
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });

  const payload = await response.json().catch(() => null);
  return {
    status: response.status,
    ok: response.ok,
    payload
  };
};

const expect = (condition, message) => {
  if (!condition) {
    throw new Error(message);
  }
};

const main = async () => {
  const summary = {};

  const health = await request('/health', { method: 'GET' });
  expect(health.ok && health.payload?.success, 'Health check failed');
  summary.health = health.payload.data;

  const unauthorized = await request('/api/auth/me', { method: 'GET' });
  expect(unauthorized.status === 401, 'Protected route should reject missing token');
  summary.protectedRoute = { unauthorizedStatus: unauthorized.status };

  const login = await request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(testUser)
  });
  expect(login.ok, 'Login failed for seeded test user');
  expect(Boolean(login.payload?.data?.accessToken), 'JWT token missing from login response');
  summary.login = {
    email: login.payload.data.user.email,
    role: login.payload.data.user.role
  };

  const token = login.payload.data.accessToken;

  const me = await request('/api/auth/me', {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` }
  });
  expect(me.ok, 'GET /api/auth/me failed');
  summary.me = me.payload.data.user;

  const profile = await request('/api/users/profile', {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` }
  });
  expect(profile.ok, 'GET /api/users/profile failed');
  summary.profile = {
    email: profile.payload.data.user.email,
    role: profile.payload.data.user.role
  };

  const createdTask = await request('/api/tasks', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      title: 'Smoke Test Task',
      description: 'Created by runtime smoke verification',
      priority: 'high',
      dueDate: Date.now() + 86400000
    })
  });
  expect(createdTask.status === 201, 'Task creation failed');
  const taskId = createdTask.payload.data.task.id;
  summary.taskCreated = createdTask.payload.data.task;

  const listTasks = await request('/api/tasks?limit=20', {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` }
  });
  expect(listTasks.ok && Array.isArray(listTasks.payload?.data?.tasks), 'Task list failed');
  summary.taskListCount = listTasks.payload.data.tasks.length;

  const updatedTask = await request(`/api/tasks/${taskId}`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      title: 'Smoke Test Task Updated',
      description: 'Updated by runtime smoke verification',
      priority: 'medium'
    })
  });
  expect(updatedTask.ok, 'Task update failed');
  summary.taskUpdated = updatedTask.payload.data.task;

  const completedTask = await request(`/api/tasks/${taskId}/complete`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` }
  });
  expect(completedTask.ok, 'Task completion failed');
  summary.taskCompleted = completedTask.payload.data.task.completed;

  const stats = await request('/api/tasks/stats', {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` }
  });
  expect(stats.ok, 'Task stats failed');
  summary.taskStats = stats.payload.data.stats;

  const createdNotification = await request('/api/notifications', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      title: 'Smoke Notification',
      message: 'Created by runtime smoke verification',
      type: 'system',
      metadata: { source: 'runtimeSmoke' }
    })
  });
  expect(createdNotification.status === 201, 'Notification creation failed');
  const notificationId = createdNotification.payload.data.notification.id;
  summary.notificationCreated = createdNotification.payload.data.notification;

  const notifications = await request('/api/notifications?limit=20', {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` }
  });
  expect(notifications.ok, 'Notification list failed');
  summary.notificationListCount = notifications.payload.data.notifications.length;

  const readNotification = await request(`/api/notifications/${notificationId}/read`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` }
  });
  expect(readNotification.ok && readNotification.payload.data.notification.read, 'Notification read failed');
  summary.notificationRead = readNotification.payload.data.notification.read;

  const readAll = await request('/api/notifications/read-all', {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` }
  });
  expect(readAll.ok, 'Mark all notifications read failed');
  summary.notificationsMarkedRead = readAll.payload.data.modifiedCount;

  const deletedTask = await request(`/api/tasks/${taskId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  });
  expect(deletedTask.ok, 'Task deletion failed');
  summary.taskDeleted = deletedTask.payload.message;

  console.log(JSON.stringify(summary, null, 2));
};

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
