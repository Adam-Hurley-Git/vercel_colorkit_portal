# Vercel Alternatives - Cost Comparison for ColorKit

**Last Updated:** January 2025
**Purpose:** Reduce hosting costs while maintaining Next.js 15 compatibility

---

## Current Vercel Costs (Baseline)

| Users  | Monthly Cost | Primary Driver              |
| ------ | ------------ | --------------------------- |
| 1,000  | $20          | Base plan                   |
| 1,500  | $67.50       | Compute overages (+9.5 hrs) |
| 2,000  | $150         | Compute overages (+26 hrs)  |
| 5,000  | $645         | Compute overages (+125 hrs) |
| 10,000 | $1,470       | Compute overages (+290 hrs) |

**Problem:** After 1,200 users, costs escalate rapidly due to $5/hour overage charges.

---

## Option 1: Cloudflare Pages + Workers (⭐ RECOMMENDED)

**Best for:** Cost optimization while keeping serverless architecture

### Pricing Structure

- **Free Tier:**
  - 100,000 requests/day (~3M requests/month)
  - Unlimited static bandwidth (HUGE savings!)
  - 500 build minutes/month
  - No credit card required

- **Paid Plan ($5/month minimum):**
  - $0.50 per million requests (including CPU time)
  - Unlimited bandwidth (always free)
  - 1,000 build minutes/month

### Cost Projections for ColorKit

| Users  | Monthly Requests | Cloudflare Cost                | Vercel Cost | **Savings**      |
| ------ | ---------------- | ------------------------------ | ----------- | ---------------- |
| 1,000  | ~800K            | **$0** (Free tier)             | $20         | **$20/month**    |
| 1,500  | ~1.2M            | **$0** (Free tier)             | $67.50      | **$67.50/month** |
| 2,000  | ~1.6M            | **$0** (Free tier)             | $150        | **$150/month**   |
| 5,000  | ~4M              | **$7** ($5 base + $2 overage)  | $645        | **$638/month**   |
| 10,000 | ~8M              | **$9** ($5 base + $4 overage)  | $1,470      | **$1,461/month** |
| 20,000 | ~16M             | **$13** ($5 base + $8 overage) | $3,250      | **$3,237/month** |

### Next.js 15 Support

- ✅ **Full support for App Router**
- ✅ Server-side rendering (SSR) via Workers
- ✅ API Routes → Workers Functions
- ✅ Static optimization (automatic)
- ✅ Edge runtime compatible
- ⚠️ Requires adapter: `@cloudflare/next-on-pages`

### Migration Effort

- **Difficulty:** Medium (2-3 days)
- **Steps:**
  1. Install `@cloudflare/next-on-pages` adapter
  2. Update `next.config.js` for Cloudflare compatibility
  3. Test API routes locally with Wrangler CLI
  4. Deploy via Cloudflare CLI or GitHub integration
  5. Update DNS to point to Cloudflare Pages

### Pros

- ✅ **Massive cost savings** (95%+ reduction at scale)
- ✅ Unlimited bandwidth (always free)
- ✅ Edge network (300+ locations, faster than Vercel)
- ✅ No cold starts (Workers stay warm)
- ✅ Built-in DDoS protection
- ✅ Generous free tier (good for testing)

### Cons

