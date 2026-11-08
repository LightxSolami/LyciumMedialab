export type SocialPlatform = "youtube" | "tiktok" | "instagram" | "facebook";

export type SocialLink = {
  platform: SocialPlatform;
  label: string;
  href: string;
};

export const socialLinks: SocialLink[] = [
  { platform: "youtube", label: "YouTube", href: "" },
  { platform: "tiktok", label: "TikTok", href: "" },
  { platform: "instagram", label: "Instagram", href: "" },
  { platform: "facebook", label: "Facebook", href: "" },
];
