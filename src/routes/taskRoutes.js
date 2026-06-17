const express = require('express');

const taskController = require('../controllers/taskController');
const { authenticate, requireVerifiedEmail } = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
  createTaskRules,
  listTaskRules,
  taskIdRules,
  updateTaskRules
} = require('../validators/taskValidators');

const router = express.Router();

router.use(authenticate, requireVerifiedEmail);

router.get('/', listTaskRules, validate, taskController.listTasks);
router.get('/stats', taskController.getTaskStats);
router.get('/:id', taskIdRules, validate, taskController.getTask);
router.post('/', createTaskRules, validate, taskController.createTask);
router.patch('/:id', updateTaskRules, validate, taskController.updateTask);
router.put('/:id', updateTaskRules, validate, taskController.updateTask);
router.patch('/:id/complete', taskIdRules, validate, taskController.completeTask);
router.delete('/:id', taskIdRules, validate, taskController.deleteTask);

module.exports = router;
