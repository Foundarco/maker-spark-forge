export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      activity_log: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          entity_id: string | null
          entity_type: string | null
          id: string
          metadata: Json
          module: string
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          metadata?: Json
          module: string
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          metadata?: Json
          module?: string
        }
        Relationships: []
      }
      admin_domains: {
        Row: {
          created_at: string
          created_by: string | null
          domain: string
          id: string
          notes: string | null
          purpose: string | null
          ssl_active: boolean | null
          updated_at: string
          verified: boolean
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          domain: string
          id?: string
          notes?: string | null
          purpose?: string | null
          ssl_active?: boolean | null
          updated_at?: string
          verified?: boolean
        }
        Update: {
          created_at?: string
          created_by?: string | null
          domain?: string
          id?: string
          notes?: string | null
          purpose?: string | null
          ssl_active?: boolean | null
          updated_at?: string
          verified?: boolean
        }
        Relationships: []
      }
      admin_permission_overrides: {
        Row: {
          created_at: string
          created_by: string | null
          granted: boolean
          id: string
          notes: string | null
          permission: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          granted?: boolean
          id?: string
          notes?: string | null
          permission: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          granted?: boolean
          id?: string
          notes?: string | null
          permission?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      admin_settings: {
        Row: {
          category: string
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          key: string
          updated_at: string
          value: string | null
        }
        Insert: {
          category?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          key: string
          updated_at?: string
          value?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          key?: string
          updated_at?: string
          value?: string | null
        }
        Relationships: []
      }
      announcement_acks: {
        Row: {
          acknowledged_at: string | null
          announcement_id: string
          id: string
          user_id: string
          viewed_at: string
        }
        Insert: {
          acknowledged_at?: string | null
          announcement_id: string
          id?: string
          user_id: string
          viewed_at?: string
        }
        Update: {
          acknowledged_at?: string | null
          announcement_id?: string
          id?: string
          user_id?: string
          viewed_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "announcement_acks_announcement_id_fkey"
            columns: ["announcement_id"]
            isOneToOne: false
            referencedRelation: "announcements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "announcement_acks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      announcements: {
        Row: {
          author_id: string | null
          body: string | null
          created_at: string
          id: string
          published_at: string
          title: string
        }
        Insert: {
          author_id?: string | null
          body?: string | null
          created_at?: string
          id?: string
          published_at?: string
          title: string
        }
        Update: {
          author_id?: string | null
          body?: string | null
          created_at?: string
          id?: string
          published_at?: string
          title?: string
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          author: string | null
          body: string | null
          category: string | null
          cover_image: string | null
          excerpt: string | null
          id: string
          published: boolean
          published_at: string
          slug: string
          title: string
        }
        Insert: {
          author?: string | null
          body?: string | null
          category?: string | null
          cover_image?: string | null
          excerpt?: string | null
          id?: string
          published?: boolean
          published_at?: string
          slug: string
          title: string
        }
        Update: {
          author?: string | null
          body?: string | null
          category?: string | null
          cover_image?: string | null
          excerpt?: string | null
          id?: string
          published?: boolean
          published_at?: string
          slug?: string
          title?: string
        }
        Relationships: []
      }
      calendar_events: {
        Row: {
          all_day: boolean
          color: string
          created_at: string
          description: string | null
          ends_at: string
          id: string
          location: string | null
          meeting_id: string | null
          owner_id: string
          starts_at: string
          title: string
          updated_at: string
          visibility: string
        }
        Insert: {
          all_day?: boolean
          color?: string
          created_at?: string
          description?: string | null
          ends_at: string
          id?: string
          location?: string | null
          meeting_id?: string | null
          owner_id: string
          starts_at: string
          title: string
          updated_at?: string
          visibility?: string
        }
        Update: {
          all_day?: boolean
          color?: string
          created_at?: string
          description?: string | null
          ends_at?: string
          id?: string
          location?: string | null
          meeting_id?: string | null
          owner_id?: string
          starts_at?: string
          title?: string
          updated_at?: string
          visibility?: string
        }
        Relationships: [
          {
            foreignKeyName: "calendar_events_meeting_id_fkey"
            columns: ["meeting_id"]
            isOneToOne: false
            referencedRelation: "meetings"
            referencedColumns: ["id"]
          },
        ]
      }
      channel_categories: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          name: string
          position: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          name: string
          position?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          name?: string
          position?: number
          updated_at?: string
        }
        Relationships: []
      }
      channel_members: {
        Row: {
          channel_id: string
          joined_at: string
          user_id: string
        }
        Insert: {
          channel_id: string
          joined_at?: string
          user_id: string
        }
        Update: {
          channel_id?: string
          joined_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "channel_members_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "channels"
            referencedColumns: ["id"]
          },
        ]
      }
      channel_messages: {
        Row: {
          attachments: Json
          author_id: string
          body: string
          channel_id: string
          created_at: string
          deleted_at: string | null
          edited_at: string | null
          id: string
          mentions: string[] | null
          reply_to_id: string | null
        }
        Insert: {
          attachments?: Json
          author_id: string
          body: string
          channel_id: string
          created_at?: string
          deleted_at?: string | null
          edited_at?: string | null
          id?: string
          mentions?: string[] | null
          reply_to_id?: string | null
        }
        Update: {
          attachments?: Json
          author_id?: string
          body?: string
          channel_id?: string
          created_at?: string
          deleted_at?: string | null
          edited_at?: string | null
          id?: string
          mentions?: string[] | null
          reply_to_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "channel_messages_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "channels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "channel_messages_reply_to_id_fkey"
            columns: ["reply_to_id"]
            isOneToOne: false
            referencedRelation: "channel_messages"
            referencedColumns: ["id"]
          },
        ]
      }
      channel_role_access: {
        Row: {
          channel_id: string
          created_at: string
          id: string
          role_id: string
        }
        Insert: {
          channel_id: string
          created_at?: string
          id?: string
          role_id: string
        }
        Update: {
          channel_id?: string
          created_at?: string
          id?: string
          role_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "channel_role_access_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "channels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "channel_role_access_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "custom_roles"
            referencedColumns: ["id"]
          },
        ]
      }
      channels: {
        Row: {
          category_id: string | null
          created_at: string
          created_by: string
          description: string | null
          id: string
          is_private: boolean
          name: string
          position: number
          updated_at: string
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          is_private?: boolean
          name: string
          position?: number
          updated_at?: string
        }
        Update: {
          category_id?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          is_private?: boolean
          name?: string
          position?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "channels_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "channel_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      company_email_settings: {
        Row: {
          default_footer: string | null
          from_name: string | null
          id: string
          reply_to: string | null
          sender_domain: string | null
          track_clicks: boolean
          track_opens: boolean
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          default_footer?: string | null
          from_name?: string | null
          id?: string
          reply_to?: string | null
          sender_domain?: string | null
          track_clicks?: boolean
          track_opens?: boolean
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          default_footer?: string | null
          from_name?: string | null
          id?: string
          reply_to?: string | null
          sender_domain?: string | null
          track_clicks?: boolean
          track_opens?: boolean
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      con_audit_log: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          entity_id: string | null
          entity_type: string
          field: string | null
          id: string
          new_value: string | null
          old_value: string | null
          summary: string | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type: string
          field?: string | null
          id?: string
          new_value?: string | null
          old_value?: string | null
          summary?: string | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          field?: string | null
          id?: string
          new_value?: string | null
          old_value?: string | null
          summary?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "con_audit_log_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      con_change_orders: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          co_number: string | null
          cost_delta: number | null
          created_at: string
          days_delta: number | null
          id: string
          job_id: string | null
          reason: string | null
          requested_by: string | null
          scope: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          co_number?: string | null
          cost_delta?: number | null
          created_at?: string
          days_delta?: number | null
          id?: string
          job_id?: string | null
          reason?: string | null
          requested_by?: string | null
          scope?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          co_number?: string | null
          cost_delta?: number | null
          created_at?: string
          days_delta?: number | null
          id?: string
          job_id?: string | null
          reason?: string | null
          requested_by?: string | null
          scope?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "con_change_orders_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "con_change_orders_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "con_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      con_client_messages: {
        Row: {
          author_id: string | null
          author_name: string | null
          body: string
          client_id: string
          created_at: string
          from_client: boolean
          id: string
          job_id: string | null
          updated_at: string
        }
        Insert: {
          author_id?: string | null
          author_name?: string | null
          body: string
          client_id: string
          created_at?: string
          from_client?: boolean
          id?: string
          job_id?: string | null
          updated_at?: string
        }
        Update: {
          author_id?: string | null
          author_name?: string | null
          body?: string
          client_id?: string
          created_at?: string
          from_client?: boolean
          id?: string
          job_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "con_client_messages_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "con_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "con_client_messages_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "con_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      con_client_portal_users: {
        Row: {
          client_id: string
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          invited_by: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          client_id: string
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          invited_by?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          client_id?: string
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          invited_by?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "con_client_portal_users_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "con_clients"
            referencedColumns: ["id"]
          },
        ]
      }
      con_clients: {
        Row: {
          address: string | null
          city: string | null
          client_type: string | null
          company: string | null
          created_at: string
          created_by: string | null
          email: string | null
          id: string
          name: string
          notes: string | null
          owner_id: string | null
          phone: string | null
          state: string | null
          status: string
          updated_at: string
          zip: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          client_type?: string | null
          company?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          owner_id?: string | null
          phone?: string | null
          state?: string | null
          status?: string
          updated_at?: string
          zip?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          client_type?: string | null
          company?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          owner_id?: string | null
          phone?: string | null
          state?: string | null
          status?: string
          updated_at?: string
          zip?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "con_clients_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "con_clients_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      con_context_messages: {
        Row: {
          attachments: Json | null
          author_id: string | null
          body: string
          channel: string
          created_at: string
          entity_id: string
          entity_type: string
          id: string
          internal: boolean | null
          mentions: string[] | null
          updated_at: string
        }
        Insert: {
          attachments?: Json | null
          author_id?: string | null
          body: string
          channel?: string
          created_at?: string
          entity_id: string
          entity_type: string
          id?: string
          internal?: boolean | null
          mentions?: string[] | null
          updated_at?: string
        }
        Update: {
          attachments?: Json | null
          author_id?: string | null
          body?: string
          channel?: string
          created_at?: string
          entity_id?: string
          entity_type?: string
          id?: string
          internal?: boolean | null
          mentions?: string[] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "con_context_messages_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      con_crew_assignments: {
        Row: {
          created_at: string
          crew_id: string | null
          end_date: string | null
          id: string
          job_id: string | null
          notes: string | null
          role: string | null
          start_date: string | null
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          crew_id?: string | null
          end_date?: string | null
          id?: string
          job_id?: string | null
          notes?: string | null
          role?: string | null
          start_date?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          crew_id?: string | null
          end_date?: string | null
          id?: string
          job_id?: string | null
          notes?: string | null
          role?: string | null
          start_date?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "con_crew_assignments_crew_id_fkey"
            columns: ["crew_id"]
            isOneToOne: false
            referencedRelation: "con_crews"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "con_crew_assignments_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "con_jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "con_crew_assignments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      con_crews: {
        Row: {
          created_at: string
          foreman_id: string | null
          id: string
          name: string
          notes: string | null
          size: number | null
          status: string
          trade: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          foreman_id?: string | null
          id?: string
          name: string
          notes?: string | null
          size?: number | null
          status?: string
          trade?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          foreman_id?: string | null
          id?: string
          name?: string
          notes?: string | null
          size?: number | null
          status?: string
          trade?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "con_crews_foreman_id_fkey"
            columns: ["foreman_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      con_daily_logs: {
        Row: {
          created_at: string
          crew_count: number | null
          delays: string | null
          hours_worked: number | null
          id: string
          job_id: string | null
          log_date: string
          materials_received: string | null
          photos: string[] | null
          status: string
          submitted_by: string | null
          temperature: string | null
          updated_at: string
          visitors: string | null
          weather: string | null
          work_performed: string | null
        }
        Insert: {
          created_at?: string
          crew_count?: number | null
          delays?: string | null
          hours_worked?: number | null
          id?: string
          job_id?: string | null
          log_date?: string
          materials_received?: string | null
          photos?: string[] | null
          status?: string
          submitted_by?: string | null
          temperature?: string | null
          updated_at?: string
          visitors?: string | null
          weather?: string | null
          work_performed?: string | null
        }
        Update: {
          created_at?: string
          crew_count?: number | null
          delays?: string | null
          hours_worked?: number | null
          id?: string
          job_id?: string | null
          log_date?: string
          materials_received?: string | null
          photos?: string[] | null
          status?: string
          submitted_by?: string | null
          temperature?: string | null
          updated_at?: string
          visitors?: string | null
          weather?: string | null
          work_performed?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "con_daily_logs_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "con_jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "con_daily_logs_submitted_by_fkey"
            columns: ["submitted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      con_deliveries: {
        Row: {
          created_at: string
          expected_date: string | null
          id: string
          job_id: string | null
          material: string
          notes: string | null
          po_id: string | null
          quantity: number | null
          received_by: string | null
          received_date: string | null
          status: string
          supplier: string | null
          unit: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          expected_date?: string | null
          id?: string
          job_id?: string | null
          material: string
          notes?: string | null
          po_id?: string | null
          quantity?: number | null
          received_by?: string | null
          received_date?: string | null
          status?: string
          supplier?: string | null
          unit?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          expected_date?: string | null
          id?: string
          job_id?: string | null
          material?: string
          notes?: string | null
          po_id?: string | null
          quantity?: number | null
          received_by?: string | null
          received_date?: string | null
          status?: string
          supplier?: string | null
          unit?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "con_deliveries_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "con_jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "con_deliveries_po_id_fkey"
            columns: ["po_id"]
            isOneToOne: false
            referencedRelation: "mfg_purchase_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "con_deliveries_received_by_fkey"
            columns: ["received_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      con_documents: {
        Row: {
          created_at: string
          doc_type: string | null
          entity_id: string | null
          entity_type: string | null
          file_size: number | null
          file_url: string | null
          id: string
          is_latest: boolean | null
          job_id: string | null
          notes: string | null
          supersedes: string | null
          title: string
          updated_at: string
          uploaded_by: string | null
          version: string | null
        }
        Insert: {
          created_at?: string
          doc_type?: string | null
          entity_id?: string | null
          entity_type?: string | null
          file_size?: number | null
          file_url?: string | null
          id?: string
          is_latest?: boolean | null
          job_id?: string | null
          notes?: string | null
          supersedes?: string | null
          title: string
          updated_at?: string
          uploaded_by?: string | null
          version?: string | null
        }
        Update: {
          created_at?: string
          doc_type?: string | null
          entity_id?: string | null
          entity_type?: string | null
          file_size?: number | null
          file_url?: string | null
          id?: string
          is_latest?: boolean | null
          job_id?: string | null
          notes?: string | null
          supersedes?: string | null
          title?: string
          updated_at?: string
          uploaded_by?: string | null
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "con_documents_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "con_jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "con_documents_supersedes_fkey"
            columns: ["supersedes"]
            isOneToOne: false
            referencedRelation: "con_documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "con_documents_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      con_equipment: {
        Row: {
          asset_tag: string | null
          assigned_to: string | null
          category: string | null
          created_at: string
          hours_meter: number | null
          id: string
          job_id: string | null
          make: string | null
          model: string | null
          name: string
          next_service_date: string | null
          next_service_hours: number | null
          notes: string | null
          odometer: number | null
          purchase_cost: number | null
          status: string
          updated_at: string
          year: number | null
        }
        Insert: {
          asset_tag?: string | null
          assigned_to?: string | null
          category?: string | null
          created_at?: string
          hours_meter?: number | null
          id?: string
          job_id?: string | null
          make?: string | null
          model?: string | null
          name: string
          next_service_date?: string | null
          next_service_hours?: number | null
          notes?: string | null
          odometer?: number | null
          purchase_cost?: number | null
          status?: string
          updated_at?: string
          year?: number | null
        }
        Update: {
          asset_tag?: string | null
          assigned_to?: string | null
          category?: string | null
          created_at?: string
          hours_meter?: number | null
          id?: string
          job_id?: string | null
          make?: string | null
          model?: string | null
          name?: string
          next_service_date?: string | null
          next_service_hours?: number | null
          notes?: string | null
          odometer?: number | null
          purchase_cost?: number | null
          status?: string
          updated_at?: string
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "con_equipment_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "con_equipment_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "con_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      con_estimate_lines: {
        Row: {
          category: string | null
          created_at: string
          description: string
          estimate_id: string
          id: string
          quantity: number | null
          sort_order: number | null
          total: number | null
          unit: string | null
          unit_cost: number | null
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description: string
          estimate_id: string
          id?: string
          quantity?: number | null
          sort_order?: number | null
          total?: number | null
          unit?: string | null
          unit_cost?: number | null
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string
          estimate_id?: string
          id?: string
          quantity?: number | null
          sort_order?: number | null
          total?: number | null
          unit?: string | null
          unit_cost?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "con_estimate_lines_estimate_id_fkey"
            columns: ["estimate_id"]
            isOneToOne: false
            referencedRelation: "con_estimates"
            referencedColumns: ["id"]
          },
        ]
      }
      con_estimates: {
        Row: {
          approved_at: string | null
          client_id: string | null
          created_at: string
          created_by: string | null
          estimate_number: string | null
          estimator_id: string | null
          id: string
          job_id: string | null
          markup_pct: number | null
          scope: string | null
          status: string
          subtotal: number | null
          title: string
          total: number | null
          updated_at: string
          valid_until: string | null
        }
        Insert: {
          approved_at?: string | null
          client_id?: string | null
          created_at?: string
          created_by?: string | null
          estimate_number?: string | null
          estimator_id?: string | null
          id?: string
          job_id?: string | null
          markup_pct?: number | null
          scope?: string | null
          status?: string
          subtotal?: number | null
          title: string
          total?: number | null
          updated_at?: string
          valid_until?: string | null
        }
        Update: {
          approved_at?: string | null
          client_id?: string | null
          created_at?: string
          created_by?: string | null
          estimate_number?: string | null
          estimator_id?: string | null
          id?: string
          job_id?: string | null
          markup_pct?: number | null
          scope?: string | null
          status?: string
          subtotal?: number | null
          title?: string
          total?: number | null
          updated_at?: string
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "con_estimates_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "con_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "con_estimates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "con_estimates_estimator_id_fkey"
            columns: ["estimator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "con_estimates_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "con_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      con_inspections: {
        Row: {
          completed_date: string | null
          created_at: string
          id: string
          inspection_type: string | null
          inspector: string | null
          inspector_id: string | null
          job_id: string | null
          notes: string | null
          result: string | null
          scheduled_date: string | null
          status: string
          updated_at: string
        }
        Insert: {
          completed_date?: string | null
          created_at?: string
          id?: string
          inspection_type?: string | null
          inspector?: string | null
          inspector_id?: string | null
          job_id?: string | null
          notes?: string | null
          result?: string | null
          scheduled_date?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          completed_date?: string | null
          created_at?: string
          id?: string
          inspection_type?: string | null
          inspector?: string | null
          inspector_id?: string | null
          job_id?: string | null
          notes?: string | null
          result?: string | null
          scheduled_date?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "con_inspections_inspector_id_fkey"
            columns: ["inspector_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "con_inspections_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "con_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      con_jobs: {
        Row: {
          actual_cost: number | null
          actual_end_date: string | null
          address: string | null
          billed: number | null
          city: string | null
          client_id: string | null
          contract_value: number | null
          created_at: string
          created_by: string | null
          description: string | null
          division: string | null
          estimated_cost: number | null
          id: string
          job_number: string | null
          job_type: string | null
          name: string
          percent_complete: number | null
          photo_url: string | null
          project_manager_id: string | null
          stage: string
          start_date: string | null
          state: string | null
          status: string
          superintendent_id: string | null
          target_end_date: string | null
          updated_at: string
          zip: string | null
        }
        Insert: {
          actual_cost?: number | null
          actual_end_date?: string | null
          address?: string | null
          billed?: number | null
          city?: string | null
          client_id?: string | null
          contract_value?: number | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          division?: string | null
          estimated_cost?: number | null
          id?: string
          job_number?: string | null
          job_type?: string | null
          name: string
          percent_complete?: number | null
          photo_url?: string | null
          project_manager_id?: string | null
          stage?: string
          start_date?: string | null
          state?: string | null
          status?: string
          superintendent_id?: string | null
          target_end_date?: string | null
          updated_at?: string
          zip?: string | null
        }
        Update: {
          actual_cost?: number | null
          actual_end_date?: string | null
          address?: string | null
          billed?: number | null
          city?: string | null
          client_id?: string | null
          contract_value?: number | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          division?: string | null
          estimated_cost?: number | null
          id?: string
          job_number?: string | null
          job_type?: string | null
          name?: string
          percent_complete?: number | null
          photo_url?: string | null
          project_manager_id?: string | null
          stage?: string
          start_date?: string | null
          state?: string | null
          status?: string
          superintendent_id?: string | null
          target_end_date?: string | null
          updated_at?: string
          zip?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "con_jobs_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "con_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "con_jobs_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "con_jobs_project_manager_id_fkey"
            columns: ["project_manager_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "con_jobs_superintendent_id_fkey"
            columns: ["superintendent_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      con_leads: {
        Row: {
          bid_due_date: string | null
          client_id: string | null
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          created_at: string
          created_by: string | null
          estimate_id: string | null
          estimated_value: number | null
          id: string
          lead_number: string | null
          location: string | null
          notes: string | null
          owner_id: string | null
          probability: number | null
          project_type: string | null
          source: string | null
          stage: string
          title: string
          updated_at: string
          walkthrough_date: string | null
        }
        Insert: {
          bid_due_date?: string | null
          client_id?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          created_by?: string | null
          estimate_id?: string | null
          estimated_value?: number | null
          id?: string
          lead_number?: string | null
          location?: string | null
          notes?: string | null
          owner_id?: string | null
          probability?: number | null
          project_type?: string | null
          source?: string | null
          stage?: string
          title: string
          updated_at?: string
          walkthrough_date?: string | null
        }
        Update: {
          bid_due_date?: string | null
          client_id?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          created_by?: string | null
          estimate_id?: string | null
          estimated_value?: number | null
          id?: string
          lead_number?: string | null
          location?: string | null
          notes?: string | null
          owner_id?: string | null
          probability?: number | null
          project_type?: string | null
          source?: string | null
          stage?: string
          title?: string
          updated_at?: string
          walkthrough_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "con_leads_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "con_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "con_leads_estimate_id_fkey"
            columns: ["estimate_id"]
            isOneToOne: false
            referencedRelation: "con_estimates"
            referencedColumns: ["id"]
          },
        ]
      }
      con_permits: {
        Row: {
          applied_date: string | null
          authority: string | null
          created_at: string
          expires_date: string | null
          fee: number | null
          id: string
          inspection_date: string | null
          issued_date: string | null
          job_id: string | null
          notes: string | null
          permit_number: string | null
          permit_type: string | null
          status: string
          updated_at: string
        }
        Insert: {
          applied_date?: string | null
          authority?: string | null
          created_at?: string
          expires_date?: string | null
          fee?: number | null
          id?: string
          inspection_date?: string | null
          issued_date?: string | null
          job_id?: string | null
          notes?: string | null
          permit_number?: string | null
          permit_type?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          applied_date?: string | null
          authority?: string | null
          created_at?: string
          expires_date?: string | null
          fee?: number | null
          id?: string
          inspection_date?: string | null
          issued_date?: string | null
          job_id?: string | null
          notes?: string | null
          permit_number?: string | null
          permit_type?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "con_permits_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "con_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      con_punch_items: {
        Row: {
          assignee_id: string | null
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          job_id: string | null
          location: string | null
          photo_url: string | null
          priority: string | null
          status: string
          title: string
          trade: string | null
          updated_at: string
        }
        Insert: {
          assignee_id?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          job_id?: string | null
          location?: string | null
          photo_url?: string | null
          priority?: string | null
          status?: string
          title: string
          trade?: string | null
          updated_at?: string
        }
        Update: {
          assignee_id?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          job_id?: string | null
          location?: string | null
          photo_url?: string | null
          priority?: string | null
          status?: string
          title?: string
          trade?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "con_punch_items_assignee_id_fkey"
            columns: ["assignee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "con_punch_items_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "con_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      con_safety_incidents: {
        Row: {
          corrective_action: string | null
          created_at: string
          description: string | null
          id: string
          incident_date: string
          incident_type: string | null
          involved_id: string | null
          job_id: string | null
          lost_time_hours: number | null
          osha_reportable: boolean | null
          reported_by: string | null
          severity: string
          status: string
          updated_at: string
        }
        Insert: {
          corrective_action?: string | null
          created_at?: string
          description?: string | null
          id?: string
          incident_date?: string
          incident_type?: string | null
          involved_id?: string | null
          job_id?: string | null
          lost_time_hours?: number | null
          osha_reportable?: boolean | null
          reported_by?: string | null
          severity?: string
          status?: string
          updated_at?: string
        }
        Update: {
          corrective_action?: string | null
          created_at?: string
          description?: string | null
          id?: string
          incident_date?: string
          incident_type?: string | null
          involved_id?: string | null
          job_id?: string | null
          lost_time_hours?: number | null
          osha_reportable?: boolean | null
          reported_by?: string | null
          severity?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "con_safety_incidents_involved_id_fkey"
            columns: ["involved_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "con_safety_incidents_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "con_jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "con_safety_incidents_reported_by_fkey"
            columns: ["reported_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      con_subcontractors: {
        Row: {
          contact_name: string | null
          created_at: string
          email: string | null
          hourly_rate: number | null
          id: string
          insurance_expires: string | null
          license_number: string | null
          name: string
          notes: string | null
          phone: string | null
          rating: number | null
          status: string
          trade: string | null
          updated_at: string
          w9_on_file: boolean | null
        }
        Insert: {
          contact_name?: string | null
          created_at?: string
          email?: string | null
          hourly_rate?: number | null
          id?: string
          insurance_expires?: string | null
          license_number?: string | null
          name: string
          notes?: string | null
          phone?: string | null
          rating?: number | null
          status?: string
          trade?: string | null
          updated_at?: string
          w9_on_file?: boolean | null
        }
        Update: {
          contact_name?: string | null
          created_at?: string
          email?: string | null
          hourly_rate?: number | null
          id?: string
          insurance_expires?: string | null
          license_number?: string | null
          name?: string
          notes?: string | null
          phone?: string | null
          rating?: number | null
          status?: string
          trade?: string | null
          updated_at?: string
          w9_on_file?: boolean | null
        }
        Relationships: []
      }
      con_submittals: {
        Row: {
          answer: string | null
          ball_in_court: string | null
          created_at: string
          due_date: string | null
          id: string
          job_id: string | null
          kind: string
          number: string | null
          question: string | null
          responded_at: string | null
          spec_section: string | null
          status: string
          submitted_by: string | null
          title: string
          updated_at: string
        }
        Insert: {
          answer?: string | null
          ball_in_court?: string | null
          created_at?: string
          due_date?: string | null
          id?: string
          job_id?: string | null
          kind?: string
          number?: string | null
          question?: string | null
          responded_at?: string | null
          spec_section?: string | null
          status?: string
          submitted_by?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          answer?: string | null
          ball_in_court?: string | null
          created_at?: string
          due_date?: string | null
          id?: string
          job_id?: string | null
          kind?: string
          number?: string | null
          question?: string | null
          responded_at?: string | null
          spec_section?: string | null
          status?: string
          submitted_by?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "con_submittals_ball_in_court_fkey"
            columns: ["ball_in_court"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "con_submittals_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "con_jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "con_submittals_submitted_by_fkey"
            columns: ["submitted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      con_tasks: {
        Row: {
          assignee_id: string | null
          blocked_reason: string | null
          completed_at: string | null
          created_at: string
          created_by: string | null
          department: string | null
          depends_on: string | null
          description: string | null
          due_date: string | null
          entity_id: string | null
          entity_type: string | null
          id: string
          job_id: string | null
          owner_id: string | null
          priority: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          assignee_id?: string | null
          blocked_reason?: string | null
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          department?: string | null
          depends_on?: string | null
          description?: string | null
          due_date?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          job_id?: string | null
          owner_id?: string | null
          priority?: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          assignee_id?: string | null
          blocked_reason?: string | null
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          department?: string | null
          depends_on?: string | null
          description?: string | null
          due_date?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          job_id?: string | null
          owner_id?: string | null
          priority?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "con_tasks_assignee_id_fkey"
            columns: ["assignee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "con_tasks_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "con_tasks_depends_on_fkey"
            columns: ["depends_on"]
            isOneToOne: false
            referencedRelation: "con_tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "con_tasks_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "con_jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "con_tasks_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_submissions: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          name: string
          path: string
          subject: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          path: string
          subject?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          path?: string
          subject?: string | null
        }
        Relationships: []
      }
      cs_csat_responses: {
        Row: {
          comment: string | null
          created_at: string
          created_by: string | null
          customer_email: string | null
          customer_name: string | null
          id: string
          nps: number | null
          score: number
          source: string | null
          ticket_id: string | null
          updated_at: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          created_by?: string | null
          customer_email?: string | null
          customer_name?: string | null
          id?: string
          nps?: number | null
          score: number
          source?: string | null
          ticket_id?: string | null
          updated_at?: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          created_by?: string | null
          customer_email?: string | null
          customer_name?: string | null
          id?: string
          nps?: number | null
          score?: number
          source?: string | null
          ticket_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cs_csat_responses_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "cs_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      cs_kb_articles: {
        Row: {
          audience: string
          body: string | null
          category: string | null
          created_at: string
          created_by: string | null
          id: string
          kind: string
          published: boolean
          tags: string[] | null
          title: string
          updated_at: string
          views: number
        }
        Insert: {
          audience?: string
          body?: string | null
          category?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          kind?: string
          published?: boolean
          tags?: string[] | null
          title: string
          updated_at?: string
          views?: number
        }
        Update: {
          audience?: string
          body?: string | null
          category?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          kind?: string
          published?: boolean
          tags?: string[] | null
          title?: string
          updated_at?: string
          views?: number
        }
        Relationships: []
      }
      cs_repairs: {
        Row: {
          cost: number | null
          created_at: string
          created_by: string | null
          customer_email: string | null
          customer_name: string | null
          id: string
          issue: string | null
          notes: string | null
          product_name: string
          received_at: string | null
          repair_number: string | null
          serial_number: string | null
          shipped_back_at: string | null
          status: string
          technician_id: string | null
          updated_at: string
        }
        Insert: {
          cost?: number | null
          created_at?: string
          created_by?: string | null
          customer_email?: string | null
          customer_name?: string | null
          id?: string
          issue?: string | null
          notes?: string | null
          product_name: string
          received_at?: string | null
          repair_number?: string | null
          serial_number?: string | null
          shipped_back_at?: string | null
          status?: string
          technician_id?: string | null
          updated_at?: string
        }
        Update: {
          cost?: number | null
          created_at?: string
          created_by?: string | null
          customer_email?: string | null
          customer_name?: string | null
          id?: string
          issue?: string | null
          notes?: string | null
          product_name?: string
          received_at?: string | null
          repair_number?: string | null
          serial_number?: string | null
          shipped_back_at?: string | null
          status?: string
          technician_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      cs_rmas: {
        Row: {
          created_at: string
          created_by: string | null
          customer_email: string | null
          customer_name: string | null
          id: string
          notes: string | null
          order_reference: string | null
          product_name: string | null
          reason: string | null
          received_at: string | null
          refund_amount: number | null
          resolved_at: string | null
          rma_number: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          customer_email?: string | null
          customer_name?: string | null
          id?: string
          notes?: string | null
          order_reference?: string | null
          product_name?: string | null
          reason?: string | null
          received_at?: string | null
          refund_amount?: number | null
          resolved_at?: string | null
          rma_number?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          customer_email?: string | null
          customer_name?: string | null
          id?: string
          notes?: string | null
          order_reference?: string | null
          product_name?: string | null
          reason?: string | null
          received_at?: string | null
          refund_amount?: number | null
          resolved_at?: string | null
          rma_number?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      cs_tickets: {
        Row: {
          assignee_id: string | null
          channel: string
          created_at: string
          created_by: string | null
          customer_email: string | null
          customer_name: string | null
          customer_phone: string | null
          description: string | null
          id: string
          priority: string
          status: string
          subject: string
          tags: string[] | null
          ticket_number: string | null
          updated_at: string
        }
        Insert: {
          assignee_id?: string | null
          channel?: string
          created_at?: string
          created_by?: string | null
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          description?: string | null
          id?: string
          priority?: string
          status?: string
          subject: string
          tags?: string[] | null
          ticket_number?: string | null
          updated_at?: string
        }
        Update: {
          assignee_id?: string | null
          channel?: string
          created_at?: string
          created_by?: string | null
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          description?: string | null
          id?: string
          priority?: string
          status?: string
          subject?: string
          tags?: string[] | null
          ticket_number?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      cs_warranty_claims: {
        Row: {
          assignee_id: string | null
          claim_number: string | null
          created_at: string
          created_by: string | null
          customer_email: string | null
          customer_name: string | null
          id: string
          issue: string | null
          notes: string | null
          product_name: string
          purchase_date: string | null
          resolution: string | null
          resolved_at: string | null
          serial_number: string | null
          status: string
          updated_at: string
        }
        Insert: {
          assignee_id?: string | null
          claim_number?: string | null
          created_at?: string
          created_by?: string | null
          customer_email?: string | null
          customer_name?: string | null
          id?: string
          issue?: string | null
          notes?: string | null
          product_name: string
          purchase_date?: string | null
          resolution?: string | null
          resolved_at?: string | null
          serial_number?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          assignee_id?: string | null
          claim_number?: string | null
          created_at?: string
          created_by?: string | null
          customer_email?: string | null
          customer_name?: string | null
          id?: string
          issue?: string | null
          notes?: string | null
          product_name?: string
          purchase_date?: string | null
          resolution?: string | null
          resolved_at?: string | null
          serial_number?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      custom_roles: {
        Row: {
          color: string
          created_at: string
          created_by: string | null
          id: string
          name: string
          permissions: Json
          position: number
          updated_at: string
        }
        Insert: {
          color?: string
          created_at?: string
          created_by?: string | null
          id?: string
          name: string
          permissions?: Json
          position?: number
          updated_at?: string
        }
        Update: {
          color?: string
          created_at?: string
          created_by?: string | null
          id?: string
          name?: string
          permissions?: Json
          position?: number
          updated_at?: string
        }
        Relationships: []
      }
      dev_infrastructure: {
        Row: {
          created_at: string
          environment: string | null
          id: string
          kind: string | null
          name: string
          notes: string | null
          owner_id: string | null
          provider: string | null
          region: string | null
          status: string | null
          updated_at: string
          url: string | null
        }
        Insert: {
          created_at?: string
          environment?: string | null
          id?: string
          kind?: string | null
          name: string
          notes?: string | null
          owner_id?: string | null
          provider?: string | null
          region?: string | null
          status?: string | null
          updated_at?: string
          url?: string | null
        }
        Update: {
          created_at?: string
          environment?: string | null
          id?: string
          kind?: string | null
          name?: string
          notes?: string | null
          owner_id?: string | null
          provider?: string | null
          region?: string | null
          status?: string | null
          updated_at?: string
          url?: string | null
        }
        Relationships: []
      }
      dev_integrations: {
        Row: {
          category: string | null
          connected_at: string | null
          created_at: string
          id: string
          name: string
          notes: string | null
          owner_id: string | null
          status: string | null
          updated_at: string
          vendor: string | null
        }
        Insert: {
          category?: string | null
          connected_at?: string | null
          created_at?: string
          id?: string
          name: string
          notes?: string | null
          owner_id?: string | null
          status?: string | null
          updated_at?: string
          vendor?: string | null
        }
        Update: {
          category?: string | null
          connected_at?: string | null
          created_at?: string
          id?: string
          name?: string
          notes?: string | null
          owner_id?: string | null
          status?: string | null
          updated_at?: string
          vendor?: string | null
        }
        Relationships: []
      }
      dev_repos: {
        Row: {
          created_at: string
          default_branch: string | null
          description: string | null
          id: string
          language: string | null
          name: string
          owner_id: string | null
          provider: string | null
          status: string | null
          updated_at: string
          url: string | null
          visibility: string | null
        }
        Insert: {
          created_at?: string
          default_branch?: string | null
          description?: string | null
          id?: string
          language?: string | null
          name: string
          owner_id?: string | null
          provider?: string | null
          status?: string | null
          updated_at?: string
          url?: string | null
          visibility?: string | null
        }
        Update: {
          created_at?: string
          default_branch?: string | null
          description?: string | null
          id?: string
          language?: string | null
          name?: string
          owner_id?: string | null
          provider?: string | null
          status?: string | null
          updated_at?: string
          url?: string | null
          visibility?: string | null
        }
        Relationships: []
      }
      dev_security_logs: {
        Row: {
          actor_id: string | null
          created_at: string
          details: string | null
          event: string
          id: string
          occurred_at: string | null
          severity: string | null
          source: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          actor_id?: string | null
          created_at?: string
          details?: string | null
          event: string
          id?: string
          occurred_at?: string | null
          severity?: string | null
          source?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          actor_id?: string | null
          created_at?: string
          details?: string | null
          event?: string
          id?: string
          occurred_at?: string | null
          severity?: string | null
          source?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      dev_software: {
        Row: {
          created_at: string
          description: string | null
          environment: string | null
          id: string
          kind: string | null
          name: string
          owner_id: string | null
          status: string | null
          updated_at: string
          url: string | null
          version: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          environment?: string | null
          id?: string
          kind?: string | null
          name: string
          owner_id?: string | null
          status?: string | null
          updated_at?: string
          url?: string | null
          version?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          environment?: string | null
          id?: string
          kind?: string | null
          name?: string
          owner_id?: string | null
          status?: string | null
          updated_at?: string
          url?: string | null
          version?: string | null
        }
        Relationships: []
      }
      direct_messages: {
        Row: {
          attachments: Json
          body: string
          created_at: string
          deleted_at: string | null
          edited_at: string | null
          id: string
          mentions: string[] | null
          read_at: string | null
          recipient_id: string
          reply_to_id: string | null
          sender_id: string
        }
        Insert: {
          attachments?: Json
          body: string
          created_at?: string
          deleted_at?: string | null
          edited_at?: string | null
          id?: string
          mentions?: string[] | null
          read_at?: string | null
          recipient_id: string
          reply_to_id?: string | null
          sender_id: string
        }
        Update: {
          attachments?: Json
          body?: string
          created_at?: string
          deleted_at?: string | null
          edited_at?: string | null
          id?: string
          mentions?: string[] | null
          read_at?: string | null
          recipient_id?: string
          reply_to_id?: string | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "direct_messages_reply_to_id_fkey"
            columns: ["reply_to_id"]
            isOneToOne: false
            referencedRelation: "direct_messages"
            referencedColumns: ["id"]
          },
        ]
      }
      drive_items: {
        Row: {
          color: string | null
          created_at: string
          description: string | null
          id: string
          kind: string
          mime_type: string | null
          name: string
          owner_id: string
          parent_id: string | null
          size_bytes: number | null
          starred: boolean
          storage_path: string | null
          trashed_at: string | null
          updated_at: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          kind: string
          mime_type?: string | null
          name: string
          owner_id: string
          parent_id?: string | null
          size_bytes?: number | null
          starred?: boolean
          storage_path?: string | null
          trashed_at?: string | null
          updated_at?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          kind?: string
          mime_type?: string | null
          name?: string
          owner_id?: string
          parent_id?: string | null
          size_bytes?: number | null
          starred?: boolean
          storage_path?: string | null
          trashed_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "drive_items_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "drive_items"
            referencedColumns: ["id"]
          },
        ]
      }
      drive_shares: {
        Row: {
          created_at: string
          id: string
          item_id: string
          permission: string
          role_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          item_id: string
          permission?: string
          role_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          item_id?: string
          permission?: string
          role_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "drive_shares_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "drive_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "drive_shares_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "custom_roles"
            referencedColumns: ["id"]
          },
        ]
      }
      eng_bom_items: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          name: string
          notes: string | null
          part_number: string
          project_id: string | null
          quantity: number
          risk_level: string
          supplier: string | null
          unit_cost: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          name: string
          notes?: string | null
          part_number: string
          project_id?: string | null
          quantity?: number
          risk_level?: string
          supplier?: string | null
          unit_cost?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          name?: string
          notes?: string | null
          part_number?: string
          project_id?: string | null
          quantity?: number
          risk_level?: string
          supplier?: string | null
          unit_cost?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "eng_bom_items_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "eng_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      eng_cad_parts: {
        Row: {
          assembly: string | null
          created_at: string
          created_by: string | null
          description: string | null
          file_url: string | null
          id: string
          name: string
          owner_id: string | null
          part_number: string
          project_id: string | null
          revision: string
          status: string
          updated_at: string
        }
        Insert: {
          assembly?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          file_url?: string | null
          id?: string
          name: string
          owner_id?: string | null
          part_number: string
          project_id?: string | null
          revision?: string
          status?: string
          updated_at?: string
        }
        Update: {
          assembly?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          file_url?: string | null
          id?: string
          name?: string
          owner_id?: string | null
          part_number?: string
          project_id?: string | null
          revision?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "eng_cad_parts_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "eng_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      eng_design_reviews: {
        Row: {
          created_at: string
          created_by: string | null
          gate: string | null
          id: string
          notes: string | null
          project_id: string | null
          review_date: string | null
          reviewer_id: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          gate?: string | null
          id?: string
          notes?: string | null
          project_id?: string | null
          review_date?: string | null
          reviewer_id?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          gate?: string | null
          id?: string
          notes?: string | null
          project_id?: string | null
          review_date?: string | null
          reviewer_id?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "eng_design_reviews_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "eng_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      eng_docs: {
        Row: {
          author_id: string | null
          category: string | null
          content: string | null
          created_at: string
          created_by: string | null
          id: string
          project_id: string | null
          starred: boolean
          title: string
          updated_at: string
        }
        Insert: {
          author_id?: string | null
          category?: string | null
          content?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          project_id?: string | null
          starred?: boolean
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string | null
          category?: string | null
          content?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          project_id?: string | null
          starred?: boolean
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "eng_docs_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "eng_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      eng_ecos: {
        Row: {
          approver_id: string | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          project_id: string | null
          requestor_id: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          approver_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          project_id?: string | null
          requestor_id?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          approver_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          project_id?: string | null
          requestor_id?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "eng_ecos_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "eng_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      eng_firmware_repos: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          language: string | null
          latest_version: string | null
          name: string
          owner_id: string | null
          project_id: string | null
          repo_url: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          language?: string | null
          latest_version?: string | null
          name: string
          owner_id?: string | null
          project_id?: string | null
          repo_url?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          language?: string | null
          latest_version?: string | null
          name?: string
          owner_id?: string | null
          project_id?: string | null
          repo_url?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "eng_firmware_repos_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "eng_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      eng_issues: {
        Row: {
          assignee_id: string | null
          category: string | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          project_id: string | null
          reporter_id: string | null
          severity: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          assignee_id?: string | null
          category?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          project_id?: string | null
          reporter_id?: string | null
          severity?: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          assignee_id?: string | null
          category?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          project_id?: string | null
          reporter_id?: string | null
          severity?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "eng_issues_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "eng_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      eng_milestones: {
        Row: {
          completed_at: string | null
          created_at: string
          created_by: string | null
          description: string | null
          due_date: string | null
          id: string
          project_id: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          project_id?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          project_id?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "eng_milestones_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "eng_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      eng_projects: {
        Row: {
          budget: number | null
          code: string | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          lead_id: string | null
          name: string
          progress: number
          spent: number
          start_date: string | null
          status: string
          target_date: string | null
          updated_at: string
        }
        Insert: {
          budget?: number | null
          code?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          lead_id?: string | null
          name: string
          progress?: number
          spent?: number
          start_date?: string | null
          status?: string
          target_date?: string | null
          updated_at?: string
        }
        Update: {
          budget?: number | null
          code?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          lead_id?: string | null
          name?: string
          progress?: number
          spent?: number
          start_date?: string | null
          status?: string
          target_date?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      eng_tasks: {
        Row: {
          assignee_id: string | null
          created_at: string
          created_by: string | null
          description: string | null
          due_date: string | null
          id: string
          position: number
          priority: string
          project_id: string | null
          status: string
          tags: string[]
          title: string
          updated_at: string
        }
        Insert: {
          assignee_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          position?: number
          priority?: string
          project_id?: string | null
          status?: string
          tags?: string[]
          title: string
          updated_at?: string
        }
        Update: {
          assignee_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          position?: number
          priority?: string
          project_id?: string | null
          status?: string
          tags?: string[]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "eng_tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "eng_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      fin_accounts: {
        Row: {
          active: boolean
          balance: number | null
          code: string | null
          created_at: string
          created_by: string | null
          currency: string | null
          id: string
          name: string
          notes: string | null
          type: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          balance?: number | null
          code?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string | null
          id?: string
          name: string
          notes?: string | null
          type?: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          balance?: number | null
          code?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string | null
          id?: string
          name?: string
          notes?: string | null
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      fin_bills: {
        Row: {
          amount: number
          bill_number: string | null
          category: string | null
          created_at: string
          created_by: string | null
          due_date: string | null
          id: string
          issue_date: string | null
          notes: string | null
          paid_at: string | null
          status: string
          supplier_id: string | null
          supplier_name: string | null
          tax: number | null
          updated_at: string
        }
        Insert: {
          amount: number
          bill_number?: string | null
          category?: string | null
          created_at?: string
          created_by?: string | null
          due_date?: string | null
          id?: string
          issue_date?: string | null
          notes?: string | null
          paid_at?: string | null
          status?: string
          supplier_id?: string | null
          supplier_name?: string | null
          tax?: number | null
          updated_at?: string
        }
        Update: {
          amount?: number
          bill_number?: string | null
          category?: string | null
          created_at?: string
          created_by?: string | null
          due_date?: string | null
          id?: string
          issue_date?: string | null
          notes?: string | null
          paid_at?: string | null
          status?: string
          supplier_id?: string | null
          supplier_name?: string | null
          tax?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fin_bills_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "mfg_suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      fin_expenses: {
        Row: {
          amount: number
          approver_id: string | null
          category: string | null
          created_at: string
          created_by: string | null
          id: string
          notes: string | null
          purpose: string
          receipt_url: string | null
          reimbursed: boolean
          spent_at: string | null
          status: string
          submitter_id: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          approver_id?: string | null
          category?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          notes?: string | null
          purpose: string
          receipt_url?: string | null
          reimbursed?: boolean
          spent_at?: string | null
          status?: string
          submitter_id?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          approver_id?: string | null
          category?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          notes?: string | null
          purpose?: string
          receipt_url?: string | null
          reimbursed?: boolean
          spent_at?: string | null
          status?: string
          submitter_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      fin_invoices: {
        Row: {
          client_id: string | null
          created_at: string
          created_by: string | null
          customer_email: string | null
          customer_name: string
          due_date: string | null
          id: string
          invoice_number: string | null
          issue_date: string | null
          job_id: string | null
          notes: string | null
          paid_at: string | null
          status: string
          subtotal: number | null
          tax: number | null
          total: number | null
          updated_at: string
        }
        Insert: {
          client_id?: string | null
          created_at?: string
          created_by?: string | null
          customer_email?: string | null
          customer_name: string
          due_date?: string | null
          id?: string
          invoice_number?: string | null
          issue_date?: string | null
          job_id?: string | null
          notes?: string | null
          paid_at?: string | null
          status?: string
          subtotal?: number | null
          tax?: number | null
          total?: number | null
          updated_at?: string
        }
        Update: {
          client_id?: string | null
          created_at?: string
          created_by?: string | null
          customer_email?: string | null
          customer_name?: string
          due_date?: string | null
          id?: string
          invoice_number?: string | null
          issue_date?: string | null
          job_id?: string | null
          notes?: string | null
          paid_at?: string | null
          status?: string
          subtotal?: number | null
          tax?: number | null
          total?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fin_invoices_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "con_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fin_invoices_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "con_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      fin_transactions: {
        Row: {
          amount: number
          created_at: string
          created_by: string | null
          credit_account_id: string | null
          debit_account_id: string | null
          id: string
          kind: string
          memo: string
          notes: string | null
          reconciled: boolean
          reference: string | null
          transaction_date: string
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          created_by?: string | null
          credit_account_id?: string | null
          debit_account_id?: string | null
          id?: string
          kind?: string
          memo: string
          notes?: string | null
          reconciled?: boolean
          reference?: string | null
          transaction_date?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          created_by?: string | null
          credit_account_id?: string | null
          debit_account_id?: string | null
          id?: string
          kind?: string
          memo?: string
          notes?: string | null
          reconciled?: boolean
          reference?: string | null
          transaction_date?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fin_transactions_credit_account_id_fkey"
            columns: ["credit_account_id"]
            isOneToOne: false
            referencedRelation: "fin_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fin_transactions_debit_account_id_fkey"
            columns: ["debit_account_id"]
            isOneToOne: false
            referencedRelation: "fin_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      guides: {
        Row: {
          body: string | null
          category: string | null
          created_at: string
          difficulty: string | null
          id: string
          published: boolean
          slug: string
          steps: Json
          symptom: string | null
          title: string
        }
        Insert: {
          body?: string | null
          category?: string | null
          created_at?: string
          difficulty?: string | null
          id?: string
          published?: boolean
          slug: string
          steps?: Json
          symptom?: string | null
          title: string
        }
        Update: {
          body?: string | null
          category?: string | null
          created_at?: string
          difficulty?: string | null
          id?: string
          published?: boolean
          slug?: string
          steps?: Json
          symptom?: string | null
          title?: string
        }
        Relationships: []
      }
      hq_email_events: {
        Row: {
          created_at: string
          event_type: string
          id: string
          message_id: string | null
          occurred_at: string
          payload: Json | null
          recipient: string | null
          subject: string | null
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          message_id?: string | null
          occurred_at?: string
          payload?: Json | null
          recipient?: string | null
          subject?: string | null
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          message_id?: string | null
          occurred_at?: string
          payload?: Json | null
          recipient?: string | null
          subject?: string | null
        }
        Relationships: []
      }
      hq_email_rules: {
        Row: {
          action: string
          action_value: string | null
          active: boolean
          created_at: string
          created_by: string | null
          id: string
          match_field: string
          match_value: string
          name: string
          updated_at: string
        }
        Insert: {
          action?: string
          action_value?: string | null
          active?: boolean
          created_at?: string
          created_by?: string | null
          id?: string
          match_field?: string
          match_value: string
          name: string
          updated_at?: string
        }
        Update: {
          action?: string
          action_value?: string | null
          active?: boolean
          created_at?: string
          created_by?: string | null
          id?: string
          match_field?: string
          match_value?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      hq_email_templates: {
        Row: {
          body: string | null
          category: string | null
          created_at: string
          created_by: string | null
          id: string
          name: string
          subject: string
          updated_at: string
        }
        Insert: {
          body?: string | null
          category?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          name: string
          subject: string
          updated_at?: string
        }
        Update: {
          body?: string | null
          category?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          name?: string
          subject?: string
          updated_at?: string
        }
        Relationships: []
      }
      hq_emails: {
        Row: {
          bcc: string | null
          body: string | null
          bounced_at: string | null
          cc: string | null
          clicks_count: number
          complained_at: string | null
          created_at: string
          created_by: string | null
          delivered_at: string | null
          direction: string
          folder: string
          from_addr: string | null
          id: string
          in_reply_to: string | null
          is_read: boolean
          last_event: string | null
          last_event_at: string | null
          mailbox: string
          message_id: string | null
          opens_count: number
          owner_id: string | null
          scheduled_at: string | null
          sent_at: string | null
          status: string | null
          subject: string
          to_addr: string | null
          updated_at: string
        }
        Insert: {
          bcc?: string | null
          body?: string | null
          bounced_at?: string | null
          cc?: string | null
          clicks_count?: number
          complained_at?: string | null
          created_at?: string
          created_by?: string | null
          delivered_at?: string | null
          direction?: string
          folder?: string
          from_addr?: string | null
          id?: string
          in_reply_to?: string | null
          is_read?: boolean
          last_event?: string | null
          last_event_at?: string | null
          mailbox?: string
          message_id?: string | null
          opens_count?: number
          owner_id?: string | null
          scheduled_at?: string | null
          sent_at?: string | null
          status?: string | null
          subject: string
          to_addr?: string | null
          updated_at?: string
        }
        Update: {
          bcc?: string | null
          body?: string | null
          bounced_at?: string | null
          cc?: string | null
          clicks_count?: number
          complained_at?: string | null
          created_at?: string
          created_by?: string | null
          delivered_at?: string | null
          direction?: string
          folder?: string
          from_addr?: string | null
          id?: string
          in_reply_to?: string | null
          is_read?: boolean
          last_event?: string | null
          last_event_at?: string | null
          mailbox?: string
          message_id?: string | null
          opens_count?: number
          owner_id?: string | null
          scheduled_at?: string | null
          sent_at?: string | null
          status?: string | null
          subject?: string
          to_addr?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      hq_file_permissions: {
        Row: {
          access_level: string
          created_at: string
          created_by: string | null
          file_id: string | null
          id: string
          notes: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          access_level?: string
          created_at?: string
          created_by?: string | null
          file_id?: string | null
          id?: string
          notes?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          access_level?: string
          created_at?: string
          created_by?: string | null
          file_id?: string | null
          id?: string
          notes?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hq_file_permissions_file_id_fkey"
            columns: ["file_id"]
            isOneToOne: false
            referencedRelation: "hq_files"
            referencedColumns: ["id"]
          },
        ]
      }
      hq_files: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          folder: string | null
          id: string
          is_shared: boolean
          mime_type: string | null
          name: string
          owner_id: string | null
          parent_id: string | null
          path: string | null
          size_bytes: number | null
          tags: string[] | null
          updated_at: string
          version: number
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          folder?: string | null
          id?: string
          is_shared?: boolean
          mime_type?: string | null
          name: string
          owner_id?: string | null
          parent_id?: string | null
          path?: string | null
          size_bytes?: number | null
          tags?: string[] | null
          updated_at?: string
          version?: number
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          folder?: string | null
          id?: string
          is_shared?: boolean
          mime_type?: string | null
          name?: string
          owner_id?: string | null
          parent_id?: string | null
          path?: string | null
          size_bytes?: number | null
          tags?: string[] | null
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "hq_files_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "hq_files"
            referencedColumns: ["id"]
          },
        ]
      }
      hr_applicants: {
        Row: {
          created_at: string
          created_by: string | null
          department: string | null
          email: string | null
          id: string
          interview_date: string | null
          interviewer_id: string | null
          linkedin_url: string | null
          name: string
          notes: string | null
          phone: string | null
          rating: number | null
          resume_url: string | null
          role: string | null
          source: string | null
          stage: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          department?: string | null
          email?: string | null
          id?: string
          interview_date?: string | null
          interviewer_id?: string | null
          linkedin_url?: string | null
          name: string
          notes?: string | null
          phone?: string | null
          rating?: number | null
          resume_url?: string | null
          role?: string | null
          source?: string | null
          stage?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          department?: string | null
          email?: string | null
          id?: string
          interview_date?: string | null
          interviewer_id?: string | null
          linkedin_url?: string | null
          name?: string
          notes?: string | null
          phone?: string | null
          rating?: number | null
          resume_url?: string | null
          role?: string | null
          source?: string | null
          stage?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      hr_benefits: {
        Row: {
          active: boolean
          created_at: string
          created_by: string | null
          description: string | null
          employer_contribution: number | null
          enrollment_deadline: string | null
          id: string
          monthly_cost: number | null
          name: string
          provider: string | null
          type: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          created_by?: string | null
          description?: string | null
          employer_contribution?: number | null
          enrollment_deadline?: string | null
          id?: string
          monthly_cost?: number | null
          name: string
          provider?: string | null
          type?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          created_by?: string | null
          description?: string | null
          employer_contribution?: number | null
          enrollment_deadline?: string | null
          id?: string
          monthly_cost?: number | null
          name?: string
          provider?: string | null
          type?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      hr_certifications: {
        Row: {
          created_at: string
          document_url: string | null
          employee_id: string | null
          expires_date: string | null
          id: string
          issue_date: string | null
          issuer: string | null
          name: string
          notes: string | null
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          document_url?: string | null
          employee_id?: string | null
          expires_date?: string | null
          id?: string
          issue_date?: string | null
          issuer?: string | null
          name: string
          notes?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          document_url?: string | null
          employee_id?: string | null
          expires_date?: string | null
          id?: string
          issue_date?: string | null
          issuer?: string | null
          name?: string
          notes?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hr_certifications_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "hr_employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hr_certifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      hr_departments: {
        Row: {
          budget: number | null
          created_at: string
          created_by: string | null
          description: string | null
          headcount: number | null
          id: string
          lead_id: string | null
          name: string
          updated_at: string
        }
        Insert: {
          budget?: number | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          headcount?: number | null
          id?: string
          lead_id?: string | null
          name: string
          updated_at?: string
        }
        Update: {
          budget?: number | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          headcount?: number | null
          id?: string
          lead_id?: string | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      hr_employees: {
        Row: {
          created_at: string
          created_by: string | null
          department: string | null
          email: string | null
          employment_type: string | null
          end_date: string | null
          full_name: string
          id: string
          location: string | null
          manager_id: string | null
          notes: string | null
          phone: string | null
          salary: number | null
          start_date: string | null
          status: string | null
          title: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          department?: string | null
          email?: string | null
          employment_type?: string | null
          end_date?: string | null
          full_name: string
          id?: string
          location?: string | null
          manager_id?: string | null
          notes?: string | null
          phone?: string | null
          salary?: number | null
          start_date?: string | null
          status?: string | null
          title?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          department?: string | null
          email?: string | null
          employment_type?: string | null
          end_date?: string | null
          full_name?: string
          id?: string
          location?: string | null
          manager_id?: string | null
          notes?: string | null
          phone?: string | null
          salary?: number | null
          start_date?: string | null
          status?: string | null
          title?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hr_employees_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "hr_employees"
            referencedColumns: ["id"]
          },
        ]
      }
      hr_onboarding: {
        Row: {
          assignee_id: string | null
          category: string | null
          created_at: string
          created_by: string | null
          due_date: string | null
          employee_id: string | null
          id: string
          notes: string | null
          status: string | null
          task: string
          updated_at: string
        }
        Insert: {
          assignee_id?: string | null
          category?: string | null
          created_at?: string
          created_by?: string | null
          due_date?: string | null
          employee_id?: string | null
          id?: string
          notes?: string | null
          status?: string | null
          task: string
          updated_at?: string
        }
        Update: {
          assignee_id?: string | null
          category?: string | null
          created_at?: string
          created_by?: string | null
          due_date?: string | null
          employee_id?: string | null
          id?: string
          notes?: string | null
          status?: string | null
          task?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "hr_onboarding_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "hr_employees"
            referencedColumns: ["id"]
          },
        ]
      }
      hr_onboarding_templates: {
        Row: {
          category: string | null
          created_at: string
          days_offset: number
          department: string | null
          id: string
          sort_order: number
          task: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          days_offset?: number
          department?: string | null
          id?: string
          sort_order?: number
          task: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          days_offset?: number
          department?: string | null
          id?: string
          sort_order?: number
          task?: string
          updated_at?: string
        }
        Relationships: []
      }
      hr_policies: {
        Row: {
          active: boolean
          category: string | null
          content: string | null
          created_at: string
          created_by: string | null
          effective_date: string | null
          id: string
          title: string
          updated_at: string
          version: string | null
        }
        Insert: {
          active?: boolean
          category?: string | null
          content?: string | null
          created_at?: string
          created_by?: string | null
          effective_date?: string | null
          id?: string
          title: string
          updated_at?: string
          version?: string | null
        }
        Update: {
          active?: boolean
          category?: string | null
          content?: string | null
          created_at?: string
          created_by?: string | null
          effective_date?: string | null
          id?: string
          title?: string
          updated_at?: string
          version?: string | null
        }
        Relationships: []
      }
      hr_reviews: {
        Row: {
          created_at: string
          created_by: string | null
          employee_id: string | null
          goals: string | null
          growth_areas: string | null
          id: string
          period: string | null
          rating: number | null
          review_date: string | null
          reviewer_id: string | null
          status: string | null
          strengths: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          employee_id?: string | null
          goals?: string | null
          growth_areas?: string | null
          id?: string
          period?: string | null
          rating?: number | null
          review_date?: string | null
          reviewer_id?: string | null
          status?: string | null
          strengths?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          employee_id?: string | null
          goals?: string | null
          growth_areas?: string | null
          id?: string
          period?: string | null
          rating?: number | null
          review_date?: string | null
          reviewer_id?: string | null
          status?: string | null
          strengths?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "hr_reviews_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "hr_employees"
            referencedColumns: ["id"]
          },
        ]
      }
      hr_suspensions: {
        Row: {
          active: boolean
          created_at: string
          created_by: string | null
          ends_at: string | null
          id: string
          reason: string | null
          starts_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          created_by?: string | null
          ends_at?: string | null
          id?: string
          reason?: string | null
          starts_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          active?: boolean
          created_at?: string
          created_by?: string | null
          ends_at?: string | null
          id?: string
          reason?: string | null
          starts_at?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      hr_time_entries: {
        Row: {
          billable: boolean | null
          created_at: string
          created_by: string | null
          entry_date: string
          hours: number
          id: string
          notes: string | null
          project: string | null
          task: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          billable?: boolean | null
          created_at?: string
          created_by?: string | null
          entry_date?: string
          hours?: number
          id?: string
          notes?: string | null
          project?: string | null
          task?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          billable?: boolean | null
          created_at?: string
          created_by?: string | null
          entry_date?: string
          hours?: number
          id?: string
          notes?: string | null
          project?: string | null
          task?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      hr_time_off: {
        Row: {
          approver_id: string | null
          created_at: string
          created_by: string | null
          days: number | null
          end_date: string
          id: string
          reason: string | null
          start_date: string
          status: string | null
          type: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          approver_id?: string | null
          created_at?: string
          created_by?: string | null
          days?: number | null
          end_date: string
          id?: string
          reason?: string | null
          start_date: string
          status?: string | null
          type?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          approver_id?: string | null
          created_at?: string
          created_by?: string | null
          days?: number | null
          end_date?: string
          id?: string
          reason?: string | null
          start_date?: string
          status?: string | null
          type?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      hr_training: {
        Row: {
          category: string | null
          completed_date: string | null
          course: string
          created_at: string
          document_url: string | null
          employee_id: string | null
          expires_date: string | null
          id: string
          instructor: string | null
          required: boolean | null
          score: string | null
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          category?: string | null
          completed_date?: string | null
          course: string
          created_at?: string
          document_url?: string | null
          employee_id?: string | null
          expires_date?: string | null
          id?: string
          instructor?: string | null
          required?: boolean | null
          score?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          category?: string | null
          completed_date?: string | null
          course?: string
          created_at?: string
          document_url?: string | null
          employee_id?: string | null
          expires_date?: string | null
          id?: string
          instructor?: string | null
          required?: boolean | null
          score?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hr_training_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "hr_employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hr_training_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      idea_comments: {
        Row: {
          author_id: string
          body: string
          created_at: string
          id: string
          idea_id: string
          is_anonymous: boolean
        }
        Insert: {
          author_id: string
          body: string
          created_at?: string
          id?: string
          idea_id: string
          is_anonymous?: boolean
        }
        Update: {
          author_id?: string
          body?: string
          created_at?: string
          id?: string
          idea_id?: string
          is_anonymous?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "idea_comments_idea_id_fkey"
            columns: ["idea_id"]
            isOneToOne: false
            referencedRelation: "ideas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "idea_comments_idea_id_fkey"
            columns: ["idea_id"]
            isOneToOne: false
            referencedRelation: "ideas_masked"
            referencedColumns: ["id"]
          },
        ]
      }
      ideas: {
        Row: {
          approval_status: string
          assigned_to: string | null
          author_id: string
          category: string | null
          created_at: string
          description: string | null
          effort: number
          id: string
          impact: number
          is_anonymous: boolean
          review_note: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          title: string
          updated_at: string
          upvotes: number
        }
        Insert: {
          approval_status?: string
          assigned_to?: string | null
          author_id: string
          category?: string | null
          created_at?: string
          description?: string | null
          effort?: number
          id?: string
          impact?: number
          is_anonymous?: boolean
          review_note?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          title: string
          updated_at?: string
          upvotes?: number
        }
        Update: {
          approval_status?: string
          assigned_to?: string | null
          author_id?: string
          category?: string | null
          created_at?: string
          description?: string | null
          effort?: number
          id?: string
          impact?: number
          is_anonymous?: boolean
          review_note?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          title?: string
          updated_at?: string
          upvotes?: number
        }
        Relationships: []
      }
      interest_submissions: {
        Row: {
          created_at: string
          email: string
          id: string
          interest_type: string
          location: string | null
          message: string | null
          name: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          interest_type: string
          location?: string | null
          message?: string | null
          name: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          interest_type?: string
          location?: string | null
          message?: string | null
          name?: string
        }
        Relationships: []
      }
      invites: {
        Row: {
          accepted_at: string | null
          created_at: string
          department: string | null
          email: string
          expires_at: string
          full_name: string | null
          id: string
          invited_by: string | null
          role: Database["public"]["Enums"]["app_role"]
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          department?: string | null
          email: string
          expires_at?: string
          full_name?: string | null
          id?: string
          invited_by?: string | null
          role?: Database["public"]["Enums"]["app_role"]
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          department?: string | null
          email?: string
          expires_at?: string
          full_name?: string | null
          id?: string
          invited_by?: string | null
          role?: Database["public"]["Enums"]["app_role"]
        }
        Relationships: []
      }
      meeting_external_invites: {
        Row: {
          created_at: string
          email: string
          id: string
          invited_by: string | null
          joined_at: string | null
          meeting_id: string
          name: string | null
          token: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          invited_by?: string | null
          joined_at?: string | null
          meeting_id: string
          name?: string | null
          token?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          invited_by?: string | null
          joined_at?: string | null
          meeting_id?: string
          name?: string | null
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "meeting_external_invites_meeting_id_fkey"
            columns: ["meeting_id"]
            isOneToOne: false
            referencedRelation: "meetings"
            referencedColumns: ["id"]
          },
        ]
      }
      meeting_notes: {
        Row: {
          attendees: string[]
          author_id: string
          body: string | null
          content_md: string | null
          created_at: string
          id: string
          meeting_date: string | null
          meeting_id: string | null
          tags: string[]
          title: string
          updated_at: string
        }
        Insert: {
          attendees?: string[]
          author_id: string
          body?: string | null
          content_md?: string | null
          created_at?: string
          id?: string
          meeting_date?: string | null
          meeting_id?: string | null
          tags?: string[]
          title: string
          updated_at?: string
        }
        Update: {
          attendees?: string[]
          author_id?: string
          body?: string | null
          content_md?: string | null
          created_at?: string
          id?: string
          meeting_date?: string | null
          meeting_id?: string | null
          tags?: string[]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "meeting_notes_meeting_id_fkey"
            columns: ["meeting_id"]
            isOneToOne: false
            referencedRelation: "meetings"
            referencedColumns: ["id"]
          },
        ]
      }
      meeting_participants: {
        Row: {
          meeting_id: string
          rsvp: string
          user_id: string
        }
        Insert: {
          meeting_id: string
          rsvp?: string
          user_id: string
        }
        Update: {
          meeting_id?: string
          rsvp?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "meeting_participants_meeting_id_fkey"
            columns: ["meeting_id"]
            isOneToOne: false
            referencedRelation: "meetings"
            referencedColumns: ["id"]
          },
        ]
      }
      meetings: {
        Row: {
          created_at: string
          description: string | null
          ended_at: string | null
          ended_by: string | null
          ends_at: string
          host_id: string
          id: string
          join_url: string | null
          location: string | null
          starts_at: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          ended_at?: string | null
          ended_by?: string | null
          ends_at: string
          host_id: string
          id?: string
          join_url?: string | null
          location?: string | null
          starts_at: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          ended_at?: string | null
          ended_by?: string | null
          ends_at?: string
          host_id?: string
          id?: string
          join_url?: string | null
          location?: string | null
          starts_at?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      message_reactions: {
        Row: {
          created_at: string
          emoji: string
          id: string
          message_id: string
          message_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          emoji: string
          id?: string
          message_id: string
          message_type: string
          user_id: string
        }
        Update: {
          created_at?: string
          emoji?: string
          id?: string
          message_id?: string
          message_type?: string
          user_id?: string
        }
        Relationships: []
      }
      mfg_inspections: {
        Row: {
          created_at: string
          created_by: string | null
          defect_count: number
          id: string
          inspected_at: string | null
          inspector_id: string | null
          notes: string | null
          status: string
          updated_at: string
          work_order_id: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          defect_count?: number
          id?: string
          inspected_at?: string | null
          inspector_id?: string | null
          notes?: string | null
          status?: string
          updated_at?: string
          work_order_id?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          defect_count?: number
          id?: string
          inspected_at?: string | null
          inspector_id?: string | null
          notes?: string | null
          status?: string
          updated_at?: string
          work_order_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mfg_inspections_work_order_id_fkey"
            columns: ["work_order_id"]
            isOneToOne: false
            referencedRelation: "mfg_work_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      mfg_inventory: {
        Row: {
          category: string | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          location: string | null
          name: string
          quantity: number
          reorder_point: number
          sku: string
          supplier_id: string | null
          unit_cost: number | null
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          location?: string | null
          name: string
          quantity?: number
          reorder_point?: number
          sku: string
          supplier_id?: string | null
          unit_cost?: number | null
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          location?: string | null
          name?: string
          quantity?: number
          reorder_point?: number
          sku?: string
          supplier_id?: string | null
          unit_cost?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "mfg_inventory_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "mfg_suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      mfg_purchase_orders: {
        Row: {
          created_at: string
          created_by: string | null
          expected_date: string | null
          id: string
          notes: string | null
          order_date: string | null
          po_number: string
          status: string
          supplier_id: string | null
          total: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          expected_date?: string | null
          id?: string
          notes?: string | null
          order_date?: string | null
          po_number: string
          status?: string
          supplier_id?: string | null
          total?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          expected_date?: string | null
          id?: string
          notes?: string | null
          order_date?: string | null
          po_number?: string
          status?: string
          supplier_id?: string | null
          total?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "mfg_purchase_orders_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "mfg_suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      mfg_suppliers: {
        Row: {
          address: string | null
          category: string | null
          contact_name: string | null
          created_at: string
          created_by: string | null
          email: string | null
          id: string
          name: string
          notes: string | null
          phone: string | null
          rating: number | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          category?: string | null
          contact_name?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          rating?: number | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          category?: string | null
          contact_name?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          rating?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      mfg_work_orders: {
        Row: {
          assignee_id: string | null
          created_at: string
          created_by: string | null
          due_date: string | null
          id: string
          notes: string | null
          order_number: string
          priority: string
          product_name: string
          project_id: string | null
          quantity: number
          status: string
          updated_at: string
        }
        Insert: {
          assignee_id?: string | null
          created_at?: string
          created_by?: string | null
          due_date?: string | null
          id?: string
          notes?: string | null
          order_number: string
          priority?: string
          product_name: string
          project_id?: string | null
          quantity?: number
          status?: string
          updated_at?: string
        }
        Update: {
          assignee_id?: string | null
          created_at?: string
          created_by?: string | null
          due_date?: string | null
          id?: string
          notes?: string | null
          order_number?: string
          priority?: string
          product_name?: string
          project_id?: string | null
          quantity?: number
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "mfg_work_orders_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "eng_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      newsletter_signups: {
        Row: {
          created_at: string
          email: string
          id: string
          source: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          source?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          source?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          id: string
          link: string | null
          read_at: string | null
          title: string
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          link?: string | null
          read_at?: string | null
          title: string
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          link?: string | null
          read_at?: string | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          cart: Json
          created_at: string
          email: string
          id: string
          name: string
          notes: string | null
          shipping_address: Json | null
          status: string
          subtotal_cents: number
        }
        Insert: {
          cart: Json
          created_at?: string
          email: string
          id?: string
          name: string
          notes?: string | null
          shipping_address?: Json | null
          status?: string
          subtotal_cents?: number
        }
        Update: {
          cart?: Json
          created_at?: string
          email?: string
          id?: string
          name?: string
          notes?: string | null
          shipping_address?: Json | null
          status?: string
          subtotal_cents?: number
        }
        Relationships: []
      }
      products: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          id: string
          images: string[]
          in_the_box: string[]
          name: string
          price_cents: number | null
          price_display: string | null
          published: boolean
          related_slugs: string[]
          slug: string
          sort_order: number
          specs: Json
          tagline: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          images?: string[]
          in_the_box?: string[]
          name: string
          price_cents?: number | null
          price_display?: string | null
          published?: boolean
          related_slugs?: string[]
          slug: string
          sort_order?: number
          specs?: Json
          tagline?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          images?: string[]
          in_the_box?: string[]
          name?: string
          price_cents?: number | null
          price_display?: string | null
          published?: boolean
          related_slugs?: string[]
          slug?: string
          sort_order?: number
          specs?: Json
          tagline?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          department: string | null
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          title: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          department?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
          title?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          department?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      project_requests: {
        Row: {
          additional_info: string | null
          address: string | null
          budget: string | null
          created_at: string
          description: string
          email: string
          id: string
          name: string
          phone: string | null
          photo_urls: string[]
          project_type: string
          status: string
          timeline: string | null
          updated_at: string
        }
        Insert: {
          additional_info?: string | null
          address?: string | null
          budget?: string | null
          created_at?: string
          description: string
          email: string
          id?: string
          name: string
          phone?: string | null
          photo_urls?: string[]
          project_type: string
          status?: string
          timeline?: string | null
          updated_at?: string
        }
        Update: {
          additional_info?: string | null
          address?: string | null
          budget?: string | null
          created_at?: string
          description?: string
          email?: string
          id?: string
          name?: string
          phone?: string | null
          photo_urls?: string[]
          project_type?: string
          status?: string
          timeline?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      quote_requests: {
        Row: {
          assigned_to: string | null
          budget: string | null
          company: string | null
          created_at: string
          description: string
          email: string
          id: string
          name: string
          project_type: string | null
          services: string[]
          source: string | null
          stage: string | null
          status: string
          timeline: string | null
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          budget?: string | null
          company?: string | null
          created_at?: string
          description: string
          email: string
          id?: string
          name: string
          project_type?: string | null
          services?: string[]
          source?: string | null
          stage?: string | null
          status?: string
          timeline?: string | null
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          budget?: string | null
          company?: string | null
          created_at?: string
          description?: string
          email?: string
          id?: string
          name?: string
          project_type?: string | null
          services?: string[]
          source?: string | null
          stage?: string | null
          status?: string
          timeline?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      role_route_access: {
        Row: {
          created_at: string
          id: string
          role_id: string
          route: string
        }
        Insert: {
          created_at?: string
          id?: string
          role_id: string
          route: string
        }
        Update: {
          created_at?: string
          id?: string
          role_id?: string
          route?: string
        }
        Relationships: [
          {
            foreignKeyName: "role_route_access_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "custom_roles"
            referencedColumns: ["id"]
          },
        ]
      }
      sales_contacts: {
        Row: {
          company: string | null
          created_at: string
          created_by: string | null
          email: string | null
          id: string
          kind: string
          name: string
          notes: string | null
          owner_id: string | null
          phone: string | null
          source: string | null
          status: string
          tags: string[] | null
          title: string | null
          updated_at: string
        }
        Insert: {
          company?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          id?: string
          kind?: string
          name: string
          notes?: string | null
          owner_id?: string | null
          phone?: string | null
          source?: string | null
          status?: string
          tags?: string[] | null
          title?: string | null
          updated_at?: string
        }
        Update: {
          company?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          id?: string
          kind?: string
          name?: string
          notes?: string | null
          owner_id?: string | null
          phone?: string | null
          source?: string | null
          status?: string
          tags?: string[] | null
          title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      sales_contracts: {
        Row: {
          created_at: string
          created_by: string | null
          document_url: string | null
          effective_date: string | null
          expiry_date: string | null
          id: string
          kind: string | null
          notes: string | null
          owner_id: string | null
          party: string | null
          status: string
          title: string
          updated_at: string
          value: number | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          document_url?: string | null
          effective_date?: string | null
          expiry_date?: string | null
          id?: string
          kind?: string | null
          notes?: string | null
          owner_id?: string | null
          party?: string | null
          status?: string
          title: string
          updated_at?: string
          value?: number | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          document_url?: string | null
          effective_date?: string | null
          expiry_date?: string | null
          id?: string
          kind?: string | null
          notes?: string | null
          owner_id?: string | null
          party?: string | null
          status?: string
          title?: string
          updated_at?: string
          value?: number | null
        }
        Relationships: []
      }
      sales_deals: {
        Row: {
          company: string | null
          contact_email: string | null
          contact_name: string | null
          created_at: string
          created_by: string | null
          expected_close: string | null
          id: string
          notes: string | null
          owner_id: string | null
          probability: number | null
          source: string | null
          stage: string
          tags: string[] | null
          title: string
          updated_at: string
          value: number | null
        }
        Insert: {
          company?: string | null
          contact_email?: string | null
          contact_name?: string | null
          created_at?: string
          created_by?: string | null
          expected_close?: string | null
          id?: string
          notes?: string | null
          owner_id?: string | null
          probability?: number | null
          source?: string | null
          stage?: string
          tags?: string[] | null
          title: string
          updated_at?: string
          value?: number | null
        }
        Update: {
          company?: string | null
          contact_email?: string | null
          contact_name?: string | null
          created_at?: string
          created_by?: string | null
          expected_close?: string | null
          id?: string
          notes?: string | null
          owner_id?: string | null
          probability?: number | null
          source?: string | null
          stage?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
          value?: number | null
        }
        Relationships: []
      }
      sales_orders: {
        Row: {
          created_at: string
          created_by: string | null
          customer_email: string | null
          customer_name: string
          id: string
          items_count: number | null
          notes: string | null
          order_number: string | null
          ordered_at: string | null
          owner_id: string | null
          shipped_at: string | null
          status: string
          subtotal: number | null
          tax: number | null
          total: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          customer_email?: string | null
          customer_name: string
          id?: string
          items_count?: number | null
          notes?: string | null
          order_number?: string | null
          ordered_at?: string | null
          owner_id?: string | null
          shipped_at?: string | null
          status?: string
          subtotal?: number | null
          tax?: number | null
          total?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          customer_email?: string | null
          customer_name?: string
          id?: string
          items_count?: number | null
          notes?: string | null
          order_number?: string | null
          ordered_at?: string | null
          owner_id?: string | null
          shipped_at?: string | null
          status?: string
          subtotal?: number | null
          tax?: number | null
          total?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      sales_price_rules: {
        Row: {
          active: boolean
          code: string | null
          created_at: string
          created_by: string | null
          discount_amount: number | null
          discount_percent: number | null
          ends_at: string | null
          id: string
          kind: string
          minimum_quantity: number | null
          name: string
          notes: string | null
          starts_at: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          code?: string | null
          created_at?: string
          created_by?: string | null
          discount_amount?: number | null
          discount_percent?: number | null
          ends_at?: string | null
          id?: string
          kind?: string
          minimum_quantity?: number | null
          name: string
          notes?: string | null
          starts_at?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          code?: string | null
          created_at?: string
          created_by?: string | null
          discount_amount?: number | null
          discount_percent?: number | null
          ends_at?: string | null
          id?: string
          kind?: string
          minimum_quantity?: number | null
          name?: string
          notes?: string | null
          starts_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      user_custom_roles: {
        Row: {
          assigned_at: string
          id: string
          role_id: string
          user_id: string
        }
        Insert: {
          assigned_at?: string
          id?: string
          role_id: string
          user_id: string
        }
        Update: {
          assigned_at?: string
          id?: string
          role_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_custom_roles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "custom_roles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_email_settings: {
        Row: {
          auto_reply_body: string | null
          auto_reply_enabled: boolean
          auto_reply_subject: string | null
          created_at: string
          digest_frequency: string
          display_name: string | null
          notify_on_mention: boolean
          notify_on_new: boolean
          signature: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          auto_reply_body?: string | null
          auto_reply_enabled?: boolean
          auto_reply_subject?: string | null
          created_at?: string
          digest_frequency?: string
          display_name?: string | null
          notify_on_mention?: boolean
          notify_on_new?: boolean
          signature?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          auto_reply_body?: string | null
          auto_reply_enabled?: boolean
          auto_reply_subject?: string | null
          created_at?: string
          digest_frequency?: string
          display_name?: string | null
          notify_on_mention?: boolean
          notify_on_new?: boolean
          signature?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      idea_comments_masked: {
        Row: {
          author_id: string | null
          body: string | null
          created_at: string | null
          id: string | null
          idea_id: string | null
          is_anonymous: boolean | null
        }
        Insert: {
          author_id?: never
          body?: string | null
          created_at?: string | null
          id?: string | null
          idea_id?: string | null
          is_anonymous?: boolean | null
        }
        Update: {
          author_id?: never
          body?: string | null
          created_at?: string | null
          id?: string | null
          idea_id?: string | null
          is_anonymous?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "idea_comments_idea_id_fkey"
            columns: ["idea_id"]
            isOneToOne: false
            referencedRelation: "ideas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "idea_comments_idea_id_fkey"
            columns: ["idea_id"]
            isOneToOne: false
            referencedRelation: "ideas_masked"
            referencedColumns: ["id"]
          },
        ]
      }
      ideas_masked: {
        Row: {
          approval_status: string | null
          assigned_to: string | null
          author_id: string | null
          category: string | null
          created_at: string | null
          description: string | null
          effort: number | null
          id: string | null
          impact: number | null
          is_anonymous: boolean | null
          review_note: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
          title: string | null
          updated_at: string | null
          upvotes: number | null
        }
        Insert: {
          approval_status?: string | null
          assigned_to?: string | null
          author_id?: never
          category?: string | null
          created_at?: string | null
          description?: string | null
          effort?: number | null
          id?: string | null
          impact?: number | null
          is_anonymous?: boolean | null
          review_note?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          title?: string | null
          updated_at?: string | null
          upvotes?: number | null
        }
        Update: {
          approval_status?: string | null
          assigned_to?: string | null
          author_id?: never
          category?: string | null
          created_at?: string | null
          description?: string | null
          effort?: number | null
          id?: string | null
          impact?: number | null
          is_anonymous?: boolean | null
          review_note?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          title?: string | null
          updated_at?: string | null
          upvotes?: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      notify_managers: {
        Args: { _body: string; _link: string; _title: string }
        Returns: undefined
      }
      notify_user: {
        Args: { _body: string; _link: string; _title: string; _user_id: string }
        Returns: undefined
      }
    }
    Enums: {
      app_role:
        | "super_admin"
        | "admin"
        | "manager"
        | "employee"
        | "engineering"
        | "manufacturing"
        | "sales"
        | "finance"
        | "hr"
        | "it"
        | "support"
        | "marketing"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: [
        "super_admin",
        "admin",
        "manager",
        "employee",
        "engineering",
        "manufacturing",
        "sales",
        "finance",
        "hr",
        "it",
        "support",
        "marketing",
      ],
    },
  },
} as const
