// routes/agreementRoutes.js
import express from 'express';
import { createAgreement, getMyAgreements , signAgreement , downloadAgreementPdf , searchByTitle} from '../controllers/agreementController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/create', protect, createAgreement);
router.get('/my-agreements', protect, getMyAgreements);
router.post('/:id/sign', signAgreement);
router.get('/:id/download', downloadAgreementPdf);
router.get('/search', searchByTitle);



export default router;
