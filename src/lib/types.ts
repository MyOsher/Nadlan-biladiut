export type DealType = "sale" | "rent";
export type PropertyStatus =
  | "active"
  | "sold"
  | "rented"
  | "expired"
  | "cancelled"
  | "draft";
export type MediaType = "image" | "video";

export interface Property {
  id: string;
  form_number: string | null;
  agent_name: string | null;
  agent_id_number: string | null;
  deal_type: DealType;
  status: PropertyStatus;
  property_type: string | null;
  rooms: number | null;
  size_sqm: number | null;
  floor: string | null;
  property_address: string | null;
  city: string | null;
  block: string | null;
  parcel: string | null;
  sub_parcel: string | null;
  asking_price: number | null;
  owner_name: string | null;
  exclusivity_start: string | null;
  exclusivity_end: string | null;
  fee_sale_percent: number | null;
  fee_rent_text: string | null;
  agreement_date: string | null;
  notes: string | null;
  owner_signature: string | null;
  agent_signature: string | null;
  signed_digitally_at: string | null;
  signed_form_url: string | null;
  cover_image_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface PropertyOwner {
  id: string;
  property_id: string;
  full_name: string | null;
  id_number: string | null;
  phone: string | null;
  address: string | null;
  sort_order: number;
  created_at: string;
}

export interface PropertyMedia {
  id: string;
  property_id: string;
  type: MediaType;
  storage_path: string;
  url: string | null;
  caption: string | null;
  sort_order: number;
  created_at: string;
}

export interface AppSettings {
  id: number;
  agent_name: string | null;
  agent_id_number: string | null;
  agent_email: string | null;
  agent_phone: string | null;
  default_sale_fee_percent: number | null;
  default_rent_fee_text: string | null;
  reminder_days: number[] | null;
  telegram_chat_id: string | null;
  telegram_enabled: boolean | null;
  created_at: string;
  updated_at: string;
}

// Minimal Database type for the typed Supabase client.
// Each table must include `Relationships` (and the schema `CompositeTypes`) or
// supabase-js falls back to a `never` payload type for inserts/updates.
type Table<Row> = {
  Row: Row;
  Insert: Partial<Row>;
  Update: Partial<Row>;
  Relationships: [];
};

export interface Database {
  public: {
    Tables: {
      properties: Table<Property>;
      property_owners: Table<PropertyOwner>;
      property_media: Table<PropertyMedia>;
      app_settings: Table<AppSettings>;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      deal_type: DealType;
      property_status: PropertyStatus;
      media_type: MediaType;
    };
    CompositeTypes: Record<string, never>;
  };
}
