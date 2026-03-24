const { query } = require("../database/db");

function normalizeArabicSearchText(value) {
  if (typeof value !== "string") {
    return "";
  }

  return value
    .trim()
    .replace(/[أ]/g, "ا")
    .replace(/\s+/g, " ");
}

function mapFamilyMember(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    title: row.title,
    fullName: row.full_name,
    mobile: row.mobile,
    bod: row.birth_date,
    gender: row.gender,
    jobTitle: row.job_title,
    branch: row.branch,
    education: row.education,
    isStillLive: row.is_alive,
    motherName: row.mother_name,
    wifeName: row.wife_name,
    photoUrl: row.photo_url,
  };
}

function normalizeSearchTerm(search) {
  if (typeof search !== "string") {
    return null;
  }

  const trimmedSearch = normalizeArabicSearchText(search);
  return trimmedSearch || null;
}

async function findAllPaginated({ limit, offset, search }) {
  const normalizedSearch = normalizeSearchTerm(search);
  let result;

  if (normalizedSearch) {
    const prefixPattern = `${normalizedSearch}%`;
    const containsPattern = `%${normalizedSearch}%`;

    result = await query(
      `SELECT id, title, full_name, mobile, birth_date, gender,
              job_title, branch, education, is_alive, mother_name, wife_name, photo_url
       FROM family_members
       WHERE REPLACE(REPLACE(REPLACE(LOWER(full_name), 'أ', 'ا'), 'إ', 'ا'), 'آ', 'ا') LIKE LOWER($1)
       ORDER BY
         CASE
           WHEN REPLACE(REPLACE(REPLACE(LOWER(full_name), 'أ', 'ا'), 'إ', 'ا'), 'آ', 'ا') LIKE LOWER($2) THEN 0
           ELSE 1
         END,
         POSITION(
           LOWER($3) IN REPLACE(REPLACE(REPLACE(LOWER(full_name), 'أ', 'ا'), 'إ', 'ا'), 'آ', 'ا')
         ),
         LENGTH(full_name),
         id ASC
       LIMIT $4 OFFSET $5`,
      [containsPattern, prefixPattern, normalizedSearch, limit, offset],
    );
  } else {
    result = await query(
      `SELECT id, title, full_name, mobile, birth_date, gender,
              job_title, branch, education, is_alive, mother_name, wife_name, photo_url
       FROM family_members
       ORDER BY id ASC
       LIMIT $1 OFFSET $2`,
      [limit, offset],
    );
  }

  return result.rows.map(mapFamilyMember);
}

async function countAll(search) {
  const normalizedSearch = normalizeSearchTerm(search);
  let result;

  if (normalizedSearch) {
    result = await query(
      `SELECT COUNT(*)::int AS total
       FROM family_members
       WHERE REPLACE(REPLACE(REPLACE(LOWER(full_name), 'أ', 'ا'), 'إ', 'ا'), 'آ', 'ا') LIKE LOWER($1)`,
      [`%${normalizedSearch}%`],
    );
  } else {
    result = await query("SELECT COUNT(*)::int AS total FROM family_members");
  }

  return result.rows[0]?.total || 0;
}

async function findById(id) {
  const result = await query(
    `SELECT id, title, full_name, mobile, birth_date, gender,
            job_title, branch, education, is_alive, mother_name, wife_name, photo_url
     FROM family_members
     WHERE id = $1`,
    [id],
  );

  return mapFamilyMember(result.rows[0]);
}

async function findAll() {
  const result = await query(
    `SELECT id, title, full_name, mobile, birth_date, gender,
            job_title, branch, education, is_alive, mother_name, wife_name, photo_url
     FROM family_members
     ORDER BY id ASC`,
  );

  return result.rows.map(mapFamilyMember);
}

module.exports = {
  findAll,
  findAllPaginated,
  countAll,
  findById,
};
