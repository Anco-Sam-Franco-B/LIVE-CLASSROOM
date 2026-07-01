const pool = require("../config/db");
const AppError = require("../utils/AppError");

const getCmsPages = async (req, res, next) => {
  try {
    const result = await pool.query("SELECT * FROM cms_pages ORDER BY page, section");
    const grouped = {};
    result.rows.forEach(row => {
      if (!grouped[row.page]) grouped[row.page] = {};
      grouped[row.page][row.section] = { ...row.content, id: row.id, is_active: row.is_active };
    });
    res.json({ success: true, data: grouped });
  } catch (error) { next(error); }
};

const getCmsPage = async (req, res, next) => {
  try {
    const { page } = req.params;
    const result = await pool.query("SELECT * FROM cms_pages WHERE page = $1 ORDER BY section", [page]);
    const sections = {};
    result.rows.forEach(row => {
      sections[row.section] = { ...row.content, id: row.id, is_active: row.is_active };
    });
    res.json({ success: true, data: sections });
  } catch (error) { next(error); }
};

const updateCmsSection = async (req, res, next) => {
  try {
    const { page, section } = req.params;
    const { content } = req.body;
    const result = await pool.query(
      `INSERT INTO cms_pages (page, section, content, updated_by)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (page, section)
       DO UPDATE SET content = $3, updated_by = $4, updated_at = NOW()
       RETURNING *`,
      [page, section, JSON.stringify(content), req.userId]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (error) { next(error); }
};

const toggleCmsSection = async (req, res, next) => {
  try {
    const { page, section } = req.params;
    const result = await pool.query(
      `UPDATE cms_pages SET is_active = NOT is_active, updated_at = NOW(), updated_by = $1
       WHERE page = $2 AND section = $3 RETURNING *`,
      [req.userId, page, section]
    );
    if (result.rows.length === 0) throw new AppError("Section not found", 404);
    res.json({ success: true, data: result.rows[0] });
  } catch (error) { next(error); }
};

const resetCmsSection = async (req, res, next) => {
  try {
    const { page, section } = req.params;
    const result = await pool.query(
      "DELETE FROM cms_pages WHERE page = $1 AND section = $2 RETURNING id",
      [page, section]
    );
    if (result.rows.length === 0) throw new AppError("Section not found", 404);
    res.json({ success: true, message: "Section reset to defaults" });
  } catch (error) { next(error); }
};

const getPublicCmsContent = async (req, res, next) => {
  try {
    const { page } = req.params;
    const result = await pool.query(
      "SELECT * FROM cms_pages WHERE page = $1 AND is_active = true ORDER BY section",
      [page]
    );
    const sections = {};
    result.rows.forEach(row => {
      sections[row.section] = row.content;
    });
    res.json({ success: true, data: sections });
  } catch (error) { next(error); }
};

module.exports = {
  getCmsPages, getCmsPage, updateCmsSection,
  toggleCmsSection, resetCmsSection, getPublicCmsContent,
};
