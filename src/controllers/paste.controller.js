import { prisma } from "../lib/prisma.js";
import { generateId } from "../lib/id.js";

function getCurrentTime(req) {
  if (process.env.TEST_MODE === "1") {
    const testNowMs = parseInt(req.headers["x-test-now-ms"], 10);
    if (!isNaN(testNowMs)) {
      return new Date(testNowMs);
    }
  }
  return new Date();
}

export const createPaste = async (req, res) => {
  try {
    const { content, ttl_seconds, max_views } = req.body;

    if (!content || typeof content !== "string" || content.trim() === "") {
      return res
        .status(400)
        .json({ error: "Content is required and must be non-empty" });
    }

    let expiresAtDate = null;
    if (ttl_seconds !== undefined) {
      if (!Number.isInteger(ttl_seconds) || ttl_seconds < 1) {
        return res
          .status(400)
          .json({ error: "ttl_seconds must be an integer >= 1" });
      }
      const now = getCurrentTime(req);
      expiresAtDate = new Date(now.getTime() + ttl_seconds * 1000);
    }

    if (
      max_views !== undefined &&
      (!Number.isInteger(max_views) || max_views < 1)
    ) {
      return res
        .status(400)
        .json({ error: "max_views must be an integer >= 1" });
    }

    const id = generateId();

    await prisma.paste.create({
      data: {
        id,
        content,
        expiresAt: expiresAtDate,
        maxViews: max_views,
      },
    });

    const url = `${req.protocol}://${req.get("host")}/p/${id}`;

    return res.json({ id, url });
  } catch (error) {
    console.error("Error creating paste:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getPaste = async (req, res) => {
  try {
    const { id } = req.params;

    const paste = await prisma.paste.findUnique({
      where: { id },
    });

    if (!paste) {
      return res.status(404).json({ error: "Paste not found" });
    }

    const now = getCurrentTime(req);
    const expired =
      (paste.expiresAt && now > paste.expiresAt) ||
      (paste.maxViews && paste.viewCount >= paste.maxViews);

    if (expired) {
      return res.status(404).json({ error: "Paste not found" });
    }

    await prisma.paste.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });

    const remaining_views = paste.maxViews
      ? paste.maxViews - paste.viewCount - 1
      : null;
    const expires_at = paste.expiresAt ? paste.expiresAt.toISOString() : null;

    return res.json({ content: paste.content, remaining_views, expires_at });
  } catch (error) {
    console.error("Error retrieving paste:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const viewPaste = async (req, res) => {
  try {
    const { id } = req.params;

    const paste = await prisma.paste.findUnique({
      where: { id },
    });

    if (!paste) {
      return res.status(404).send("<h1>Paste not found</h1>");
    }

    const now = getCurrentTime(req);
    const expired =
      (paste.expiresAt && now > paste.expiresAt) ||
      (paste.maxViews && paste.viewCount >= paste.maxViews);

    if (expired) {
      return res.status(404).send("<h1>Paste not found</h1>");
    }

    await prisma.paste.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });

    const escapedContent = paste.content
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#x27;");
    const html = `<html><head><title>Paste</title></head><body><pre>${escapedContent}</pre></body></html>`;

    res.setHeader("Content-Type", "text/html");
    return res.send(html);
  } catch (error) {
    console.error("Error retrieving paste:", error);
  }
};

export const healthCheck = async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return res.json({ ok: true });
  } catch (error) {
    console.error("Database connectivity check failed:", error);
    return res.status(500).json({ ok: false });
  }
};
