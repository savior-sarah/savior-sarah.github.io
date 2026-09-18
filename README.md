# My Academic Profile

Static academic profile for `https://savior-sarah.github.io`.

## Preview locally

```powershell
python -m http.server 4173
```

Open `http://localhost:4173`.

## Run checks

```powershell
npm test
```

## Publish with GitHub Pages

1. Create the GitHub repository `savior-sarah/savior-sarah.github.io`.
2. Add it as this repository's `origin` and publish the prepared public branch with
   `git push origin codex/resume-site-public:main`.
3. In GitHub, open **Settings → Pages**.
4. Choose **Deploy from a branch**, select `main`, and select `/(root)`.
5. Visit `https://savior-sarah.github.io` after deployment finishes.

The public site is framework-free and has no runtime dependencies.

Only `codex/resume-site-public` is intended for publication. It starts with one
root commit containing the approved site files and public assets. Keep the local
development branches and source materials private; do not push all branches or
tags. Run the checks on the public branch before publishing.
