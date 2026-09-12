export interface IContextUser {
  ipAddress: string;
  dns: string;
  location: string; // eg. united states
  subLocation: string; // city , vilage
}

export interface IRuntime {
  version: string | number;
  name: string;
}

export interface IBrowser {
  // this is optional
  name: string;
  userAgent: string;
  version: string | number;
}
