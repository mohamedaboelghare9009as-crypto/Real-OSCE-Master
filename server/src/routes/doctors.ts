import { Router } from 'express';
import {
    getAllDoctors,
    getDoctorById,
    createDoctor,
    updateDoctor,
    deleteDoctor
} from '../controllers/doctorController';

const router = Router();

router.get('/', getAllDoctors);
router.get('/:doctorId', getDoctorById);
router.post('/', createDoctor);
router.put('/:doctorId', updateDoctor);
router.delete('/:doctorId', deleteDoctor);

export default router;