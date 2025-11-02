import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';


// Code validation ( A7dE-9BfT2-Xk91-J4Lz )
export function codeFormatValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {

    // Se toma el valor del control del campo donde se define el validador
    const value = control.value;

    // Se define el valor
    const pattern = /^[A-Za-z0-9]{4}-[A-Za-z0-9]{4}-[A-Za-z0-9]{4}-[A-Za-z0-9]{4}$/;

    // 
    return pattern.test(value) ? null : { invalidFormat: true };
  };
}

// Email validation
export function emailDomainValidator(): ValidatorFn {
  const allowedDomains = ['alumnos.udg.mx', 'gmail.com', 'academicos.udg.mx', 'outlook.com', 'hotmail.com'];

  return (control: AbstractControl): ValidationErrors | null => {
    const email = control.value;

    if (!email){
        return null;
    }

    const domain = email.substring(email.lastIndexOf('@') + 1).toLowerCase();

    return allowedDomains.includes(domain)
      ? null
      : { invalidDomain: { value: email, allowedDomains } };
  };
}


// Password validation
export function passwordValidation(): ValidatorFn{
  return (control: AbstractControl): ValidationErrors | null => {
    const value: string = control.value || '';

    if (!value){
      return null;
    }

    const hasUpperCase = /[A-Z]/.test(value);
    const hasLowerCase = /[a-z]/.test(value);
    const hasSpecialChar = /[^A-Za-z0-9]/.test(value);

    const valid = hasUpperCase && hasLowerCase && hasSpecialChar;

    return valid ? null : {
      passwordStrength: {
        hasUpperCase,
        hasLowerCase,
        hasSpecialChar,
      }
    };
  };
}


// Name validation
export function onlyLetters(): ValidatorFn {
return (control: AbstractControl): ValidationErrors | null => {
  const value = control.value;

  if (!value) return null;

  const lettersOnlyRegex = /^[A-Za-z]+$/;

  return lettersOnlyRegex.test(value)
    ? null
    : { onlyLetters: true };
};
}


export function futureDayValidator(): ValidatorFn{
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;
    const selectedDate = new Date(control.value);
    const today = new Date();
    today.setHours(0,0,0,0); // Ignora horas
    return selectedDate < today ? { pastDate: true } : null;
  }
}