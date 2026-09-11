export interface IStackTraces {
  methodName: string;
  methodLocation: string;
  exectionLine: string;
  fileName: string;
  timestamps: Date; // note: make sure to use utc time zone
}

export interface ITrace {
  timestamps: Date;
  request: string;
  duration: number; // ms
}


