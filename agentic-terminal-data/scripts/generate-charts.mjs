#!/usr/bin/env node
/**
 * Agentic Terminal - Chart Generation System
 * 
 * Generates chart images using QuickChart.io API
 * - 1200×675px PNGs optimized for X/Twitter and Substack headers
 * - Saves to /agentic-terminal-data/charts/YYYY-MM-DD/
 * - Includes metadata JSON with each image
 * 
 * Usage: node generate-charts.mjs [--date=YYYY-MM-DD]
 */

import { readFile, writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import https from 'https';
import path from 'path';

const CONFIG = {
  historyFile: '/home/futurebit/.openclaw/workspace/agentic-terminal-data/metrics-history.json',
  chartsBaseDir: '/home/futurebit/.openclaw/workspace/agentic-terminal-data/charts',
  quickchartUrl: 'https://quickchart.io/chart',
  imageWidth: 1200,
  imageHeight: 675,
  colors: {
    bitcoin: '#f59e0b',      // amber
    stablecoin: '#34d399',   // green  
    emerging: '#a78bfa',     // purple
    grid: '#374151',         // gray-700
    text: '#e5e7eb',         // gray-200
    background: '#111827'    // gray-900
  }
};

/**
 * Logger utility
 */
function log(level, message, data = null) {
  const timestamp = new Date().toISOString();
  const logLine = `[ChartGen] [${timestamp}] [${level}] ${message}`;
  console.log(logLine);
  if (data) console.log(JSON.stringify(data, null, 2));
}

/**
 * Fetch image from QuickChart.io
 */
async function fetchChartImage(chartConfig, outputPath) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      chart: chartConfig,
      width: CONFIG.imageWidth,
      height: CONFIG.imageHeight,
      backgroundColor: CONFIG.colors.background,
      format: 'png'
    });

    const options = {
      hostname: 'quickchart.io',
      path: '/chart',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      if (res.statusCode === 302 || res.statusCode === 301) {
        // Follow redirect
        const redirectUrl = res.headers.location;
        https.get(redirectUrl, (redirectRes) => {
          const chunks = [];
          redirectRes.on('data', chunk => chunks.push(chunk));
          redirectRes.on('end', async () => {
            const buffer = Buffer.concat(chunks);
            await writeFile(outputPath, buffer);
            resolve(outputPath);
          });
        }).on('error', reject);
      } else {
        const chunks = [];
        res.on('data', chunk => chunks.push(chunk));
        res.on('end', async () => {
          const buffer = Buffer.concat(chunks);
          await writeFile(outputPath, buffer);
          resolve(outputPath);
        });
      }
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

/**
 * Read metrics history
 */
async function readMetricsHistory() {
  try {
    const content = await readFile(CONFIG.historyFile, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    log('ERROR', 'Failed to read metrics history', error.message);
    throw error;
  }
}

/**
 * Normalize values for comparison (0-100 scale)
 */
function normalizeTo100(values) {
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min;
  if (range === 0) return values.map(() => 50);
  return values.map(v => ((v - min) / range) * 100);
}

/**
 * Calculate week-over-week growth rates
 */
function calculateGrowthRates(values) {
  const rates = [null]; // First week has no previous
  for (let i = 1; i < values.length; i++) {
    if (values[i - 1] === 0) {
      rates.push(null);
    } else {
      rates.push(((values[i] - values[i - 1]) / values[i - 1]) * 100);
    }
  }
  return rates;
}

/**
 * Generate Cross-Protocol Normalized Growth Comparison Chart
 */
async function generateCrossProtocolChart(weeks, outputDir, date) {
  log('INFO', 'Generating Cross-Protocol Normalized Growth Comparison chart');
  
  // Extract data for each protocol
  const l402Stars = weeks.map(w => w.metrics.bitcoin_lightning.l402_github_stars);
  const x402Stars = weeks.map(w => w.metrics.stablecoin_api_rails.x402_github_stars);
  const lnNodes = weeks.map(w => w.metrics.bitcoin_lightning.lightning_nodes);
  const arkStars = weeks.map(w => w.metrics.emerging_protocols.ark_github_stars);
  
  // Normalize all to 0-100 scale for comparison
  const l402Normalized = normalizeTo100(l402Stars);
  const x402Normalized = normalizeTo100(x402Stars);
  const lnNormalized = normalizeTo100(lnNodes);
  const arkNormalized = normalizeTo100(arkStars);
  
  const labels = weeks.map(w => {
    const date = new Date(w.week_start);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  });
  
  const chartConfig = {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'L402 Interest (GitHub Stars)',
          data: l402Normalized,
          borderColor: CONFIG.colors.bitcoin,
          backgroundColor: CONFIG.colors.bitcoin + '20',
          borderWidth: 3,
          pointRadius: 5,
          pointBackgroundColor: CONFIG.colors.bitcoin,
          tension: 0.4
        },
        {
          label: 'x402 Ecosystem (Stars)',
          data: x402Normalized,
          borderColor: CONFIG.colors.stablecoin,
          backgroundColor: CONFIG.colors.stablecoin + '20',
          borderWidth: 3,
          pointRadius: 5,
          pointBackgroundColor: CONFIG.colors.stablecoin,
          tension: 0.4
        },
        {
          label: 'Lightning Infrastructure (Nodes)',
          data: lnNormalized,
          borderColor: '#60a5fa',
          backgroundColor: '#60a5fa20',
          borderWidth: 3,
          pointRadius: 5,
          pointBackgroundColor: '#60a5fa',
          tension: 0.4
        },
        {
          label: 'Ark Protocol (Stars)',
          data: arkNormalized,
          borderColor: CONFIG.colors.emerging,
          backgroundColor: CONFIG.colors.emerging + '20',
          borderWidth: 3,
          pointRadius: 5,
          pointBackgroundColor: CONFIG.colors.emerging,
          tension: 0.4
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: 'Cross-Protocol Normalized Growth Comparison',
          color: CONFIG.colors.text,
          font: { size: 20, weight: 'bold' }
        },
        legend: {
          labels: { color: CONFIG.colors.text, font: { size: 12 } }
        }
      },
      scales: {
        x: {
          grid: { color: CONFIG.colors.grid },
          ticks: { color: CONFIG.colors.text }
        },
        y: {
          grid: { color: CONFIG.colors.grid },
          ticks: { color: CONFIG.colors.text },
          title: {
            display: true,
            text: 'Normalized Growth (0-100)',
            color: CONFIG.colors.text
          }
        }
      }
    }
  };
  
  const outputPath = path.join(outputDir, 'cross-protocol-comparison.png');
  await fetchChartImage(chartConfig, outputPath);
  
  const metadata = {
    chart_type: 'cross-protocol-comparison',
    title: 'Cross-Protocol Normalized Growth Comparison',
    generated_at: new Date().toISOString(),
    date_range: { start: weeks[0].week_start, end: weeks[weeks.length - 1].week_end },
    metrics: {
      l402_stars: { raw: l402Stars, normalized: l402Normalized },
      x402_stars: { raw: x402Stars, normalized: x402Normalized },
      lightning_nodes: { raw: lnNodes, normalized: lnNormalized },
      ark_stars: { raw: arkStars, normalized: arkNormalized }
    },
    image_path: outputPath,
    dimensions: { width: CONFIG.imageWidth, height: CONFIG.imageHeight }
  };
  
  await writeFile(
    path.join(outputDir, 'cross-protocol-comparison.json'),
    JSON.stringify(metadata, null, 2)
  );
  
  log('SUCCESS', `Generated cross-protocol chart: ${outputPath}`);
  return metadata;
}