- ❌ Requires code adapter for Next.js
- ❌ Workers runtime limitations (no Node.js built-ins)
- ❌ 30-second max execution time (vs Vercel's 60s)
- ❌ Some Next.js features may need workarounds

### Verdict

**Best choice for cost optimization.** Save $1,461/month at 10,000 users!

---

## Option 2: Railway.app

**Best for:** Simplicity with predictable costs

### Pricing Structure

- **Trial:** $5 one-time credit (no credit card)
- **Usage-Based:** Pay per second of actual CPU/memory usage
- **No base fee** after trial credit expires
- **Recent updates (2025):** Reduced network egress and storage costs

### Cost Projections for ColorKit

**Estimation Formula:**

- 512 MB RAM container: ~$5/month running 24/7
- Database (if needed): ~$5-10/month
- Network egress: $0.10/GB (cheaper than Vercel's $0.15/GB)

| Users  | Estimated Cost | Vercel Cost | **Savings**      |
| ------ | -------------- | ----------- | ---------------- |
| 1,000  | **$10-15**     | $20         | **$5-10/month**  |
| 1,500  | **$15-20**     | $67.50      | **$47.50/month** |
| 2,000  | **$20-25**     | $150        | **$125/month**   |
| 5,000  | **$40-50**     | $645        | **$595/month**   |
| 10,000 | **$80-100**    | $1,470      | **$1,370/month** |

### Next.js 15 Support

- ✅ **Native Next.js support** (no adapter needed)
- ✅ Full App Router support
- ✅ Server-side rendering
- ✅ API Routes work out-of-the-box
- ✅ Automatic HTTPS

### Migration Effort

- **Difficulty:** Easy (1-2 hours)
- **Steps:**
  1. Connect GitHub repository
  2. Railway auto-detects Next.js
  3. Set environment variables
  4. Deploy (automatic builds)

### Pros

- ✅ **Simple migration** (easiest alternative)
- ✅ Pay only for actual usage (no idle charges)
- ✅ Native Next.js support (no code changes)
- ✅ Built-in PostgreSQL option (if needed)
- ✅ Preview deployments (like Vercel)

### Cons

- ❌ App stops when trial credit expires (must add payment)
- ❌ Less mature than Vercel (occasional downtime)
- ❌ Smaller edge network
- ❌ Build minutes counted toward usage

### Verdict

**Good balance of simplicity and cost savings.** Save $1,370/month at 10,000 users.

---

## Option 3: Render.com

**Best for:** Production stability with clear pricing

### Pricing Structure

- **Free Tier:**
  - Static sites: Free forever
  - Web services: $0 (but spin down after inactivity)
  - 0.5 GB RAM, 50-second cold start

- **Paid Plans:**
  - **Starter:** $7/month per service (512 MB RAM)
  - **Standard:** $25/month per service (2 GB RAM)
  - **Pro:** $85/month per service (4 GB RAM)
  - **Bandwidth:** $15 per 100 GB (cheaper than Vercel)

### Cost Projections for ColorKit

| Users  | Service Plan   | Bandwidth | Total Cost | Vercel Cost | **Savings**      |
| ------ | -------------- | --------- | ---------- | ----------- | ---------------- |
| 1,000  | Starter ($7)   | ~0.1 GB   | **$7**     | $20         | **$13/month**    |
| 1,500  | Starter ($7)   | ~0.15 GB  | **$7**     | $67.50      | **$60.50/month** |
| 2,000  | Standard ($25) | ~0.2 GB   | **$25**    | $150        | **$125/month**   |
| 5,000  | Standard ($25) | ~0.5 GB   | **$25**    | $645        | **$620/month**   |
| 10,000 | Pro ($85)      | ~1 GB     | **$85**    | $1,470      | **$1,385/month** |

### Next.js 15 Support

- ✅ Full Next.js support (SSR + SSG)
- ✅ App Router compatible
- ✅ Background workers (better than Vercel for jobs)
- ✅ Automatic HTTPS and CDN

### Migration Effort

- **Difficulty:** Easy (1-2 hours)
- **Steps:**
  1. Connect GitHub repository
  2. Select "Web Service" → Next.js
  3. Set build command: `pnpm build`
  4. Set start command: `pnpm start`
  5. Configure environment variables

### Pros

- ✅ **Clear, predictable pricing**
- ✅ No surprise bills (fixed monthly cost)
- ✅ Background workers included (great for webhooks)
- ✅ Persistent storage available
- ✅ PostgreSQL included in higher tiers

### Cons

- ❌ Free tier spins down (50-second cold start)
- ❌ Limited scaling (need to upgrade tiers manually)
- ❌ Fewer edge locations than Cloudflare/Vercel
- ❌ No preview deployments on free tier

### Verdict

**Good for predictable costs and production stability.** Save $1,385/month at 10,000 users.

---

## Option 4: Fly.io

**Best for:** Global edge deployment with fine-grained control

### Pricing Structure

- **No free tier** (as of 2025)
- **Compute:** $0.0027/hour for 256 MB (~$1.94/month if running 24/7)
- **Storage:** $0.15/GB/month
- **Bandwidth:** $0.02/GB (North America/Europe)
- **Minimum:** ~$5/month for basic app

### Cost Projections for ColorKit

| Users  | Compute | Bandwidth     | Storage | Total Cost | Vercel Cost | **Savings**      |
| ------ | ------- | ------------- | ------- | ---------- | ----------- | ---------------- |
| 1,000  | $5      | $2 (~100 GB)  | $1      | **$8**     | $20         | **$12/month**    |
| 2,000  | $10     | $4 (~200 GB)  | $1      | **$15**    | $150        | **$135/month**   |
| 5,000  | $20     | $10 (~500 GB) | $2      | **$32**    | $645        | **$613/month**   |
| 10,000 | $40     | $20 (~1 TB)   | $5      | **$65**    | $1,470      | **$1,405/month** |

### Next.js 15 Support

- ✅ Full Next.js support (runs in containers)
- ✅ App Router compatible
- ✅ Complete Node.js runtime (no limitations)
- ⚠️ Requires Docker configuration

### Migration Effort

- **Difficulty:** Medium (2-3 days)
- **Steps:**
  1. Create `Dockerfile` for Next.js
  2. Install Fly CLI
  3. Run `fly launch` (auto-detects Next.js)
  4. Configure `fly.toml` for regions
  5. Deploy with `fly deploy`

### Pros

- ✅ **Excellent global performance** (edge deployment)
- ✅ Complete control over runtime
- ✅ Multi-region deployment (lower latency)
- ✅ Built-in PostgreSQL (Fly Postgres)
- ✅ No cold starts

### Cons

- ❌ No free tier (costs start immediately)
- ❌ Requires Docker knowledge
- ❌ More complex setup than Railway/Render
- ❌ Bandwidth costs can add up in high-traffic regions

### Verdict

**Good for global apps with technical teams.** Save $1,405/month at 10,000 users.

---

## Option 5: Self-Hosted (Coolify/Dokploy)

**Best for:** Maximum cost savings with technical expertise

### Infrastructure Options

**A) DigitalOcean Droplet**

- 2 vCPU, 4 GB RAM: $24/month
- 50 GB SSD storage included
- 4 TB bandwidth included
- Unlimited apps/services

**B) Hetzner Cloud (Cheaper)**

