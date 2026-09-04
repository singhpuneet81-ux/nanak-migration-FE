/** Public iframe / self-serve routes — never require admin login or auth context. */
export const PUBLIC_EMBED_PATHS = [
  "/herosection_chatbot",
  "/herosection-chatbot",
  "/immigration_newsletter",
  "/immigration-newsletter",
  "/book",
  "/book-consultation",
] as const;

export function isPublicEmbedPath(pathname: string) {
  const p = pathname.replace(/\/$/, "") || "/";
  return (PUBLIC_EMBED_PATHS as readonly string[]).includes(p);
}
