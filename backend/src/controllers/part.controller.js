import prisma from "../config/prisma.js";

export async function getAll(req, res) {
  try {
    const { categoryId } = req.query;
    
    const where = { deletedAt: null };
    if (categoryId) {
      where.categoryId = categoryId;
    }

    const parts = await prisma.part.findMany({
      where,
      include: {
        category: {
          select: { name: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    
    res.json({ success: true, data: parts });
  } catch (err) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
}

export async function create(req, res) {
  try {
    const { categoryId, name, description, currentPrice, isActive } = req.body;

    const existingPart = await prisma.part.findUnique({ where: { name } });
    if (existingPart) {
      return res.status(409).json({ success: false, error: { message: "Part name already exists" } });
    }

    const part = await prisma.part.create({
      data: {
        categoryId,
        name,
        description,
        currentPrice: parseInt(currentPrice, 10), // Ensures it's an Int (paise)
        isActive: isActive !== undefined ? isActive : true,
      },
      include: { category: true }
    });

    res.status(201).json({ success: true, data: part });
  } catch (err) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
}

export async function update(req, res) {
  try {
    const { id } = req.params;
    const { categoryId, name, description, currentPrice, isActive } = req.body;

    const data = {};
    if (categoryId !== undefined) data.categoryId = categoryId;
    if (name !== undefined) data.name = name;
    if (description !== undefined) data.description = description;
    if (currentPrice !== undefined) data.currentPrice = parseInt(currentPrice, 10);
    if (isActive !== undefined) data.isActive = isActive;

    const part = await prisma.part.update({
      where: { id },
      data,
      include: { category: true }
    });

    res.json({ success: true, data: part });
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).json({ success: false, error: { message: "Part not found" } });
    }
    if (err.code === "P2002") {
      return res.status(409).json({ success: false, error: { message: "Part name already exists" } });
    }
    res.status(500).json({ success: false, error: { message: err.message } });
  }
}

export async function remove(req, res) {
  try {
    const { id } = req.params;
    
    // Soft delete
    await prisma.part.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    
    res.json({ success: true, message: "Part deleted successfully" });
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).json({ success: false, error: { message: "Part not found" } });
    }
    res.status(500).json({ success: false, error: { message: err.message } });
  }
}