/**
 * Generate Interest-to-Usage Gap Chart
 */
async function generateInterestUsageGapChart(weeks, outputDir, date) {
  log('INFO', 'Generating Interest-to-Usage Gap chart');
  
  const labels = weeks.map(w => {
    const date = new Date(w.week_start);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  });
  
  // Interest: L402 GitHub stars (developer interest signal)
  const l402Stars = weeks.map(w => w.metrics.bitcoin_lightning.l402_github_stars);
  
  // Usage proxies: ERC-8004 agents (registered agents)
  const erc8004Agents = weeks.map(w => w.metrics.stablecoin_api_rails.erc8004_agents_registered);
  
  // Normalize both to same scale for gap visualization
  const maxStars = Math.max(...l402Stars);
  const maxAgents = Math.max(...erc8004Agents);
  
  const normalizedStars = l402Stars.map(v => (v / maxStars) * 100);
  const normalizedAgents = erc8004Agents.map(v => (v / maxAgents) * 100);
  
  // Calculate the gap
  const gap = normalizedStars.map((stars, i) => stars - normalizedAgents[i]);
  
  const chartConfig = {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: 'Developer Interest (L402 Stars)',
          data: normalizedStars,
          backgroundColor: CONFIG.colors.bitcoin,
          borderColor: CONFIG.colors.bitcoin,
          borderWidth: 2
        },
        {
          label: 'Live Deployments (ERC-8004 Agents)',
          data: normalizedAgents,
          backgroundColor: CONFIG.colors.stablecoin,
          borderColor: CONFIG.colors.stablecoin,
          borderWidth: 2
        },
        {
          label: 'Interest-Usage Gap',
          data: gap,
          type: 'line',
          borderColor: '#ef4444',
          backgroundColor: '#ef444420',
          borderWidth: 3,
          pointRadius: 4,
          tension: 0.4
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: 'Interest ↔ Usage Gap: Developer Interest vs Live Deployments',
          color: CONFIG.colors.text,
          font: { size: 20, weight: 'bold' }
        },
        legend: {
          labels: { color: CONFIG.colors.text, font: { size: 12 } }
        }
      },
      scales: {
        x: {
          grid: { color: CONFIG.colors.grid },
          ticks: { color: CONFIG.colors.text }
        },
        y: {
          grid: { color: CONFIG.colors.grid },
          ticks: { color: CONFIG.colors.text },
          title: {
            display: true,
            text: 'Normalized Index (0-100)',
            color: CONFIG.colors.text
          }
        }
      }
    }
  };
  
  const outputPath = path.join(outputDir, 'interest-usage-gap.png');
  await fetchChartImage(chartConfig, outputPath);
  
  const metadata = {
    chart_type: 'interest-usage-gap',
    title: 'Interest ↔ Usage Gap',
    generated_at: new Date().toISOString(),
    date_range: { start: weeks[0].week_start, end: weeks[weeks.length - 1].week_end },
    metrics: {
      l402_stars: l402Stars,
      erc8004_agents: erc8004Agents,
      gap_values: gap
    },
    image_path: outputPath,
    dimensions: { width: CONFIG.imageWidth, height: CONFIG.imageHeight }
  };
  
  await writeFile(
    path.join(outputDir, 'interest-usage-gap.json'),
    JSON.stringify(metadata, null, 2)
  );
  
  log('SUCCESS', `Generated interest-usage gap chart: ${outputPath}`);
  return metadata;
}

