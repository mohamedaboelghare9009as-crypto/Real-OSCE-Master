import { Request, Response } from 'express';
import { doctorService } from '../services/doctorService';

export const getAllDoctors = async (req: Request, res: Response) => {
    try {
        const doctors = await doctorService.getAllDoctors();
        res.json(doctors);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getDoctorById = async (req: Request, res: Response) => {
    try {
        const { doctorId } = req.params;
        const doctor = await doctorService.getDoctorById(doctorId);
        
        if (!doctor) {
            return res.status(404).json({ error: 'Doctor not found' });
        }
        
        res.json(doctor);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const createDoctor = async (req: Request, res: Response) => {
    try {
        const doctor = await doctorService.createDoctor(req.body);
        res.status(201).json(doctor);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const updateDoctor = async (req: Request, res: Response) => {
    try {
        const { doctorId } = req.params;
        const doctor = await doctorService.updateDoctor(doctorId, req.body);
        
        if (!doctor) {
            return res.status(404).json({ error: 'Doctor not found' });
        }
        
        res.json(doctor);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteDoctor = async (req: Request, res: Response) => {
    try {
        const { doctorId } = req.params;
        const success = await doctorService.deleteDoctor(doctorId);
        
        if (!success) {
            return res.status(404).json({ error: 'Doctor not found' });
        }
        
        res.json({ message: 'Doctor deleted successfully' });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};