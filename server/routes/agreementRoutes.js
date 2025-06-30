// routes/agreementRoutes.js
import express from 'express';
import { createAgreement, getMyAgreements , getAllAgreementsForUser , signAgreement , downloadAgreementPdf , searchByTitle  ,getPendingAgreementsToSign } from '../controllers/agreementController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/search', searchByTitle);
router.get('/my-agreements', protect, getMyAgreements);
router.get('/all', protect, getAllAgreementsForUser);
router.get('/:id/download', downloadAgreementPdf);
router.post('/:id/sign',protect ,  signAgreement);
router.post('/create', protect, createAgreement);
router.get('/pending-to-sign', protect, getPendingAgreementsToSign);


export default router;
