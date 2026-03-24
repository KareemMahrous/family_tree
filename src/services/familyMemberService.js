const familyMemberRepository = require("../repositories/familyMemberRepository");

function mapMember(member) {
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
  };
}

function mapAncestorNode(member) {
  if (!member) {
    return null;
  }

  return {
    id: member.id,
    title: member.title,
    fullName: member.fullName,
    photo: member.photoUrl,
    isStillLive: member.isStillLive,
    parent: null,
  };
}

function normalizeArabicName(value) {
  if (typeof value !== "string") {
    return "";
  }

  return value
    .replace(/[أإآ]/g, "ا")
    .replace(/\s+/g, " ")
    .trim();
}

function buildParentFullName(fullName) {
  const normalizedName = normalizeArabicName(fullName);
  const match = normalizedName.match(/^[^\s]+?\s+(?:بن|بنت)\s+(.+)$/);

  if (!match) {
    return null;
  }

  return normalizeArabicName(match[1]);
}

function buildMembersByNormalizedName(members) {
  const membersByName = new Map();

  for (const member of members) {
    const normalizedName = normalizeArabicName(member.fullName);

    if (!membersByName.has(normalizedName)) {
      membersByName.set(normalizedName, []);
    }

    membersByName.get(normalizedName).push(member);
  }

  return membersByName;
}

function findParentMember(member, membersByName) {
  const parentFullName = buildParentFullName(member.fullName);

  if (!parentFullName) {
    return null;
  }

  const matchedMembers = membersByName.get(parentFullName) || [];
  return matchedMembers[0] || null;
}

function buildLineage(member, membersByName) {
  const lineage = [];
  const visitedIds = new Set();
  let currentMember = member;

  while (currentMember && !visitedIds.has(currentMember.id)) {
    lineage.push(currentMember);
    visitedIds.add(currentMember.id);
    currentMember = findParentMember(currentMember, membersByName);
  }

  return lineage;
}

function normalizePositiveInteger(value, fallback) {
  const parsedValue = Number.parseInt(value, 10);

  if (Number.isNaN(parsedValue) || parsedValue <= 0) {
    return fallback;
  }

  return parsedValue;
}

async function getFamilyMembersPaginated(queryParams) {
  const pageNumber = normalizePositiveInteger(
    queryParams.pageNumber ?? queryParams.page,
    1,
  );
  const pageSize = normalizePositiveInteger(queryParams.pageSize, 10);
  const search = typeof queryParams.search === "string" ? queryParams.search : "";
  const offset = (pageNumber - 1) * pageSize;

  const [totalItems, members] = await Promise.all([
    familyMemberRepository.countAll(search),
    familyMemberRepository.findAllPaginated({
      limit: pageSize,
      offset,
      search,
    }),
  ]);

  const totalPages = totalItems === 0 ? 0 : Math.ceil(totalItems / pageSize);

  return {
    pageNumber,
    pageSize,
    totalItems,
    totalPages,
    hasNextPage: pageNumber < totalPages,
    hasPrevPage: pageNumber > 1 && totalPages > 0,
    items: members.map(mapMember),
  };
}

async function getFamilyMemberById(id, t) {
  const member = await familyMemberRepository.findById(id);

  if (!member) {
    const error = new Error(t("familyMemberNotFound"));
    error.status = 404;
    throw error;
  }

  return mapMember(member);
}

async function searchBetweenMembers(id1, id2, t) {
  const [member1, member2, allMembers] = await Promise.all([
    familyMemberRepository.findById(id1),
    familyMemberRepository.findById(id2),
    familyMemberRepository.findAll(),
  ]);

  if (!member1 || !member2) {
    const error = new Error(t("familyMemberNotFound"));
    error.status = 404;
    throw error;
  }

  const membersByName = buildMembersByNormalizedName(allMembers);
  const lineage1 = buildLineage(member1, membersByName);
  const lineage2 = buildLineage(member2, membersByName);
  const lineage2ById = new Map(lineage2.map((member, index) => [member.id, index]));

  let commonAncestor = null;
  let member1StopIndex = lineage1.length;
  let member2StopIndex = lineage2.length;

  for (let index = 0; index < lineage1.length; index += 1) {
    const currentMember = lineage1[index];
    const lineage2Index = lineage2ById.get(currentMember.id);

    if (lineage2Index !== undefined) {
      commonAncestor = currentMember;
      member1StopIndex = index;
      member2StopIndex = lineage2Index;
      break;
    }
  }

  return {
    member1: lineage1.slice(0, member1StopIndex).map(mapAncestorNode),
    member2: lineage2.slice(0, member2StopIndex).map(mapAncestorNode),
    commonAncestor: mapAncestorNode(commonAncestor),
  };
}

module.exports = {
  getFamilyMembersPaginated,
  getFamilyMemberById,
  searchBetweenMembers,
};
