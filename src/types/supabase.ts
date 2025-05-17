export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          petal_count: number;
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          petal_count?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          petal_count?: number;
          created_at?: string;
        };
      };
    };
  };
};
