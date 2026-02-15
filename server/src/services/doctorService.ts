import { Doctor, IDoctor } from '../models/Doctor';
import mongoose from 'mongoose';

export interface DoctorMetadata {
  id: string;
  name: string;
  avatar: string;
  specialty: string;
  bio: string;
  experience: string;
  rating: number;
  consultationCount: number;
  languages: string[];
  education: string;
}

export class DoctorService {

  async getAllDoctors(): Promise<DoctorMetadata[]> {
    try {
      const doctors = await Doctor.find({}).lean();
      return doctors.map((doctor: any) => ({
        id: doctor._id.toString(),
        name: doctor.name,
        avatar: doctor.avatar || '',
        specialty: doctor.specialty,
        bio: doctor.bio || '',
        experience: doctor.experience || '',
        rating: doctor.rating || 0,
        consultationCount: doctor.consultationCount || 0,
        languages: doctor.languages || [],
        education: doctor.education || ''
      }));
    } catch (error: any) {
      console.error('[DoctorService] Error fetching doctors:', error.message);
      return this.getMockDoctors();
    }
  }

  async getDoctorById(id: string): Promise<DoctorMetadata | null> {
    try {
      const doctor = await Doctor.findById(id).lean();
      if (!doctor) return null;

      return {
        id: doctor._id.toString(),
        name: doctor.name,
        avatar: doctor.avatar || '',
        specialty: doctor.specialty,
        bio: doctor.bio || '',
        experience: doctor.experience || '',
        rating: doctor.rating || 0,
        consultationCount: doctor.consultationCount || 0,
        languages: doctor.languages || [],
        education: doctor.education || ''
      };
    } catch (error: any) {
      console.error(`[DoctorService] Error fetching doctor ${id}:`, error.message);
      return null;
    }
  }

  async createDoctor(doctorData: Partial<IDoctor>): Promise<DoctorMetadata> {
    try {
      const doctor = new Doctor(doctorData);
      await doctor.save();

      return {
        id: doctor._id.toString(),
        name: doctor.name,
        avatar: doctor.avatar || '',
        specialty: doctor.specialty,
        bio: doctor.bio || '',
        experience: doctor.experience || '',
        rating: doctor.rating || 0,
        consultationCount: doctor.consultationCount || 0,
        languages: doctor.languages || [],
        education: doctor.education || ''
      };
    } catch (error: any) {
      console.error('[DoctorService] Error creating doctor:', error.message);
      throw new Error('Failed to create doctor');
    }
  }

  async updateDoctor(id: string, doctorData: Partial<IDoctor>): Promise<DoctorMetadata | null> {
    try {
      const doctor = await Doctor.findByIdAndUpdate(
        id,
        doctorData,
        { new: true }
      ).lean();

      if (!doctor) return null;

      return {
        id: doctor._id.toString(),
        name: doctor.name,
        avatar: doctor.avatar || '',
        specialty: doctor.specialty,
        bio: doctor.bio || '',
        experience: doctor.experience || '',
        rating: doctor.rating || 0,
        consultationCount: doctor.consultationCount || 0,
        languages: doctor.languages || [],
        education: doctor.education || ''
      };
    } catch (error: any) {
      console.error(`[DoctorService] Error updating doctor ${id}:`, error.message);
      throw new Error('Failed to update doctor');
    }
  }

  async deleteDoctor(id: string): Promise<boolean> {
    try {
      const result = await Doctor.findByIdAndDelete(id);
      return !!result;
    } catch (error: any) {
      console.error(`[DoctorService] Error deleting doctor ${id}:`, error.message);
      throw new Error('Failed to delete doctor');
    }
  }

  private getMockDoctors(): DoctorMetadata[] {
    return [
      {
        id: 'mock-doctor-1',
        name: 'Dr. Sarah Johnson',
        avatar: '',
        specialty: 'Internal Medicine',
        bio: 'Experienced internal medicine physician with expertise in complex cases.',
        experience: '15+ years',
        rating: 4.8,
        consultationCount: 1250,
        languages: ['English', 'Spanish'],
        education: 'Harvard Medical School'
      },
      {
        id: 'mock-doctor-2',
        name: 'Dr. Michael Chen',
        avatar: '',
        specialty: 'Emergency Medicine',
        bio: 'Board-certified emergency physician specializing in acute care.',
        experience: '12+ years',
        rating: 4.9,
        consultationCount: 980,
        languages: ['English', 'Mandarin'],
        education: 'Johns Hopkins University'
      },
      {
        id: 'mock-doctor-3',
        name: 'Dr. Emily Rodriguez',
        avatar: '',
        specialty: 'Pediatrics',
        bio: 'Pediatrician focused on child and adolescent healthcare.',
        experience: '10+ years',
        rating: 4.7,
        consultationCount: 850,
        languages: ['English', 'Spanish', 'French'],
        education: 'Stanford Medical School'
      }
    ];
  }
}

export const doctorService = new DoctorService();