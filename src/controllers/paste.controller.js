import { prisma } from "../lib/prisma.js";
import { generateId } from "../lib/id.js";

export const createPaste = async (req, res) => {
  try {
    const { content, expiresAt, maxViews } = req.body;

    if (!content || typeof content !== "string" || content.trim() === "") {
      return res
        .status(400)
        .json({ error: "Content is required and must be non-empty" });
    }

    if (Buffer.byteLength(content, "utf8") > 10240) {
      return res.status(400).json({ error: "Content exceeds 10KB limit" });
    }

    let expiresAtDate = null;
    if (expiresAt) {
      expiresAtDate = new Date(expiresAt);
      if (isNaN(expiresAtDate.getTime())) {
        return res.status(400).json({ error: "Invalid expiresAt timestamp" });
      }
    }

    if (
      maxViews !== undefined &&
      (!Number.isInteger(maxViews) || maxViews < 1)
    ) {
      return res
        .status(400)
        .json({ error: "maxViews must be a positive integer" });
    }

    const id = generateId();

    await prisma.paste.create({
      data: {
        id,
        content,
        expiresAt: expiresAtDate,
        maxViews,
      },
    });

    const url = `${req.protocol}://${req.get("host")}/api/paste/${id}`;

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

    const now = new Date();
    const expired =
      (paste.expiresAt && now > paste.expiresAt) ||
      (paste.maxViews && paste.viewCount >= paste.maxViews);

    if (expired) {
      return res.status(410).json({ error: "Paste expired" });
    }

    await prisma.paste.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });

    return res.json({ content: paste.content });
  } catch (error) {
    console.error("Error retrieving paste:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
