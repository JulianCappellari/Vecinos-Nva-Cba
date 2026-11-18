import type { PostInput, PostKind } from "./schema";
export type Viewer = { id: string; name: string; role: "MEMBER" | "ADMIN"; province: string | null };
export type CommunityPost = {
  id: string; kind: PostKind; title: string; description: string; category: string;
  data: PostInput["data"]; status: "PENDING" | "APPROVED" | "REJECTED" | "CLOSED";
  author: { name: string }; imageUrl: string | null; createdAt: string; updatedAt: string; expiresAt: string;
  contact?: string; imageId?: string | null;
  participants: number; joined: boolean; mine: boolean; reviewNote?: string | null;
  contactUrl?: string; groupUrl?: string;
};
export type ListingResult = { posts: CommunityPost[]; total: number; pages: number; page: number };
export type ActionResult = { ok: boolean; message: string; id?: string; user?: Viewer };
