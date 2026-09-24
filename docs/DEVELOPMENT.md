# Development workflow

1. Create a `feature/*` or `fix/*` branch from `develop`.
2. Make a focused change with tests.
3. Run affected checks locally and in GitHub Actions.
4. Open a pull request into `develop`.
5. Obtain human review; critical paths require designated safety review.
6. Promote reviewed pilot candidates from `develop` to protected `main`.

Before enabling branch protection, configure real GitHub users/teams in
`.github/CODEOWNERS`. Placeholder owners are intentionally not included.