- 2 vCPU, 4 GB RAM: ~$6/month (CPX21)
- 80 GB SSD storage
- 20 TB bandwidth
- Best value in Europe

**C) AWS EC2 (t3.medium)**

- 2 vCPU, 4 GB RAM: ~$30/month
- Pay-as-you-go bandwidth
- More reliable than budget providers

### Management Platforms

**Coolify (Open Source)**

- Free forever (self-hosted)
- Heroku/Vercel-like interface
- Docker-based deployments
- Automatic HTTPS with Let's Encrypt

**Dokploy (Open Source)**

- Free forever (self-hosted)
- Git-based deployments
- Built-in database management
- Vercel-like convenience

### Cost Projections for ColorKit

| Users  | VPS Cost | Backup/Monitoring | Total Cost  | Vercel Cost | **Savings**            |
| ------ | -------- | ----------------- | ----------- | ----------- | ---------------------- |
| 1,000  | $6-24    | $5                | **$11-29**  | $20         | **Up to $9/month**     |
| 2,000  | $6-24    | $5                | **$11-29**  | $150        | **$121-139/month**     |
| 5,000  | $12-48   | $10               | **$22-58**  | $645        | **$587-623/month**     |
| 10,000 | $24-96   | $20               | **$44-116** | $1,470      | **$1,354-1,426/month** |

**Note:** Self-hosting has fixed costs regardless of traffic (until server capacity is reached).

### Next.js 15 Support

- ✅ Full Next.js support (runs anywhere Node.js runs)
- ✅ Complete control over environment
- ✅ No vendor limitations
- ✅ Can scale vertically (upgrade VPS) or horizontally (add servers)

### Migration Effort

