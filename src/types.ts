export enum CircleStatus {
  success = "success",
  failed = "failed",
  error = "error",
  canceled = "canceled",
  unauthorized = "unauthorized",
}

export enum WorkflowStatus {
  success = "success",
  failed = "failed",
  error = "error",
  canceled = "canceled",
  unauthorized = "unauthorized",
}

export interface ICircleCIJob {
  web_url: string;
  started_at: string;
  duration: null;
  status: CircleStatus;
  name: string;
  parallelism: 1;
  number: number;
  pipeline: {
    id: string;
  };
  latest_workflow: {
    name: string;
    id: string;
  };
  queued_at: string;
}
