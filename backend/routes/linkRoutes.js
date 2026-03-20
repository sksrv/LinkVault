import express from 'express';
import {
  createLink,
  getLinks,
  getLinkById,
  updateLink,
  deleteLink,
  getMetadata,
  getStats,
} from '../controllers/linkController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All link routes are protected
router.use(protect);


router.get('/meta/fetch', getMetadata);
router.get('/stats/summary', getStats);

// CRUD routes
router.route('/').get(getLinks).post(createLink);
router.route('/:id').get(getLinkById).put(updateLink).delete(deleteLink);

export default router;