- **Difficulty:** Hard (1-2 weeks)
- **Steps:**
  1. Provision VPS (DigitalOcean/Hetzner)
  2. Install Coolify or Dokploy
  3. Configure DNS and SSL certificates
  4. Set up Git-based deployment
  5. Configure monitoring (Uptime Kuma, etc.)
  6. Set up backups and disaster recovery

### Pros

- ✅ **Maximum cost savings** ($1,426/month saved at 10K users)
- ✅ Complete control over infrastructure
- ✅ No vendor lock-in
- ✅ Can host multiple apps on same server
- ✅ Predictable costs (fixed monthly VPS bill)

### Cons

- ❌ **YOU are responsible for uptime** (no SLA)
- ❌ Requires DevOps knowledge
- ❌ Must handle security updates manually
- ❌ No built-in global CDN (must add Cloudflare)
- ❌ Time investment for maintenance

### Verdict

**Maximum savings for technical teams willing to manage infrastructure.** Save $1,426/month at 10,000 users, but requires ongoing maintenance.

---

## Option 6: Hybrid Approach (Vercel + Cloudflare)

**Best for:** Keeping Vercel for frontend, offloading API to Cloudflare Workers

### Strategy

1. **Vercel:** Host Next.js frontend (static pages, SSR)
2. **Cloudflare Workers:** Host API routes (`/api/*`)
3. **Result:** Reduce Vercel compute costs by 60-80%

### Cost Breakdown (10,000 users)

| Component          | Service            | Cost             | Notes                      |
| ------------------ | ------------------ | ---------------- | -------------------------- |
| Frontend (Next.js) | Vercel             | $20-50/month     | Mostly static, low compute |
| API Routes         | Cloudflare Workers | $5-10/month      | 8M requests/month          |
| Database           | Supabase           | $25/month        | Same as before             |
| **Total**          |                    | **$50-85/month** | vs $1,470 on Vercel alone  |

**Savings: $1,385-1,420/month at 10,000 users**

### Migration Effort

- **Difficulty:** Medium (3-5 days)
- **Steps:**
  1. Extract API routes from Next.js
  2. Rewrite as Cloudflare Workers (TypeScript)
  3. Deploy Workers to Cloudflare
  4. Update Next.js to call Workers API
  5. Keep frontend on Vercel

### Pros

- ✅ **Best of both worlds** (Vercel DX + Cloudflare costs)
- ✅ Massive cost savings (similar to full Cloudflare migration)
- ✅ No changes to frontend code
- ✅ Keep Vercel's preview deployments

### Cons

- ❌ Split infrastructure (two platforms to manage)
- ❌ API must be rewritten for Workers runtime
- ❌ CORS configuration needed between domains
- ❌ More complex deployment pipeline

### Verdict

**Good compromise if you love Vercel's DX but hate the costs.** Save $1,420/month at 10,000 users.

---

## Recommendation Matrix

| Priority               | Recommended Option    | Monthly Cost (10K users) | Savings     | Migration Difficulty |
| ---------------------- | --------------------- | ------------------------ | ----------- | -------------------- |
| **💰 Maximum Savings** | Cloudflare Pages      | $9                       | **$1,461**  | Medium               |
| **⚖️ Balance**         | Railway.app           | $80-100                  | **$1,370**  | Easy                 |
| **🛡️ Stability**       | Render.com            | $85                      | **$1,385**  | Easy                 |
| **🌍 Global Edge**     | Fly.io                | $65                      | **$1,405**  | Medium               |
| **🔧 DIY**             | Self-Hosted (Coolify) | $44-116                  | **$1,354+** | Hard                 |
| **🤝 Hybrid**          | Vercel + Cloudflare   | $50-85                   | **$1,385**  | Medium               |

---

## My Specific Recommendation for ColorKit

### ⭐ **Primary Recommendation: Cloudflare Pages + Workers**

**Why:**

1. **Massive cost savings:** $1,461/month at 10,000 users (99.4% reduction!)
2. **Free bandwidth:** Your extension makes many small API calls → Cloudflare's unlimited bandwidth is perfect
3. **Edge performance:** 300+ global locations → faster for international users
4. **Generous free tier:** Can stay free until ~3,000 users
5. **Supabase compatibility:** Works perfectly with Supabase (just API calls)

