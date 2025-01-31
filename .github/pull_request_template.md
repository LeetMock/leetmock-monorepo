# What are we adding/removing/changing?

<!-- Please add a description of what you are requesting -->
<!-- If feature is complex that contains multiple convex call, backend logics. Go through in high-level, or link to a doc -->

# Checks

Please check these off before promoting the pull request to non-draft status.

- [ ] Make sure you have enough details covered in PR description (or link to a doc).
- [ ] Schema competible to convex prod, or have properly migration scripts setup.
- [ ] Ran `just gen-convex-client` to have latest convex openapi schema.
- [ ] Tested on dev for e2e interview session, and no regression.
- [ ] (if any) Added properly envs to local .env and updated secrets on Vercel, Convex, or fly.io.
- [ ] (if any) Updated doc to include latest envs.
