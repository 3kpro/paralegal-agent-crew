
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string | null
          full_name: string | null
          avatar_url: string | null
          created_at: string
        }
        Insert: {
          id: string
          email?: string | null
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          email?: string | null
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
        }
      }
      prompts: {
        Row: {
          id: string
          title: string
          description: string
          full_text: string
          category: string
          price: number
          example_output: string | null
          use_cases: string[] | null
          is_active: boolean
          slug: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          full_text: string
          category: string
          price: number
          example_output?: string | null
          use_cases?: string[] | null
          is_active?: boolean
          slug?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          full_text?: string
          category?: string
          price?: number
          example_output?: string | null
          use_cases?: string[] | null
          is_active?: boolean
          slug?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      bundles: {
        Row: {
          id: string
          name: string
          description: string
          price: number
          is_active: boolean
          slug: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          price: number
          is_active?: boolean
          slug?: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          price?: number
          is_active?: boolean
          slug?: string
          created_at?: string
        }
      }
      bundle_items: {
        Row: {
          bundle_id: string
          prompt_id: string
        }
        Insert: {
          bundle_id: string
          prompt_id: string
        }
        Update: {
          bundle_id?: string
          prompt_id?: string
        }
      }
      purchases: {
        Row: {
          id: string
          user_id: string
          prompt_id: string | null
          bundle_id: string | null
          stripe_payment_id: string
          amount_paid: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          prompt_id?: string | null
          bundle_id?: string | null
          stripe_payment_id: string
          amount_paid: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          prompt_id?: string | null
          bundle_id?: string | null
          stripe_payment_id?: string
          amount_paid?: number
          created_at?: string
        }
      }
    }
  }
}

export type Prompt = Database['public']['Tables']['prompts']['Row']
