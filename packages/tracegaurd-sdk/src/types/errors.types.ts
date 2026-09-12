export interface IError {
  location: string;
  timestamps: Date;
  errorMessage: string;
  error: any;
  request: string;
  endpoint: string;
}
