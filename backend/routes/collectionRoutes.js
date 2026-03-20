import express from 'express'
import {
  getMyCollections,
  createCollection,
  updateCollection,
  deleteCollection,
  toggleLinkInCollection,
  getPublicCollection,
  copyPublicCollection,
} from '../controllers/collectionController.js'
import { protect } from '../middleware/authMiddleware.js'

const router = express.Router()



router.get('/public/:username/:slug', getPublicCollection)
router.post('/public/:username/:slug/copy', protect, copyPublicCollection)


router.use(protect)

router.route('/')
  .get(getMyCollections)
  .post(createCollection)


router.post('/:id/links', toggleLinkInCollection)

router.route('/:id')
  .put(updateCollection)
  .delete(deleteCollection)

export default router