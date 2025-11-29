import express from 'express';
import { addGitHub, addLeetCode, addProject, addSkill, getAll, getTrackerDashboard, refreshAll, removeProject, removeSkill,getTop } from '../controllers/Tracker.controller.js';
import isAuthenticated from '../middlewares/auth/isAuthenticated.js';

const router = express.Router();

router.get('/getUserTrackerDashboard/:id',isAuthenticated, getTrackerDashboard);
router.patch('/addSkill',isAuthenticated, addSkill);
router.patch('/removeSkill',isAuthenticated, removeSkill);
router.patch('/addProject',isAuthenticated, addProject);
router.patch('/removeProject',isAuthenticated, removeProject);
router.post('/addLeetCode',isAuthenticated, addLeetCode);
router.post('/addGithub', isAuthenticated, addGitHub)
router.post('/refreshAll', isAuthenticated, refreshAll)
router.get("/getAll", isAuthenticated, getAll)
router.get("/getTop", isAuthenticated, getTop)

export default router;