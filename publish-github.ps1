param(
  [string]$RepoName = "agent-evidence-studio-mimo",
  [string]$Visibility = "public"
)

$ErrorActionPreference = "Stop"

$repoRoot = if ($PSScriptRoot) { $PSScriptRoot } else { Split-Path -Parent $MyInvocation.MyCommand.Path }
Push-Location $repoRoot

try {
  Write-Host "Using repository directory: $repoRoot"
  Write-Host "Checking GitHub CLI authentication..."
  gh auth status | Out-Null
  if ($LASTEXITCODE -ne 0) {
    throw "GitHub CLI is not authenticated. Run 'gh auth login -h github.com' first."
  }

  git rev-parse --show-toplevel | Out-Null
  if ($LASTEXITCODE -ne 0) {
    throw "The script directory is not a git repository: $repoRoot"
  }

  $remotes = @(git remote 2>$null)
  if ($remotes -contains "origin") {
    $originUrl = git remote get-url origin
    Write-Host "Remote 'origin' already exists: $originUrl"
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
}
finally {
  Pop-Location
}
