const { query } = require("../database/db");

function mapFamilyMember(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    ownerUserId: row.owner_user_id,
    linkedUserId: row.linked_user_id,
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
    bio: row.bio,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function findAllPaginated({ limit, offset }) {
  const result = await query(
    `SELECT id, owner_user_id, linked_user_id, title, full_name, mobile, birth_date, gender,
            job_title, branch, education, is_alive, mother_name, wife_name, photo_url, bio,
            created_at, updated_at
     FROM family_members
     ORDER BY full_name ASC
     LIMIT $1 OFFSET $2`,
    [limit, offset],
  );

  return result.rows.map(mapFamilyMember);
}

async function countAll() {
  const result = await query("SELECT COUNT(*)::int AS total FROM family_members");
  return result.rows[0]?.total || 0;
}

async function findById(id) {
  const result = await query(
    `SELECT id, owner_user_id, linked_user_id, title, full_name, mobile, birth_date, gender,
            job_title, branch, education, is_alive, mother_name, wife_name, photo_url, bio,
            created_at, updated_at
     FROM family_members
     WHERE id = $1`,
    [id],
  );

  return mapFamilyMember(result.rows[0]);
}

async function findDirectParent(memberId) {
  const result = await query(
    `SELECT fm.id, fm.owner_user_id, fm.linked_user_id, fm.title, fm.full_name, fm.mobile, fm.birth_date,
            fm.gender, fm.job_title, fm.branch, fm.education, fm.is_alive, fm.mother_name, fm.wife_name,
            fm.photo_url, fm.bio, fm.created_at, fm.updated_at
     FROM family_relations fr
     JOIN family_members fm ON fm.id = fr.related_family_member_id
     WHERE fr.family_member_id = $1
       AND LOWER(fr.relation_type) IN ('parent', 'father', 'mother')
     LIMIT 1`,
    [memberId],
  );

  return mapFamilyMember(result.rows[0]);
}

async function findChildren(memberId) {
  const result = await query(
    `SELECT fm.id, fm.owner_user_id, fm.linked_user_id, fm.title, fm.full_name, fm.mobile, fm.birth_date,
            fm.gender, fm.job_title, fm.branch, fm.education, fm.is_alive, fm.mother_name, fm.wife_name,
            fm.photo_url, fm.bio, fm.created_at, fm.updated_at, fr.relation_type
     FROM family_relations fr
     JOIN family_members fm ON fm.id = fr.related_family_member_id
     WHERE fr.family_member_id = $1
       AND LOWER(fr.relation_type) IN ('child', 'son', 'daughter')
     ORDER BY fm.full_name ASC`,
    [memberId],
  );

  return result.rows.map((row) => ({
    relatedFullName: row.full_name,
    relationType: row.relation_type,
    photoUrl: row.photo_url,
  }));
}

async function findRelations(memberId) {
  const result = await query(
    `SELECT fm.full_name, fr.relation_type
     FROM family_relations fr
     JOIN family_members fm ON fm.id = fr.related_family_member_id
     WHERE fr.family_member_id = $1
     ORDER BY fm.full_name ASC`,
    [memberId],
  );

  return result.rows.map((row) => ({
    relatedFullName: row.full_name,
    relationType: row.relation_type,
  }));
}

module.exports = {
  findAllPaginated,
  countAll,
  findById,
  findDirectParent,
  findChildren,
  findRelations,
};
