const familyMemberRepository = require("../repositories/familyMemberRepository");

function mapParent(parent, nestedParent = null) {
  if (!parent) {
    return null;
  }

  return {
    id: parent.id,
    title: parent.title,
    fullName: parent.fullName,
    photo: parent.photoUrl,
    isStillLive: parent.isStillLive,
    parent: nestedParent,
  };
}

function mapMemberSummary(member) {
  return {
    id: member.id,
    title: member.title,
    fullName: member.fullName,
    mobile: member.mobile,
    bod: member.bod,
    gender: member.gender,
    jobTitle: member.jobTitle,
    branch: member.branch,
    education: member.education,
    isStillLive: member.isStillLive,
    motherName: member.motherName,
    wifeName: member.wifeName,
    photoUrl: member.photoUrl,
    bio: member.bio,
    relations: [],
    parent: null,
    childs: [],
  };
}

async function buildParentTree(memberId, depth = 0) {
  if (depth >= 3) {
    return null;
  }

  const parent = await familyMemberRepository.findDirectParent(memberId);

  if (!parent) {
    return null;
  }

  const nestedParent = await buildParentTree(parent.id, depth + 1);
  return mapParent(parent, nestedParent);
}

function normalizePositiveInteger(value, fallback) {
  const parsedValue = Number.parseInt(value, 10);

  if (Number.isNaN(parsedValue) || parsedValue <= 0) {
    return fallback;
  }

  return parsedValue;
}

async function getFamilyMembersPaginated(queryParams) {
  const page = normalizePositiveInteger(queryParams.page, 1);
  const pageSize = normalizePositiveInteger(queryParams.pageSize, 10);
  const safePageSize = Math.min(pageSize, 100);
  const offset = (page - 1) * safePageSize;

  const [totalItems, members] = await Promise.all([
    familyMemberRepository.countAll(),
    familyMemberRepository.findAllPaginated({
      limit: safePageSize,
      offset,
    }),
  ]);

  const totalPages = totalItems === 0 ? 0 : Math.ceil(totalItems / safePageSize);

  return {
    items: members.map(mapMemberSummary),
    page,
    pageSize: safePageSize,
    totalItems,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1 && totalPages > 0,
  };
}

async function getFamilyMemberById(id, t) {
  const member = await familyMemberRepository.findById(id);

  if (!member) {
    const error = new Error(t("familyMemberNotFound"));
    error.status = 404;
    throw error;
  }

  const [relations, parent, childs] = await Promise.all([
    familyMemberRepository.findRelations(id),
    buildParentTree(id),
    familyMemberRepository.findChildren(id),
  ]);

  return {
    id: member.id,
    title: member.title,
    fullName: member.fullName,
    mobile: member.mobile,
    bod: member.bod,
    gender: member.gender,
    jobTitle: member.jobTitle,
    branch: member.branch,
    education: member.education,
    isStillLive: member.isStillLive,
    motherName: member.motherName,
    wifeName: member.wifeName,
    photoUrl: member.photoUrl,
    bio: member.bio,
    relations,
    parent,
    childs,
  };
}

module.exports = {
  getFamilyMembersPaginated,
  getFamilyMemberById,
};