**Migration Plan (2-3 days):**

```bash
# Day 1: Setup and Testing
- Install @cloudflare/next-on-pages
- Update next.config.js
- Test locally with Wrangler CLI
- Verify API routes work

# Day 2: Deployment
- Deploy to Cloudflare Pages
- Test staging environment
- Update environment variables
- Verify Paddle webhooks

# Day 3: Production Cutover
- Update DNS (switch from Vercel to Cloudflare)
- Monitor for 24 hours
- Decommission Vercel (save $20/month immediately)
```

**Risk Mitigation:**

- Test thoroughly on staging before cutover
- Keep Vercel running for 1 week as backup
- Use Cloudflare's rollback feature if issues arise

---

### 🥈 **Fallback Recommendation: Railway.app**

**If Cloudflare migration seems too risky:**

- Railway requires almost no code changes
- Still saves $1,370/month at 10,000 users
- Can migrate in 1-2 hours (vs 2-3 days for Cloudflare)

**When to choose Railway over Cloudflare:**

- Limited development time
- Risk-averse (want guaranteed Next.js compatibility)
- Need native Node.js built-ins (no runtime limitations)

---

## Action Items

### Immediate (This Week)

1. ✅ **Research Cloudflare Pages + Workers** (1-2 hours reading docs)
2. ✅ **Test basic Next.js deployment on Cloudflare** (staging environment)
3. ✅ **Verify Supabase API calls work from Workers**

### Short-Term (Next 2 Weeks)

1. ⏳ **Migrate API routes to Cloudflare Workers** (if greenlit)
2. ⏳ **Set up Cloudflare Pages for frontend**
3. ⏳ **Test Paddle webhooks on Cloudflare**

### Long-Term (Next Month)

1. 📅 **Full production migration to Cloudflare**
2. 📅 **Monitor costs for 30 days**
3. 📅 **Decommission Vercel and pocket $1,461/month savings**

---

## Cost Comparison Summary (All Options)

| Platform                  | Cost @ 1K Users | Cost @ 10K Users | **Total Savings vs Vercel** |
| ------------------------- | --------------- | ---------------- | --------------------------- |
| **Vercel (Current)**      | $20             | $1,470           | Baseline                    |
| **Cloudflare Pages**      | $0              | $9               | **$1,461/month** ⭐         |
| **Railway.app**           | $10-15          | $80-100          | **$1,370/month**            |
| **Render.com**            | $7              | $85              | **$1,385/month**            |
| **Fly.io**                | $8              | $65              | **$1,405/month**            |
| **Self-Hosted (Coolify)** | $11-29          | $44-116          | **$1,354+/month**           |
| **Hybrid (Vercel+CF)**    | $20             | $50-85           | **$1,385/month**            |

---

## Frequently Asked Questions

### Q: Will I lose Vercel's preview deployments?

**A:** Most alternatives offer similar features:

- ✅ Cloudflare Pages: Yes, full preview deployments
- ✅ Railway: Yes, preview environments
- ✅ Render: Yes, preview environments (paid plans)
- ❌ Self-hosted: Must configure manually (e.g., with Coolify)

### Q: What about build times?

**A:** Build times are comparable:

- Vercel: ~2-3 minutes
- Cloudflare: ~2-4 minutes
- Railway: ~3-5 minutes
- Render: ~3-5 minutes

### Q: Is Cloudflare's free tier really unlimited bandwidth?

**A:** YES! Static assets and Workers requests have unlimited bandwidth on all plans (including free). This is Cloudflare's biggest advantage.

### Q: Can I switch back to Vercel if needed?

**A:** Yes! All alternatives allow you to switch back by:

1. Keeping your GitHub repo unchanged
2. Re-deploying to Vercel
3. Updating DNS

**Migration is reversible** in all cases (usually within 1-2 hours).

---

**Document Owner:** ColorKit Development Team
**Next Review:** After reaching 1,500 users (when Vercel costs spike to $67.50/month)
**Recommendation:** Start testing Cloudflare Pages NOW to avoid future cost overruns
