import express from 'express';
const router = express.Router();
import ctrl from '../controllers/anciensPresidentsController.js';
import upload from '../config/multer.js';

router.get('/', ctrl.getAllPresidents);
router.post('/', upload.single('image'), ctrl.addPresident);
router.put('/:id', upload.single('image'), ctrl.updatePresident);
router.delete('/:id', ctrl.deletePresident);

export default router;
