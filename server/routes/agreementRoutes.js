// routes/agreementRoutes.js
import express from 'express';
import { createAgreement, getMyAgreements , signAgreement , downloadAgreementPdf , searchByTitle} from '../controllers/agreementController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/search', searchByTitle);
router.get('/my-agreements', protect, getMyAgreements);
router.get('/:id/download', downloadAgreementPdf);
router.post('/:id/sign', signAgreement);
router.post('/create', protect, createAgreement);




export default router;
