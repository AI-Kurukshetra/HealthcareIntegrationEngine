export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type AppRole = "owner" | "admin" | "operator" | "viewer";
export type MemberStatus = "active" | "invited" | "suspended";
export type OrganizationStatus = "active" | "inactive";
export type SystemType = "ehr" | "emr" | "lis" | "ris" | "pacs" | "billing" | "fhir_server" | "hl7_broker" | "api" | "internal" | "other";
export type ResourceStatus = "active" | "inactive" | "draft";
export type ChannelType = "hl7" | "fhir" | "api" | "sftp" | "webhook" | "manual";
export type FlowDirection = "inbound" | "outbound" | "bidirectional";
export type ConnectionStatus = "draft" | "active" | "paused" | "error" | "archived";
export type MessageStatus = "received" | "queued" | "processing" | "transformed" | "delivered" | "failed" | "acknowledged";
export type LogLevel = "info" | "warn" | "error";

export interface Database {
  public: {
    Tables: {
      organization_members: {
        Row: {
          created_at: string;
          created_by: string | null;
          id: string;
          organization_id: string;
          role: AppRole;
          status: MemberStatus;
          updated_at: string;
          updated_by: string | null;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          created_by?: string | null;
          id?: string;
          organization_id: string;
          role: AppRole;
          status?: MemberStatus;
          updated_at?: string;
          updated_by?: string | null;
          user_id: string;
        };
        Update: {
          created_at?: string;
          created_by?: string | null;
          id?: string;
          organization_id?: string;
          role?: AppRole;
          status?: MemberStatus;
          updated_at?: string;
          updated_by?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "organization_members_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          }
        ];
      };
      organizations: {
        Row: {
          created_at: string;
          created_by: string | null;
          id: string;
          name: string;
          slug: string;
          status: OrganizationStatus;
          updated_at: string;
          updated_by: string | null;
        };
        Insert: {
          created_at?: string;
          created_by?: string | null;
          id?: string;
          name: string;
          slug: string;
          status?: OrganizationStatus;
          updated_at?: string;
          updated_by?: string | null;
        };
        Update: {
          created_at?: string;
          created_by?: string | null;
          id?: string;
          name?: string;
          slug?: string;
          status?: OrganizationStatus;
          updated_at?: string;
          updated_by?: string | null;
        };
        Relationships: [];
      };
      channels: {
        Row: {
          id: string;
          organization_id: string;
          name: string;
          slug: string;
          channel_type: ChannelType;
          direction: FlowDirection;
          endpoint_url: string | null;
          status: ResourceStatus;
          config: Json;
          created_at: string;
          updated_at: string;
          created_by: string | null;
          updated_by: string | null;
        };
        Insert: {
          id?: string;
          organization_id: string;
          name: string;
          slug: string;
          channel_type: ChannelType;
          direction?: FlowDirection;
          endpoint_url?: string | null;
          status?: ResourceStatus;
          config?: Json;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
          updated_by?: string | null;
        };
        Update: {
          id?: string;
          organization_id?: string;
          name?: string;
          slug?: string;
          channel_type?: ChannelType;
          direction?: FlowDirection;
          endpoint_url?: string | null;
          status?: ResourceStatus;
          config?: Json;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
          updated_by?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "channels_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          }
        ];
      };
      connections: {
        Row: {
          id: string;
          organization_id: string;
          name: string;
          slug: string;
          source_system_id: string;
          target_system_id: string;
          channel_id: string;
          status: ConnectionStatus;
          retry_policy: Json;
          config: Json;
          last_heartbeat_at: string | null;
          last_error_at: string | null;
          created_at: string;
          updated_at: string;
          created_by: string | null;
          updated_by: string | null;
        };
        Insert: {
          id?: string;
          organization_id: string;
          name: string;
          slug: string;
          source_system_id: string;
          target_system_id: string;
          channel_id: string;
          status?: ConnectionStatus;
          retry_policy?: Json;
          config?: Json;
          last_heartbeat_at?: string | null;
          last_error_at?: string | null;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
          updated_by?: string | null;
        };
        Update: {
          id?: string;
          organization_id?: string;
          name?: string;
          slug?: string;
          source_system_id?: string;
          target_system_id?: string;
          channel_id?: string;
          status?: ConnectionStatus;
          retry_policy?: Json;
          config?: Json;
          last_heartbeat_at?: string | null;
          last_error_at?: string | null;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
          updated_by?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "connections_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "connections_source_system_id_fkey";
            columns: ["source_system_id"];
            isOneToOne: false;
            referencedRelation: "systems";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "connections_target_system_id_fkey";
            columns: ["target_system_id"];
            isOneToOne: false;
            referencedRelation: "systems";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "connections_channel_id_fkey";
            columns: ["channel_id"];
            isOneToOne: false;
            referencedRelation: "channels";
            referencedColumns: ["id"];
          }
        ];
      };
      systems: {
        Row: {
          id: string;
          organization_id: string;
          name: string;
          slug: string;
          system_type: SystemType;
          vendor: string | null;
          description: string | null;
          status: ResourceStatus;
          config: Json;
          created_at: string;
          updated_at: string;
          created_by: string | null;
          updated_by: string | null;
        };
        Insert: {
          id?: string;
          organization_id: string;
          name: string;
          slug: string;
          system_type: SystemType;
          vendor?: string | null;
          description?: string | null;
          status?: ResourceStatus;
          config?: Json;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
          updated_by?: string | null;
        };
        Update: {
          id?: string;
          organization_id?: string;
          name?: string;
          slug?: string;
          system_type?: SystemType;
          vendor?: string | null;
          description?: string | null;
          status?: ResourceStatus;
          config?: Json;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
          updated_by?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "systems_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          }
        ];
      };
      transformations: {
        Row: {
          id: string;
          organization_id: string;
          channel_id: string | null;
          connection_id: string | null;
          name: string;
          source_format: string;
          target_format: string;
          rule_config: Json;
          status: ResourceStatus;
          version: number;
          created_at: string;
          updated_at: string;
          created_by: string | null;
          updated_by: string | null;
        };
        Insert: {
          id?: string;
          organization_id: string;
          channel_id?: string | null;
          connection_id?: string | null;
          name: string;
          source_format: string;
          target_format: string;
          rule_config?: Json;
          status?: ResourceStatus;
          version?: number;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
          updated_by?: string | null;
        };
        Update: {
          id?: string;
          organization_id?: string;
          channel_id?: string | null;
          connection_id?: string | null;
          name?: string;
          source_format?: string;
          target_format?: string;
          rule_config?: Json;
          status?: ResourceStatus;
          version?: number;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
          updated_by?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "transformations_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "transformations_channel_id_fkey";
            columns: ["channel_id"];
            isOneToOne: false;
            referencedRelation: "channels";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "transformations_connection_id_fkey";
            columns: ["connection_id"];
            isOneToOne: false;
            referencedRelation: "connections";
            referencedColumns: ["id"];
          }
        ];
      };
      messages: {
        Row: {
          id: string;
          organization_id: string;
          connection_id: string | null;
          channel_id: string | null;
          source_system_id: string | null;
          target_system_id: string | null;
          direction: FlowDirection;
          message_type: string;
          content_type: string;
          raw_payload: string | null;
          payload: Json | null;
          transformed_payload: Json | null;
          status: MessageStatus;
          error_message: string | null;
          external_id: string | null;
          correlation_id: string | null;
          received_at: string;
          processed_at: string | null;
          failed_at: string | null;
          created_at: string;
          updated_at: string;
          created_by: string | null;
          updated_by: string | null;
        };
        Insert: {
          id?: string;
          organization_id: string;
          connection_id?: string | null;
          channel_id?: string | null;
          source_system_id?: string | null;
          target_system_id?: string | null;
          direction: FlowDirection;
          message_type: string;
          content_type?: string;
          raw_payload?: string | null;
          payload?: Json | null;
          transformed_payload?: Json | null;
          status?: MessageStatus;
          error_message?: string | null;
          external_id?: string | null;
          correlation_id?: string | null;
          received_at?: string;
          processed_at?: string | null;
          failed_at?: string | null;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
          updated_by?: string | null;
        };
        Update: {
          id?: string;
          organization_id?: string;
          connection_id?: string | null;
          channel_id?: string | null;
          source_system_id?: string | null;
          target_system_id?: string | null;
          direction?: FlowDirection;
          message_type?: string;
          content_type?: string;
          raw_payload?: string | null;
          payload?: Json | null;
          transformed_payload?: Json | null;
          status?: MessageStatus;
          error_message?: string | null;
          external_id?: string | null;
          correlation_id?: string | null;
          received_at?: string;
          processed_at?: string | null;
          failed_at?: string | null;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
          updated_by?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "messages_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "messages_channel_id_fkey";
            columns: ["channel_id"];
            isOneToOne: false;
            referencedRelation: "channels";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "messages_connection_id_fkey";
            columns: ["connection_id"];
            isOneToOne: false;
            referencedRelation: "connections";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "messages_source_system_id_fkey";
            columns: ["source_system_id"];
            isOneToOne: false;
            referencedRelation: "systems";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "messages_target_system_id_fkey";
            columns: ["target_system_id"];
            isOneToOne: false;
            referencedRelation: "systems";
            referencedColumns: ["id"];
          }
        ];
      };
      message_logs: {
        Row: {
          id: number;
          organization_id: string;
          message_id: string;
          connection_id: string | null;
          level: LogLevel;
          event: string;
          details: string | null;
          metadata: Json;
          logged_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          organization_id: string;
          message_id: string;
          connection_id?: string | null;
          level?: LogLevel;
          event: string;
          details?: string | null;
          metadata?: Json;
          logged_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          organization_id?: string;
          message_id?: string;
          connection_id?: string | null;
          level?: LogLevel;
          event?: string;
          details?: string | null;
          metadata?: Json;
          logged_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "message_logs_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "message_logs_message_id_fkey";
            columns: ["message_id"];
            isOneToOne: false;
            referencedRelation: "messages";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "message_logs_connection_id_fkey";
            columns: ["connection_id"];
            isOneToOne: false;
            referencedRelation: "connections";
            referencedColumns: ["id"];
          }
        ];
      };
      audit_logs: {
        Row: {
          id: number;
          organization_id: string | null;
          actor_user_id: string | null;
          actor_role: AppRole | null;
          action: string;
          entity_type: string;
          entity_id: string | null;
          before_data: Json | null;
          after_data: Json | null;
          metadata: Json;
          correlation_id: string | null;
          ip_address: string | null;
          user_agent: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          organization_id?: string | null;
          actor_user_id?: string | null;
          actor_role?: AppRole | null;
          action: string;
          entity_type: string;
          entity_id?: string | null;
          before_data?: Json | null;
          after_data?: Json | null;
          metadata?: Json;
          correlation_id?: string | null;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          organization_id?: string | null;
          actor_user_id?: string | null;
          actor_role?: AppRole | null;
          action?: string;
          entity_type?: string;
          entity_id?: string | null;
          before_data?: Json | null;
          after_data?: Json | null;
          metadata?: Json;
          correlation_id?: string | null;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "audit_logs_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          }
        ];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          created_at: string;
          current_organization_id: string | null;
          email: string;
          full_name: string | null;
          id: string;
          updated_at: string;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string;
          current_organization_id?: string | null;
          email: string;
          full_name?: string | null;
          id: string;
          updated_at?: string;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string;
          current_organization_id?: string | null;
          email?: string;
          full_name?: string | null;
          id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_current_organization_id_fkey";
            columns: ["current_organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: Record<string, never>;
    Functions: {
      bootstrap_new_user: {
        Args: {
          p_organization_name: string;
        };
        Returns: string;
      };
      create_organization: {
        Args: {
          p_name: string;
          p_status?: OrganizationStatus;
        };
        Returns: string;
      };
      set_current_organization: {
        Args: {
          p_organization_id: string;
        };
        Returns: undefined;
      };
    };
    Enums: {
      app_role: AppRole;
      channel_type: ChannelType;
      connection_status: ConnectionStatus;
      flow_direction: FlowDirection;
      log_level: LogLevel;
      member_status: MemberStatus;
      message_status: MessageStatus;
      organization_status: OrganizationStatus;
      resource_status: ResourceStatus;
      system_type: SystemType;
    };
    CompositeTypes: Record<string, never>;
  };
}

export type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
export type OrganizationRow = Database["public"]["Tables"]["organizations"]["Row"];
export type OrganizationMemberRow = Database["public"]["Tables"]["organization_members"]["Row"];
export type ConnectionRow = Database["public"]["Tables"]["connections"]["Row"];
export type MessageRow = Database["public"]["Tables"]["messages"]["Row"];
export type MessageLogRow = Database["public"]["Tables"]["message_logs"]["Row"];
export type AuditLogRow = Database["public"]["Tables"]["audit_logs"]["Row"];
export type SystemRow = Database["public"]["Tables"]["systems"]["Row"];
export type ChannelRow = Database["public"]["Tables"]["channels"]["Row"];
export type TransformationRow = Database["public"]["Tables"]["transformations"]["Row"];
