export class ProfileUpdateDto {
    fullName: string;
    phone: string;
    country: string;
    dateOfBirth: string;  // Should be in ISO format (YYYY-MM-DD)
    preferredLang: string;
    fcmToken : string;
}