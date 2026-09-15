import "server-only";

import { Resend } from "resend";

import type { ContactMessage } from "../types/contact";
import { buildContactEmail } from "./contact-email";

export interface ContactMailer {
  send(message: ContactMessage): Promise<void>;
}

export function getContactMailer(): ContactMailer | null {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.CONTACT_FROM_EMAIL?.trim();
  const to = process.env.CONTACT_TO_EMAIL?.trim();

  if (!apiKey || !from || !to) return null;

  const resend = new Resend(apiKey);

  return {
    async send(message) {
      const { data, error } = await resend.emails.send({
        from,
        to: [to],
        replyTo: message.email,
        ...buildContactEmail(message),
      });

      // Resend can resolve with an error instead of rejecting the promise.
      // Keep provider details on the server; the action returns a generic error.
      if (error || !data?.id) {
        throw new Error("Contact email delivery failed.");
      }
    },
  };
}

export function isContactProviderConfigured() {
  return getContactMailer() !== null;
}
