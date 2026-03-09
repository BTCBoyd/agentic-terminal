#!/usr/bin/env node
/**
 * GitHub Developer Velocity Metrics
 * Tracks commits, PRs, and contributor activity for key agent payment repos
 * 
 * Repos monitored:
 * - coinbase/x402 (EVM agent payments)
 * - lightninglabs/aperture (L402 Lightning)
 * - arkade-os/arkd (Bitcoin L2 settlement)
 * - arkade-os/ts-sdk
 * - arkade-os/skill
 */

import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'fs';
import { resolve } from 'path';
import { execSync } from 'child_process';

const REPOS = [
  { owner: 'coinbase', repo: 'x402', category: 'stablecoin' },
  { owner: 'lightninglabs', repo: 'aperture', category: 'bitcoin' },
  { owner: 'arkade-os', repo: 'arkd', category: 'bitcoin' },
  { owner: 'arkade-os', repo: 'ts-sdk', category: 'bitcoin' },
  { owner: 'arkade-os', repo: 'skill', category: 'bitcoin' }
];

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;

function githubApi(url) {
  const cmd = GITHUB_TOKEN 
    ? `curl -s -H "Authorization: token ${GITHUB_TOKEN}" "${url}"`
    : `curl -s "${url}"`;
  
  try {
    const result = execSync(cmd, { encoding: 'utf-8', timeout: 30000 });
    return JSON.parse(result);
  } catch (err) {
    console.error(`API error: ${err.message}`);
    return null;
  }
}

async function collectRepoMetrics(repoDef) {
  const { owner, repo, category } = repoDef;
  console.log(`\n📊 ${owner}/${repo}...`);
  
  const baseUrl = `https://api.github.com/repos/${owner}/${repo}`;
  const since = new Date();
  since.setDate(since.getDate() - 7); // Last 7 days
  const sinceIso = since.toISOString();
  
  // Get basic repo stats
  const repoInfo = githubApi(baseUrl);
  if (!repoInfo) {
    console.log('  ❌ Failed to fetch repo info');
    return null;
  }
  
  // Get commits in last 7 days
  const commits = githubApi(`${baseUrl}/commits?since=${sinceIso}&per_page=100`);
  const commitCount = Array.isArray(commits) ? commits.length : 0;
  
  // Get recent PRs
  const prs = githubApi(`${baseUrl}/pulls?state=all&sort=updated&direction=desc&per_page=100`);
  const recentPRs = Array.isArray(prs) ? prs.filter(pr => {
    const updated = new Date(pr.updated_at);
    return updated >= since;
  }).length : 0;
  
  // Get contributors (top 10)
  const contributors = githubApi(`${baseUrl}/contributors?per_page=10`);
  const topContributors = Array.isArray(contributors) ? contributors.map(c => ({
    login: c.login,
    contributions: c.contributions
  })) : [];
  
  // Calculate velocity score (commits + PRs * 2 per week)
  const velocityScore = commitCount + (recentPRs * 2);
  
  const metrics = {
    timestamp: new Date().toISOString(),
    owner,
    repo,
    category,
    stars: repoInfo.stargazers_count,
    forks: repoInfo.forks_count,
    open_issues: repoInfo.open_issues_count,
    last_7_days: {
      commits: commitCount,
      pull_requests: recentPRs,
      velocity_score: velocityScore
    },
    top_contributors: topContributors,
    created_at: repoInfo.created_at,
    updated_at: repoInfo.updated_at,
    language: repoInfo.language,
    data_quality: 'api_sourced'
  };
  
  console.log(`  ✅ ${commitCount} commits, ${recentPRs} PRs, velocity: ${velocityScore}`);
  
  return metrics;
}

async function main() {
  console.log('🔍 GitHub Developer Velocity Collection\n');
  console.log(`Date: ${new Date().toISOString().split('T')[0]}`);
  console.log(`Repos: ${REPOS.length}\n`);
  
  const results = {
    timestamp: new Date().toISOString(),
    collection_period: 'last_7_days',
    repos: []
  };
  
  for (const repo of REPOS) {
    const metrics = await collectRepoMetrics(repo);
    if (metrics) {
      results.repos.push(metrics);
    }
  }
  
  // Calculate aggregate metrics
  const totalVelocity = results.repos.reduce((sum, r) => sum + r.last_7_days.velocity_score, 0);
  const totalCommits = results.repos.reduce((sum, r) => sum + r.last_7_days.commits, 0);
  const totalPRs = results.repos.reduce((sum, r) => sum + r.last_7_days.pull_requests, 0);
  
  results.aggregate = {
    total_velocity_score: totalVelocity,
    total_commits_7d: totalCommits,
    total_prs_7d: totalPRs,
    avg_velocity_per_repo: Math.round(totalVelocity / results.repos.length)
  };
  
  // Save results
  const outputDir = resolve(process.env.HOME, '.openclaw/workspace/agentic-terminal-data/github-velocity');
  if (!existsSync(outputDir)) mkdirSync(outputDir, { recursive: true });
  
  const today = new Date().toISOString().split('T')[0];
  writeFileSync(resolve(outputDir, `${today}.json`), JSON.stringify(results, null, 2));
  
  // Update daily data
  const dailyFile = resolve(process.env.HOME, `.openclaw/workspace/agentic-terminal-data/daily/${today}.json`);
  if (existsSync(dailyFile)) {
    const dailyData = JSON.parse(readFileSync(dailyFile, 'utf-8'));
    dailyData.github_velocity = {
      aggregate: results.aggregate,
      by_repo: results.repos.map(r => ({
        repo: `${r.owner}/${r.repo}`,
        velocity: r.last_7_days.velocity_score,
        commits: r.last_7_days.commits,
        prs: r.last_7_days.pull_requests
      })),
      collected_at: results.timestamp
    };
    writeFileSync(dailyFile, JSON.stringify(dailyData, null, 2));
    console.log(`\n💾 Updated daily data`);
  }
  
  console.log('\n📊 Summary:');
  console.log(`  Total velocity: ${totalVelocity}`);
  console.log(`  Total commits (7d): ${totalCommits}`);
  console.log(`  Total PRs (7d): ${totalPRs}`);
  console.log(`  Avg/repo: ${results.aggregate.avg_velocity_per_repo}`);
  
  return results;
}

main().then(() => {
  console.log('\n✅ GitHub velocity collection complete');
  process.exit(0);
}).catch(err => {
  console.error('\n💥 Error:', err);
  process.exit(1);
});
