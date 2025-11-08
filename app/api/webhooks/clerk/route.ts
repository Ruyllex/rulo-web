// app/api/webhooks/clerk/route.ts
import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
  if (!WEBHOOK_SECRET) throw new Error("Missing CLERK_WEBHOOK_SECRET");

  const headerPayload = headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  const body = await req.text();
  const wh = new Webhook(WEBHOOK_SECRET);
  
  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id!,
      "svix-timestamp": svix_timestamp!,
      "svix-signature": svix_signature!,
    }) as WebhookEvent;
  } catch (err) {
    return new Response("Error", { status: 400 });
  }

  if (evt.type === "user.created" || evt.type === "user.updated") {
    await db.user.upsert({
      where: { externalUserId: evt.data.id },
      update: {
        username: evt.data.username || evt.data.email_addresses[0].email_address.split("@")[0],
        imageUrl: evt.data.image_url,
      },
      create: {
        externalUserId: evt.data.id,
        username: evt.data.username || evt.data.email_addresses[0].email_address.split("@")[0],
        imageUrl: evt.data.image_url,
        isStreamer: false,
      },
    });
  }

  if (evt.type === "user.deleted") {
    await db.user.delete({
      where: { externalUserId: evt.data.id },
    });
  }

  return new Response("", { status: 200 });
}