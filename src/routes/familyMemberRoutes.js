const express = require("express");

const familyMemberService = require("../services/familyMemberService");
const { sendSuccess } = require("../utils/response");

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const members = await familyMemberService.getFamilyMembersPaginated(req.query);
    sendSuccess(res, {
      status: 200,
      message: req.t("familyMembersFetchedSuccessfully"),
      data: members,
    });
  } catch (error) {
    next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const member = await familyMemberService.getFamilyMemberById(req.params.id, req.t);
    sendSuccess(res, {
      status: 200,
      message: req.t("familyMemberFetchedSuccessfully"),
      data: member,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
