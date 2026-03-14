import type { ChannelRow, FlowDirection, ResourceStatus } from "@/lib/types/database";

export interface ChannelFormValues {
  organization_id: string;
  name: string;
  source_system_id: string;
  destination_system_id: string;
  connection_id: string;
  direction: FlowDirection;
  is_active: string;
  filtering_rules: string;
}

export interface ChannelListItem {
  id: string;
  name: string;
  sourceSystemName: string | null;
  destinationSystemName: string | null;
  connectionName: string | null;
  direction: FlowDirection;
  isActive: boolean;
  status: ResourceStatus;
  updatedAt: string;
}

export interface ChannelDetails {
  channel: ChannelRow;
  sourceSystemId: string | null;
  destinationSystemId: string | null;
  connectionId: string | null;
  sourceSystemName: string | null;
  destinationSystemName: string | null;
  connectionName: string | null;
  isActive: boolean;
  filteringRules: string;
}
