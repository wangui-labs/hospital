"""Patient CRUD operations."""

from typing import Dict, List, Optional
from datetime import datetime
from sqlalchemy.orm import Session

from schema import Patient, Admission  # <-- ADD Admission import
from data_structures import PatientData
from database import get_db_session


class PatientCRUD:
    """Handles all patient-related database operations."""
    
    def __init__(self, db: Session = None):
        self.db = db or get_db_session()
    
    # ========================================================================
    # Core Operations
    # ========================================================================
    
    def create(self, data: PatientData) -> Dict:
        """Create a new patient."""
        # Check for duplicate MRN
        existing = self.db.query(Patient).filter_by(mrn=data.mrn).first()
        if existing:
            raise ValueError(f"Patient with MRN {data.mrn} already exists")
        
        patient = Patient(
            mrn=data.mrn,
            first_name=data.first_name,
            last_name=data.last_name,
            date_of_birth=datetime.fromisoformat(data.date_of_birth),
            gender=data.gender,
            blood_type=data.blood_type,
            contact_phone=data.contact_phone,
            contact_email=data.contact_email,
            # Vitals fields
            height_cm=data.height_cm,
            weight_kg=data.weight_kg,
            temperature_c=data.temperature_c
        )
        self.db.add(patient)
        self.db.flush()
        return self._to_dict(patient)
    
    def get_all(self, limit: int = 100) -> List[Dict]:
        """Get all patients."""
        patients = self.db.query(Patient).order_by(Patient.created_at.desc()).limit(limit).all()
        return [self._to_dict(p) for p in patients]
    
    def get_by_id(self, patient_id: str) -> Optional[Dict]:
        """Get patient by ID."""
        patient = self.db.query(Patient).filter_by(id=patient_id).first()
        return self._to_dict(patient) if patient else None
    
    def get_by_mrn(self, mrn: str) -> Optional[Dict]:
        """Get patient by MRN."""
        patient = self.db.query(Patient).filter_by(mrn=mrn).first()
        return self._to_dict(patient) if patient else None
    
    def search(self, query: str) -> List[Dict]:
        """Search patients by name or MRN."""
        patients = self.db.query(Patient).filter(
            (Patient.first_name.contains(query)) |
            (Patient.last_name.contains(query)) |
            (Patient.mrn.contains(query))
        ).limit(50).all()
        return [self._to_dict(p) for p in patients]
    
    def update(self, patient_id: str, data: PatientData) -> Optional[Dict]:
        """Update patient details."""
        patient = self.db.query(Patient).filter_by(id=patient_id).first()
        if not patient:
            return None
        
        # Check MRN conflict if changing
        if data.mrn and data.mrn != patient.mrn:
            existing = self.db.query(Patient).filter_by(mrn=data.mrn).first()
            if existing:
                raise ValueError(f"Patient with MRN {data.mrn} already exists")
            patient.mrn = data.mrn
        
        # Update basic info
        if data.first_name:
            patient.first_name = data.first_name
        if data.last_name:
            patient.last_name = data.last_name
        if data.date_of_birth:
            patient.date_of_birth = datetime.fromisoformat(data.date_of_birth)
        if data.gender:
            patient.gender = data.gender
        if data.blood_type:
            patient.blood_type = data.blood_type
        if data.contact_phone:
            patient.contact_phone = data.contact_phone
        if data.contact_email:
            patient.contact_email = data.contact_email
        
        # Update vitals (allow zero values)
        if hasattr(data, 'height_cm') and data.height_cm is not None:
            patient.height_cm = data.height_cm
        if hasattr(data, 'weight_kg') and data.weight_kg is not None:
            patient.weight_kg = data.weight_kg
        if hasattr(data, 'temperature_c') and data.temperature_c is not None:
            patient.temperature_c = data.temperature_c
        
        self.db.flush()
        return self._to_dict(patient)
    
    def delete(self, patient_id: str) -> bool:
        """Delete patient by ID."""
        patient = self.db.query(Patient).filter_by(id=patient_id).first()
        if patient:
            # Check if patient has active admissions
            active_admission = self.db.query(Admission).filter_by(
                patient_id=patient_id, 
                status='active'
            ).first()
            if active_admission:
                raise ValueError(f"Cannot delete patient with active admission")
            self.db.delete(patient)
            return True
        return False
    
    # ========================================================================
    # Vitals Operations
    # ========================================================================
    
    def update_vitals(self, patient_id: str, height_cm: float = None, 
                      weight_kg: float = None, temperature_c: float = None) -> Optional[Dict]:
        """Update only vitals information."""
        patient = self.db.query(Patient).filter_by(id=patient_id).first()
        if not patient:
            return None
        
        if height_cm is not None:
            patient.height_cm = height_cm
        if weight_kg is not None:
            patient.weight_kg = weight_kg
        if temperature_c is not None:
            patient.temperature_c = temperature_c
        
        self.db.flush()
        return self._to_dict(patient)
    
    def get_vitals(self, patient_id: str) -> Optional[Dict]:
        """Get only vitals information for a patient."""
        patient = self.db.query(Patient).filter_by(id=patient_id).first()
        if not patient:
            return None
        
        return {
            "height_cm": patient.height_cm,
            "weight_kg": patient.weight_kg,
            "temperature_c": patient.temperature_c,
            "bmi": self._calculate_bmi(patient.weight_kg, patient.height_cm)
        }
    
    def _calculate_bmi(self, weight_kg: float, height_cm: float) -> Optional[float]:
        """Calculate BMI from weight and height."""
        if weight_kg and height_cm and height_cm > 0:
            height_m = height_cm / 100
            return round(weight_kg / (height_m * height_m), 1)
        return None
    
    # ========================================================================
    # Statistics
    # ========================================================================
    
    def get_statistics(self) -> Dict:
        """Get patient statistics."""
        total = self.db.query(Patient).count()
        
        # Gender distribution
        male = self.db.query(Patient).filter_by(gender='male').count()
        female = self.db.query(Patient).filter_by(gender='female').count()
        other = self.db.query(Patient).filter_by(gender='other').count()
        
        # Age groups
        today = datetime.utcnow().date()
        patients = self.db.query(Patient).all()
        
        age_groups = {
            '0-18': 0,
            '19-35': 0,
            '36-50': 0,
            '51-65': 0,
            '65+': 0
        }
        
        for patient in patients:
            if patient.date_of_birth:
                age = patient.age
                if age:
                    if age <= 18:
                        age_groups['0-18'] += 1
                    elif age <= 35:
                        age_groups['19-35'] += 1
                    elif age <= 50:
                        age_groups['36-50'] += 1
                    elif age <= 65:
                        age_groups['51-65'] += 1
                    else:
                        age_groups['65+'] += 1
        
        # Abnormal vitals count
        abnormal_temp = self.db.query(Patient).filter(
            Patient.temperature_c.isnot(None),
            ((Patient.temperature_c < 36.0) | (Patient.temperature_c > 37.5))
        ).count()
        
        return {
            "total": total,
            "by_gender": {
                "male": male,
                "female": female,
                "other": other
            },
            "by_age_group": age_groups,
            "abnormal_temperature": abnormal_temp
        }
    
    # ========================================================================
    # Helper Methods
    # ========================================================================
    
    def _to_dict(self, patient: Patient) -> Dict:
        """Convert Patient model to dictionary."""
        return {
            "id": patient.id,
            "mrn": patient.mrn,
            "first_name": patient.first_name,
            "last_name": patient.last_name,
            "full_name": patient.full_name,
            "date_of_birth": patient.date_of_birth.isoformat() if patient.date_of_birth else None,
            "age": patient.age,
            "gender": patient.gender,
            "blood_type": patient.blood_type,
            "contact_phone": patient.contact_phone,
            "contact_email": patient.contact_email,
            "allergies": patient.allergies,
            # Vitals fields
            "height_cm": patient.height_cm,
            "weight_kg": patient.weight_kg,
            "temperature_c": patient.temperature_c
        }