/**
 * Generate individual metric sparkline
 */
async function generateSparkline(weeks, metricPath, label, color, outputDir, date) {
  log('INFO', `Generating sparkline for ${metricPath}`);
  
  // Extract values from nested path
  const pathParts = metricPath.split('.');
  const values = weeks.map(w => {
    let val = w;
    for (const part of pathParts) {
      val = val?.[part];
    }
    return val;
  });
  
  const labels = weeks.map(w => {
    const date = new Date(w.week_start);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  });
  
  const currentValue = values[values.length - 1];
  const previousValue = values[values.length - 2];
  const change = previousValue ? ((currentValue - previousValue) / previousValue * 100).toFixed(1) : 0;
  const direction = change > 0 ? '↑' : change < 0 ? '↓' : '→';
  
  const chartConfig = {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label,
        data: values,
        borderColor: color,
        backgroundColor: color + '30',
        borderWidth: 3,
        pointRadius: 0,
        pointHoverRadius: 4,
        fill: true,
        tension: 0.4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        title: { display: false }
      },
      scales: {
        x: { display: false },
        y: { display: false }
      },
      layout: {
        padding: 10
      }
    }
  };
  
  const safeName = metricPath.replace(/\./g, '-');
  const outputPath = path.join(outputDir, `sparkline-${safeName}.png`);
  await fetchChartImage(chartConfig, outputPath);
  
  const metadata = {
    chart_type: 'sparkline',
    metric_path: metricPath,
    label,
    generated_at: new Date().toISOString(),
    date_range: { start: weeks[0].week_start, end: weeks[weeks.length - 1].week_end },
    values,
    current_value: currentValue,
    previous_value: previousValue,
    change_percent: parseFloat(change),
    change_direction: direction,
    image_path: outputPath,
    dimensions: { width: CONFIG.imageWidth, height: CONFIG.imageHeight }
  };
  
  await writeFile(
    path.join(outputDir, `sparkline-${safeName}.json`),
    JSON.stringify(metadata, null, 2)
  );
  
  log('SUCCESS', `Generated sparkline: ${outputPath}`);
  return metadata;
}

/**
 * Generate all sparklines for overview cards
 */
