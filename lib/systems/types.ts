import type { ResourceStatus, SystemRow, SystemType } from "@/lib/types/database";

export interface SystemFormValues {
  name: string;
  type: SystemType;
  vendor: string;
  base_url: string;
  notes: string;
  organization_id: string;
  status: ResourceStatus;
}

export interface SystemListItem {
  id: string;
  name: string;
  type: SystemType;
  vendor: string | null;
  baseUrl: string | null;
  status: ResourceStatus;
  updatedAt: string;
}

export interface SystemDetails {
  system: SystemRow;
  baseUrl: string | null;
  notes: string | null;
}

export const SYSTEM_TYPE_OPTIONS: Array<{ value: SystemType; label: string }> = [
  { value: "ehr", label: "EHR" },
  { value: "emr", label: "EMR" },
  { value: "lis", label: "LIS" },
  { value: "ris", label: "RIS" },
  { value: "pacs", label: "PACS" },
  { value: "billing", label: "Billing" },
  { value: "fhir_server", label: "FHIR Server" },
  { value: "hl7_broker", label: "HL7 Broker" },
  { value: "api", label: "API" },
  { value: "internal", label: "Internal" },
  { value: "other", label: "Other" }
];
