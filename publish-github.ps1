param(
  [string]$RepoName = "agent-evidence-studio-mimo",
  [string]$Visibility = "public"
)

$ErrorActionPreference = "Stop"

Write-Host "Checking GitHub CLI authentication..."
gh auth status | Out-Null

$originExists = git remote get-url origin 2>$null
if ($LASTEXITCODE -eq 0 -and $originExists) {
  Write-Host "Remote 'origin' already exists: $originExists"
  Write-Host "Pushing current main branch..."
  git push -u origin main
  exit 0
}

Write-Host "Creating GitHub repository '$RepoName' with visibility '$Visibility'..."
gh repo create $RepoName --$Visibility --source . --remote origin --push

Write-Host ""
Write-Host "Repository created and pushed."
Write-Host "Next recommended steps:"
Write-Host "1. Open the repo on GitHub and confirm Actions are enabled."
Write-Host "2. Wait for the 'Deploy static site to GitHub Pages' workflow to finish."
Write-Host "3. Copy the Pages URL into the repo About area and README placeholders."