async function generateAllSparklines(weeks, outputDir, date) {
  const sparklines = [];
  
  // Bitcoin/Lightning metrics
  sparklines.push(await generateSparkline(
    weeks,
    'metrics.bitcoin_lightning.l402_github_stars',
    'L402 GitHub Stars',
    CONFIG.colors.bitcoin,
    outputDir,
    date
  ));
  
  sparklines.push(await generateSparkline(
    weeks,
    'metrics.bitcoin_lightning.lightning_nodes',
    'Lightning Nodes',
    '#60a5fa',
    outputDir,
    date
  ));
  
  sparklines.push(await generateSparkline(
    weeks,
    'metrics.bitcoin_lightning.lightning_capacity_btc',
    'Lightning Capacity (BTC)',
    CONFIG.colors.bitcoin,
    outputDir,
    date
  ));
  
  // Stablecoin/x402 metrics
  sparklines.push(await generateSparkline(
    weeks,
    'metrics.stablecoin_api_rails.x402_github_stars',
    'x402 GitHub Stars',
    CONFIG.colors.stablecoin,
    outputDir,
    date
  ));

  sparklines.push(await generateSparkline(
    weeks,
    'metrics.stablecoin_api_rails.x402_daily_transactions',
    'x402 Daily Transactions',
    CONFIG.colors.stablecoin,
    outputDir,
    date
  ));
  
  sparklines.push(await generateSparkline(
    weeks,
    'metrics.stablecoin_api_rails.erc8004_agents_registered',
    'ERC-8004 Agents',
    CONFIG.colors.stablecoin,
    outputDir,
    date
  ));
  
  // Emerging protocols
  sparklines.push(await generateSparkline(
    weeks,
    'metrics.emerging_protocols.ark_github_stars',
    'Ark GitHub Stars',
    CONFIG.colors.emerging,
    outputDir,
    date
  ));
  
  return sparklines;
}

/**
 * Main execution
 */
async function main() {
  log('INFO', '=== Agentic Terminal Chart Generation Starting ===');
  
  try {
    // Parse command line args
    const dateArg = process.argv.find(arg => arg.startsWith('--date='));
    const date = dateArg ? dateArg.split('=')[1] : new Date().toISOString().split('T')[0];
    
    // Create output directory
    const outputDir = path.join(CONFIG.chartsBaseDir, date);
    if (!existsSync(outputDir)) {
      await mkdir(outputDir, { recursive: true });
      log('INFO', `Created directory: ${outputDir}`);
    }
    
    // Read metrics history
    const history = await readMetricsHistory();
    const weeks = history.weeks.sort((a, b) => new Date(a.week_start) - new Date(b.week_start));
    
    if (weeks.length < 2) {
      throw new Error('Need at least 2 weeks of data for meaningful charts');
    }
    
    log('INFO', `Generating charts from ${weeks.length} weeks of data`);
    
    // Generate main charts
    const crossProtocolChart = await generateCrossProtocolChart(weeks, outputDir, date);
    const interestGapChart = await generateInterestUsageGapChart(weeks, outputDir, date);
    
    // Generate sparklines
    const sparklines = await generateAllSparklines(weeks, outputDir, date);
    
    // Generate index file
    const index = {
      generated_at: new Date().toISOString(),
      date,
      charts: {
        cross_protocol_comparison: crossProtocolChart,
        interest_usage_gap: interestGapChart,
        sparklines: sparklines.reduce((acc, s) => {
          acc[s.metric_path] = s;
          return acc;
        }, {})
      },
      total_charts: 2 + sparklines.length,
      output_directory: outputDir
    };
    
    await writeFile(
      path.join(outputDir, 'index.json'),
      JSON.stringify(index, null, 2)
    );
    
    log('SUCCESS', `=== Chart Generation Complete ===`);
    log('INFO', `Generated ${index.total_charts} charts in ${outputDir}`);
    
    // Output summary for integration
    console.log('\n📊 CHART GENERATION SUMMARY');
    console.log(`Date: ${date}`);
    console.log(`Location: ${outputDir}`);
    console.log(`Main Charts: 2`);
    console.log(`Sparklines: ${sparklines.length}`);
    console.log(`\nKey Files:`);
    console.log(`  - cross-protocol-comparison.png`);
    console.log(`  - interest-usage-gap.png`);
    console.log(`  - sparkline-*.png (6 files)`);
    
    return index;
    
  } catch (error) {
    log('ERROR', 'Chart generation failed', error.message);
    console.error(error);
    process.exit(1);
  }
}

// Run main
main();
