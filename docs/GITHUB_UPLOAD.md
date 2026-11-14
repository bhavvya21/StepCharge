# Upload StepCharge from Windows

Create an empty GitHub repository named **StepCharge** under your account. Leave README, .gitignore, and license initialization off because this folder already contains the project files.

Open PowerShell and run:

```powershell
cd "C:\Users\user\Documents\ChatGPT\Myndrya\StepCharge"
git init -b main
git config user.name "Bhavvya Mehta"
git config user.email "YOUR_GITHUB_EMAIL"
git add .
git status
git commit -m "Initial StepCharge ESP32 energy harvesting project"
git remote add origin https://github.com/bhavvya21/StepCharge.git
git push -u origin main
```

Replace YOUR_GITHUB_EMAIL with your GitHub email or the exact private noreply address shown in GitHub email settings. Complete GitHub sign-in when prompted. If you choose another repository name, change the URL.

If origin already exists, inspect `git remote -v`, then set the intended destination:

```powershell
git remote set-url origin https://github.com/bhavvya21/StepCharge.git
git push -u origin main
```

Refresh the repository and confirm README, firmware, docs, tools, and tests are present. The Actions tab will show the automated check result. Uploading source does not flash an ESP32 or validate the physical circuit.

For later edits, run `git add .`, create a new commit with a descriptive message, and `git push` from this same folder.
