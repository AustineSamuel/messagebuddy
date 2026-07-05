/**
 * Frontend-owned API types mirrored from backend serializers.
 * Keep in sync with backend/modules/users/transformers/user_transformer.ts
 */

export namespace Data {
  export type User = {
    id: number;
    fullName: string | null;
    email: string;
    createdAt: string;
    updatedAt: string | null;
    initials: string;
  };
}
