import { sql } from "@/lib/db";

export type SocialLinkRow = {
  id: string;
  platform: string;
  label: string;
  url: string;
  icon: string | null;
  display_order: number;
  created_at: string;
  updated_at: string;
};

export type SocialLink = {
  _id: string;
  platform: string;
  label: string;
  url: string;
  icon: string | null;
  displayOrder: number;
};

export function mapSocialLink(row: SocialLinkRow): SocialLink {
  return {
    _id: row.id,
    platform: row.platform,
    label: row.label,
    url: row.url,
    icon: row.icon,
    displayOrder: row.display_order,
  };
}

export async function getAllSocialLinks(): Promise<SocialLink[]> {
  const rows = await sql`
    SELECT * FROM social_links ORDER BY display_order ASC
  `;
  return (rows as SocialLinkRow[]).map(mapSocialLink);
}

export async function getSocialLinkByPlatform(platform: string): Promise<SocialLink | undefined> {
  const rows = await sql`
    SELECT * FROM social_links WHERE platform = ${platform} LIMIT 1
  `;
  const row = rows[0] as SocialLinkRow | undefined;
  return row ? mapSocialLink(row) : undefined;
}
