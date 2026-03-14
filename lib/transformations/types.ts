import type { ResourceStatus, TransformationRow } from "@/lib/types/database";

export interface TransformationFormValues {
  organization_id: string;
  name: string;
  channel_id: string;
  input_format: string;
  output_format: string;
  mapping_config: string;
  is_active: string;
}

export interface TransformationListItem {
  id: string;
  name: string;
  channelName: string | null;
  inputFormat: string;
  outputFormat: string;
  isActive: boolean;
  status: ResourceStatus;
  version: number;
  updatedAt: string;
}

export interface TransformationDetails {
  transformation: TransformationRow;
  channelName: string | null;
  mappingConfigPretty: string;
  isActive: boolean;
}
