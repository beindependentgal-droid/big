export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          avatar_url: string | null;
          role: 'member' | 'moderator' | 'admin';
          is_super_admin: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string;
          avatar_url?: string | null;
          role?: 'member' | 'moderator' | 'admin';
          is_super_admin?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string;
          avatar_url?: string | null;
          role?: 'member' | 'moderator' | 'admin';
          is_super_admin?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      big_members: {
        Row: {
          id: string;
          name: string;
          email: string | null;
          avatar: string | null;
          title: string | null;
          city: string | null;
          rank: string | null;
          skills: string[];
          interests: string[];
          bio: string | null;
          points: number;
          badges: string[];
          business_stage: string | null;
          mentoring_capacity: string | null;
          followingIds: string[];
          followerIds: string[];
          circleIds: string[];
          isSuperAdmin: boolean;
          isModerator: boolean;
          joinedAt: string | null;
          website: string | null;
          linkedinUrl: string | null;
          githubUrl: string | null;
          twitterUrl: string | null;
          company: string | null;
          industry: string | null;
          certifications: string[];
          endorsements: Json;
          recommendations: Json;
          experience: Json;
          education: Json;
          biometricCredentialId: string | null;
          passwordHash: string | null;
          passwordSalt: string | null;
          pinHash: string | null;
          pinSalt: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<{
          [K in keyof Database['public']['Tables']['big_members']['Row']]: Database['public']['Tables']['big_members']['Row'][K]
        }>;
        Update: Partial<{
          [K in keyof Database['public']['Tables']['big_members']['Row']]: Database['public']['Tables']['big_members']['Row'][K]
        }>;
      };
      big_posts: {
        Row: {
          id: string;
          author: Json | null;
          author_id: string | null;
          content: string | null;
          timestamp: string;
          likes: number;
          likes_ids: Json;
          comments: Json;
          liked: boolean;
          circleId: string | null;
          tag: string | null;
          tags: string[];
          imageUrl: string | null;
          reactions: Json;
          commentsDisabled: boolean;
          repostsCount: number;
          sharesCount: number;
          scheduledFor: string | null;
          status: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<{
          [K in keyof Database['public']['Tables']['big_posts']['Row']]: Database['public']['Tables']['big_posts']['Row'][K]
        }>;
        Update: Partial<{
          [K in keyof Database['public']['Tables']['big_posts']['Row']]: Database['public']['Tables']['big_posts']['Row'][K]
        }>;
      };
      big_events: {
        Row: {
          id: string;
          title: string;
          date: string | null;
          time: string | null;
          location: string | null;
          type: string | null;
          attendees: number;
          attendeeNames: string[];
          rsvped: boolean;
          description: string | null;
          image: string | null;
          category: string | null;
          reminded: boolean;
          createdBy: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<{
          [K in keyof Database['public']['Tables']['big_events']['Row']]: Database['public']['Tables']['big_events']['Row'][K]
        }>;
        Update: Partial<{
          [K in keyof Database['public']['Tables']['big_events']['Row']]: Database['public']['Tables']['big_events']['Row'][K]
        }>;
      };
    };
  };
}
