export type ClientLogo = {
  id: string;
  name: string;
  logoUrl: string;
  website?: string;
  width?: number;
  height?: number;
};

/**
 * Verified Client Logos
 * Add actual client logos here once provided.
 *
 * Example:
 * {
 *   id: "client-1",
 *   name: "Client Name",
 *   logoUrl: "/clients/client-name.svg", // place file in public/clients/
 * }
 */
export const clientLogos: ClientLogo[] = [];
