import prisma from "../config/prisma.js";

// Helper function to calculate total price on the fly
function calculateTotalPrice(config) {
  let total = config.basePrice || 0;
  if (config.parts && Array.isArray(config.parts)) {
    for (const cp of config.parts) {
      if (cp.part && cp.part.currentPrice) {
        total += cp.part.currentPrice * cp.quantity;
      }
    }
  }
  return total;
}

export async function getAll(req, res) {
  try {
    const configurations = await prisma.configuration.findMany({
      where: { deletedAt: null },
      include: {
        creator: { select: { name: true } },
        parts: {
          include: {
            part: {
              include: { category: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const data = configurations.map(config => ({
      ...config,
      totalPrice: calculateTotalPrice(config),
    }));

    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
}

export async function getById(req, res) {
  try {
    const { id } = req.params;
    const config = await prisma.configuration.findUnique({
      where: { id },
      include: {
        creator: { select: { name: true } },
        parts: {
          include: {
            part: {
              include: { category: true },
            },
          },
        },
      },
    });

    if (!config || config.deletedAt) {
      return res.status(404).json({ success: false, error: { message: "Configuration not found" } });
    }

    const data = {
      ...config,
      totalPrice: calculateTotalPrice(config),
    };

    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
}

// Helper to validate parts against required categories
async function validateParts(partsInput) {
  const categories = await prisma.partCategory.findMany({
    where: { isRequired: true }
  });

  const partIds = partsInput.map(p => p.partId);
  const partsInDb = await prisma.part.findMany({
    where: { id: { in: partIds } },
    include: { category: true },
  });

  // Map how many parts we have for each category
  const categoryCounts = {};
  for (const pInput of partsInput) {
    const dbPart = partsInDb.find(p => p.id === pInput.partId);
    if (!dbPart) throw new Error(`Part ${pInput.partId} not found`);
    
    const catId = dbPart.categoryId;
    categoryCounts[catId] = (categoryCounts[catId] || 0) + pInput.quantity;
  }

  // Check required categories
  for (const cat of categories) {
    const count = categoryCounts[cat.id] || 0;
    if (count < cat.requiredQuantity) {
      throw new Error(`Missing required parts for category: ${cat.name}. Need ${cat.requiredQuantity}, got ${count}.`);
    }
  }
}

export async function create(req, res) {
  try {
    const { name, description, basePrice, parts, isActive } = req.body;

    if (!parts || !Array.isArray(parts) || parts.length === 0) {
      return res.status(400).json({ success: false, error: { message: "Parts array is required" } });
    }

    // Validation
    try {
      await validateParts(parts);
    } catch (valErr) {
      return res.status(400).json({ success: false, error: { message: valErr.message } });
    }

    const config = await prisma.$transaction(async (tx) => {
      const created = await tx.configuration.create({
        data: {
          name,
          description,
          basePrice: parseInt(basePrice || 0, 10),
          isActive: isActive !== undefined ? isActive : true,
          createdBy: req.user.id,
          parts: {
            create: parts.map(p => ({
              partId: p.partId,
              quantity: parseInt(p.quantity, 10),
            })),
          },
        },
        include: {
          parts: { include: { part: true } }
        }
      });
      return created;
    });

    res.status(201).json({ success: true, data: { ...config, totalPrice: calculateTotalPrice(config) } });
  } catch (err) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
}

export async function update(req, res) {
  try {
    const { id } = req.params;
    const { name, description, basePrice, parts, isActive } = req.body;

    const existing = await prisma.configuration.findUnique({ where: { id } });
    if (!existing || existing.deletedAt) {
      return res.status(404).json({ success: false, error: { message: "Configuration not found" } });
    }

    if (parts && Array.isArray(parts)) {
      try {
        await validateParts(parts);
      } catch (valErr) {
        return res.status(400).json({ success: false, error: { message: valErr.message } });
      }
    }

    const config = await prisma.$transaction(async (tx) => {
      const data = {};
      if (name !== undefined) data.name = name;
      if (description !== undefined) data.description = description;
      if (basePrice !== undefined) data.basePrice = parseInt(basePrice, 10);
      if (isActive !== undefined) data.isActive = isActive;

      if (parts && Array.isArray(parts)) {
        // Delete old parts and recreate
        await tx.configurationPart.deleteMany({ where: { configurationId: id } });
        data.parts = {
          create: parts.map(p => ({
            partId: p.partId,
            quantity: parseInt(p.quantity, 10),
          })),
        };
      }

      const updated = await tx.configuration.update({
        where: { id },
        data,
        include: { parts: { include: { part: true } } }
      });
      return updated;
    });

    res.json({ success: true, data: { ...config, totalPrice: calculateTotalPrice(config) } });
  } catch (err) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
}

export async function remove(req, res) {
  try {
    const { id } = req.params;
    await prisma.configuration.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    res.json({ success: true, message: "Configuration deleted successfully" });
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).json({ success: false, error: { message: "Configuration not found" } });
    }
    res.status(500).json({ success: false, error: { message: err.message } });
  }
}
