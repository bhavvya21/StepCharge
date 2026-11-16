# Maintaining StepCharge on GitHub

Repository: [bhavvya21/StepCharge](https://github.com/bhavvya21/StepCharge).

## Get the source

```sh
git clone https://github.com/bhavvya21/StepCharge.git
cd StepCharge
```

Open `app/StepCharge.html` directly. See [APP.md](APP.md) for usage and data provenance.

## Prepare an update

```sh
git pull --ff-only
node app/build-standalone.mjs
node --test tests/telemetry.test.mjs tests/standalone.test.mjs
python -m unittest discover -s tests -v
git diff --check
git status --short
```

Commit app source and generated HTML together. Screenshots live in `docs/screenshots/`. Do not commit private captures, credentials, local server logs or temporary archives.

## Commit and upload

After reviewing changes and configuring your Git identity:

```sh
git add README.md app docs examples tests .github/workflows
git commit -m "Update StepCharge dashboard and documentation"
git push origin main
```

Authenticate through your installed Git credential manager if prompted. If direct pushes are restricted, use a feature branch and pull request. Do not force-push over others' work.

Check GitHub Actions after uploading. Pushing source does not publish a hosted website, flash a device or validate hardware. Download the HTML app to run it; GitHub's source viewer does not execute it.
