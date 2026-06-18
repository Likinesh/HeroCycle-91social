import prisma from "../config/prisma.js";

export async function getAll(req, res) {
  try {
    const categories = await prisma.partCategory.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: "asc" },
    });
    res.json({ success: true, data: categories });
  } catch (err) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
}

export async function create(req, res) {
  try {
    const { name, isRequired, requiredQuantity } = req.body;

    const existing = await prisma.partCategory.findUnique({ where: { name } });
    if (existing) {
      return res
        .status(409)
        .json({
          success: false,
          error: { message: "Category name already exists" },
        });
    }

    const category = await prisma.partCategory.create({
      data: { name, isRequired, requiredQuantity },
    });
    res.status(201).json({ success: true, data: category });
  } catch (err) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
}

export async function update(req, res) {
  try {
    const { id } = req.params;
    const { name, isRequired, requiredQuantity } = req.body;

    const category = await prisma.partCategory.update({
      where: { id },
      data: { name, isRequired, requiredQuantity },
    });
    res.json({ success: true, data: category });
  } catch (err) {
    if (err.code === "P2025") {
      return res
        .status(404)
        .json({ success: false, error: { message: "Category not found" } });
    }
    res.status(500).json({ success: false, error: { message: err.message } });
  }
}

export async function remove(req, res) {
  try {
    const { id } = req.params;

    // Soft delete
    await prisma.partCategory.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    res.json({ success: true, message: "Category deleted successfully" });
  } catch (err) {
    if (err.code === "P2025") {
      return res
        .status(404)
        .json({ success: false, error: { message: "Category not found" } });
    }
    res.status(500).json({ success: false, error: { message: err.message } });
  }
}
