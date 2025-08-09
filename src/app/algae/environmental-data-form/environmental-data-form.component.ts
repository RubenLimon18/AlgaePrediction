import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { EnvironmentalData, EnvironmentalDataForm } from '../interfaces/environmental-data';

@Component({
  selector: 'app-environmental-data-form',
  templateUrl: './environmental-data-form.component.html',
  styleUrls: ['./environmental-data-form.component.css']
})
export class EnvironmentalDataFormComponent {
  environmentalForm: FormGroup;
  
  locations = [
    'Tecolote',
    'Casa Marino',
    'San Juan de la Costa'
  ];

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.environmentalForm = this.createForm();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      location: ['', Validators.required],
      date: ['', Validators.required],
      time: ['', Validators.required],
      waterTemperature: [null, [Validators.required, Validators.min(15), Validators.max(35)]],
      salinity: [null, [Validators.required, Validators.min(30), Validators.max(40)]],
      solarRadiation: [null, [Validators.required, Validators.min(0), Validators.max(1500)]],
      windSpeed: [null, [Validators.required, Validators.min(0), Validators.max(30)]],
      windDirection: [null, [Validators.required, Validators.min(0), Validators.max(360)]],
      currentSpeed: [null, [Validators.required, Validators.min(0), Validators.max(2)]],
      currentDirection: [null, [Validators.required, Validators.min(0), Validators.max(360)]]
    });
  }

  onSubmit(): void {
    if (this.environmentalForm.valid) {
      const formData: EnvironmentalDataForm = this.environmentalForm.value;
      
      // Convert form data to environmental data
      const environmentalData: EnvironmentalData = {
        ...formData,
        date: new Date(`${formData.date}T${formData.time}`),
        waterTemperature: formData.waterTemperature!,
        salinity: formData.salinity!,
        solarRadiation: formData.solarRadiation!,
        windSpeed: formData.windSpeed!,
        windDirection: formData.windDirection!,
        currentSpeed: formData.currentSpeed!,
        currentDirection: formData.currentDirection!,
        createdAt: new Date()
      };

      // Save to localStorage and log to console
      this.saveData(environmentalData);
      
      // Show success message
      this.snackBar.open('Environmental data submitted successfully!', 'Close', {
        duration: 3000,
        horizontalPosition: 'right',
        verticalPosition: 'top'
      });
      
      // Reset form
      this.environmentalForm.reset();
    } else {
      this.snackBar.open('Please fill in all required fields correctly', 'Close', {
        duration: 3000,
        horizontalPosition: 'right',
        verticalPosition: 'top'
      });
    }
  }

  private saveData(data: EnvironmentalData): void {
    // Log to console
    console.log('Environmental Data Submitted:', data);
    
    // Save to localStorage
    const existingData = JSON.parse(localStorage.getItem('environmentalData') || '[]');
    existingData.push({ ...data, id: Date.now().toString() });
    localStorage.setItem('environmentalData', JSON.stringify(existingData));
  }

  getFieldError(fieldName: string): string {
    const field = this.environmentalForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) return `${this.getFieldLabel(fieldName)} is required`;
      if (field.errors['min']) return `${this.getFieldLabel(fieldName)} must be at least ${field.errors['min'].min}`;
      if (field.errors['max']) return `${this.getFieldLabel(fieldName)} must be at most ${field.errors['max'].max}`;
    }
    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      location: 'Location',
      date: 'Date',
      time: 'Time',
      waterTemperature: 'Water Temperature',
      salinity: 'Salinity',
      solarRadiation: 'Solar Radiation',
      windSpeed: 'Wind Speed',
      windDirection: 'Wind Direction',
      currentSpeed: 'Current Speed',
      currentDirection: 'Current Direction'
    };
    return labels[fieldName] || fieldName;
  }
}